import * as diceCalculators from "./calculator-buttons/_module.js";
import * as keymaps from "./maps/_module.js";

import { DiceCalculatorDialog } from "./dice-calculator-dialog.js";
import { KEYS } from "./maps/_keys.js";
import { preloadTemplates } from "./preloadTemplates.js";
import { registerSettings } from "./settings.js";

// Initialize module
Hooks.once("init", () => {
	registerSettings();
	preloadTemplates();
});

Hooks.once("i18nInit", () => {
	const keys = deepClone(KEYS);
	const newMaps = deepClone(keymaps);
	const newCalculators = deepClone(diceCalculators);

	Hooks.callAll("dice-calculator.keymaps", newMaps, newMaps.Template, keys);
	const supportedSystemMaps = Object.keys(newMaps).join("|");
	const systemMapsRegex = new RegExp(`^(${supportedSystemMaps})$`);
	const providerStringMaps = getProviderString(systemMapsRegex, keys) || "Template";
	CONFIG.DICETRAY = new newMaps[providerStringMaps]();

	Hooks.callAll("dice-calculator.calculator", newCalculators, keys);
	const supportedSystemCalculators = Object.keys(newCalculators).join("|");
	const systemCalculatorsRegex = new RegExp(`^(${supportedSystemCalculators})$`);
	const providerStringCalculators = getProviderString(systemCalculatorsRegex, keys);

	if (providerStringCalculators) {
		CONFIG.DICETRAY.calculator = new newCalculators[providerStringCalculators]();
	}
});

function getProviderString(regex, keys) {
	const id = game.system.id;
	if (id in keys) {
		return keys[id];
	} else if (regex.test(id)) {
		return id;
	}
	return "";
}

Hooks.on("renderSidebarTab", async (app, html, data) => {
	// Exit early if necessary;
	if (app.tabName !== "chat") return;
	const enableTray = game.user.getFlag("dice-calculator", "enableDiceTray") ?? game.settings.get("dice-calculator", "enableDiceTray");
	if (enableTray) {
		// Prepare the dice tray for rendering.
		let $chat_form = html.find("#chat-form");
		const options = {
			dicerows: CONFIG.DICETRAY.dice
		};

		const content = await renderTemplate("modules/dice-calculator/templates/tray.html", options);

		if (content.length > 0) {
			let $content = $(content);
			$chat_form.after($content);
			$content.find(".dice-tray__button").on("click", (event) => {
				event.preventDefault();
				let dataset = event.currentTarget.dataset;

				CONFIG.DICETRAY.updateChatDice(dataset, "add", html);
			});
			$content.find(".dice-tray__button").on("contextmenu", (event) => {
				event.preventDefault();
				let dataset = event.currentTarget.dataset;

				CONFIG.DICETRAY.updateChatDice(dataset, "sub", html);
			});
			// Handle drag events.
			$content.find(".dice-tray__button").attr("draggable", true);
			$content.on("dragstart", ".dice-tray__button, .dice-tray__ad", (event) => {
				const dataset = event.currentTarget.dataset;
				const dragData = JSON.parse(JSON.stringify(dataset));
				if (dragData?.formula) {
					// Grab the modifier, if any.
					const $parent = $(event.currentTarget).parents(".dice-tray");
					const $modInput = $parent.find(".dice-tray__input");
					const mod = $modInput.val();

					// Handle advantage/disadvantage.
					if (dragData.formula === "kh") {
						dragData.formula = "2d20kh";
					} else if (dragData.formula === "kl") {
						dragData.formula = "2d20kl";
					}

					// Grab the count, if any.
					const qty = $(event.currentTarget).find(".dice-tray__flag").text();
					if (qty.length > 0 && !dragData.formula.includes("k")) {
						dragData.formula = `${qty}${dataset.formula}`;
					}

					// Apply the modifier.
					if (mod && mod !== "0") {
						dragData.formula += ` + ${mod}`;
					}
					dragData.origin = "dice-calculator";
					event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify(dragData));
				}
			});

			// Handle drop for dice.
			$("html").on("drop", async (event) => {
				let data = JSON.parse(event.originalEvent.dataTransfer.getData("text/plain"));
				// If there's a formula, trigger the roll.
				if (data?.origin === "dice-calculator" && data?.formula) {
					new Roll(data.formula).toMessage();
				}
			});

			// Handle correcting the modifier math if it's null.
			$content.find(".dice-tray__input").on("input", (event) => {
				// event.preventDefault();
				let $self = $(event.currentTarget);
				let mod_val = $self.val();

				mod_val = Number(mod_val);
				mod_val = Number.isNaN(mod_val) ? 0 : mod_val;

				$self.val(mod_val);
				CONFIG.DICETRAY.applyModifier(html);
			})
				// Handle changing the modifier with the scroll well.
				.on("wheel", (event) => {
					let $self = $(event.currentTarget);
					let diff = event.originalEvent.deltaY < 0 ? 1 : -1;
					let mod_val = $self.val();
					mod_val = Number.isNaN(mod_val) ? 0 : Number(mod_val);
					$self.val(mod_val + diff);
					CONFIG.DICETRAY.applyModifier(html);
				});
			// Handle +/- buttons near the modifier input.
			$content.find("button.dice-tray__math").on("click", (event) => {
				event.preventDefault();
				let dataset = event.currentTarget.dataset;
				let mod_val = $('input[name="dice.tray.modifier"]').val();

				mod_val = Number(mod_val);
				mod_val = Number.isNaN(mod_val) ? 0 : mod_val;

				switch (dataset.formula) {
				case "+1":
					mod_val = mod_val + 1;
					break;

				case "-1":
					mod_val = mod_val - 1;
					break;

				default:
					break;
				}
				$('input[name="dice.tray.modifier"]').val(mod_val);
				CONFIG.DICETRAY.applyModifier(html);
			});
			CONFIG.DICETRAY.applyLayout(html);
		}
	}
	const enableCalculator = game.user.getFlag("dice-calculator", "enableDiceCalculator") ?? game.settings.get("dice-calculator", "enableDiceCalculator");
	if (enableCalculator) {
		// Render a modal on click.
		const diceIconSelector = html.find("#chat-controls .chat-control-icon i");
		diceIconSelector.addClass("dice-calculator-toggle");
		diceIconSelector.on("click", async (event) => {
			event.preventDefault();

			let $dialog = $(".dialog--dice-calculator");

			if ($dialog.length < 1) {
				let controlledTokens = canvas?.tokens?.controlled ?? [];
				let actor = controlledTokens.length > 0 ? controlledTokens[0].actor : null;

				let { abilities, attributes, customButtons } = CONFIG.DICETRAY?.calculator?.getData(actor)
					?? {
						abilities: [],
						attributes: [],
						customButtons: []
					};

				// Build the template.
				const rolls = game.settings.get("dice-calculator", "rolls");
				let templateData = {
					rolls,
					abilities: abilities,
					attributes: attributes,
					customButtons: customButtons,
					adv: CONFIG.DICETRAY?.calculator?.adv || false
				};

				// Render the modal.
				const content = await renderTemplate("modules/dice-calculator/templates/calculator.html", templateData);
				new DiceCalculatorDialog({
					title: game.i18n.localize("DICE_TRAY.RollDice"),
					content,
					buttons: {
						roll: {
							label: game.i18n.localize("DICE_TRAY.Roll"),
							callback: () => dcRollDice(actor)
						}
					}
				}, { top: event.clientY - 80 }).render(true);
			}
			else {
				$dialog.remove();
			}
		});
	}
});

/**
 * Helper function to roll dice formula and output to chat.
 * @param {object} actor The actor to use for rolls, if any.
 */
function dcRollDice(actor = null) {
	// Retrieve the formula.
	let formula = $(".dice-calculator textarea").val();
	// Replace shorthand.
	formula = formula.replace(/@abil\./g, "@abilities.").replace(/@attr\./g, "@attributes.");

	// Roll the dice!
	let data = actor ? actor.getRollData() : {};
	let roll = new Roll(formula, data);
	roll.toMessage();

	// Throw a warning to the user if they tried to use a stat without a token.
	// If there's no actor and the user tried to use a stat, warn them.
	if (!actor && formula.includes("@")) {
		ui.notifications.warn("A token attribute was specified in your roll, but no token was selected.");
	}

	// Store it for later.
	let formulaArray = game.settings.get("dice-calculator", "rolls");
	// Only update if this is a new formula.
	if ($.inArray(formula, formulaArray) === -1) {
		formulaArray.unshift(formula);
		formulaArray = formulaArray.slice(0, 10);
		game.settings.set("dice-calculator", "rolls", formulaArray);
	}
}
