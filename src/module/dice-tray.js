import { DiceCalculatorDialog } from "./dice-calculator-dialog";
import { KEYS } from "./maps/_keys.js";
import * as keymaps from "./maps/_module.js";
import { registerSettings } from "./settings.js";

// Initialize module
Hooks.once("init", () => {
	registerSettings();
});

Hooks.once("i18nInit", () => {
	const newMaps = deepClone(keymaps);
	Hooks.callAll("dice-tray.keymaps", newMaps, newMaps.Template);
	const supportedSystems = Object.keys(newMaps).join("|");
	const systemsRegex = new RegExp(`^(${supportedSystems})$`);
	let providerString = "Template";
	if (game.system.id in KEYS) {
		providerString = KEYS[game.system.id];
	} else if (systemsRegex.test(game.system.id)) {
		providerString = game.system.id;
	}
	CONFIG.DICETRAY = new newMaps[providerString]();
});

Hooks.on("renderSidebarTab", async (app, html, data) => {
	// Exit early if necessary;
	if (app.tabName !== "chat") return;
	if (game.settings.get("dice-tray", "enableDiceTray")) {
		// Prepare the dice tray for rendering.
		let $chat_form = html.find("#chat-form");
		const template = "modules/dice-tray/templates/tray.html";
		const options = {
			dicerows: CONFIG.DICETRAY.dice
		};

		const content = await renderTemplate(template, options);

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

					dragData.icon = dragData.formula;

					// Grab the count, if any.
					const qty = $(event.currentTarget).find(".dice-tray__flag").text();
					if (qty.length > 0 && !dragData.formula.includes("k")) {
						dragData.formula = `${qty}${dataset.formula}`;
					}

					// Apply the modifier.
					if (mod && mod !== "0") {
						dragData.formula += ` + ${mod}`;
					}
					dragData.origin = "dice-tray";
					event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify(dragData));
				}
			});

			// Handle drop for dice.
			html.find("#chat-message").on("drop", async (event) => {
				let data = JSON.parse(event.originalEvent.dataTransfer.getData("text/plain"));
				// If there's a formula, trigger the roll.
				if (data?.origin === "dice-tray" && data?.formula) {
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
	if (game.settings.get("dice-tray", "enableDiceCalculator")) {
		const templatePath = "modules/dice-calculator/templates/calculator.html";
		const diceIconSelector = "#chat-controls .chat-control-icon .fa-dice-d20";
		$(diceIconSelector).addClass("dice-calculator-toggle");

		// Render a modal on click.
		$(document).on("click", diceIconSelector, (ev) => {
			ev.preventDefault();

			let $dialog = $(".dialog--dice-calculator");

			if ($dialog.length < 1) {
				let controlledTokens = canvas.tokens.controlled;
				let actor = controlledTokens.length > 0 ? controlledTokens[0].actor : false;

				let abilities = false;
				let attributes = false;
				let customButtons = [];

				let whitelist = {};
				whitelist[game.system.id] = {
					abilities: [],
					attributes: []
				};

				if (game.system.id == "dnd5e" || game.system.id == "archmage") {
					whitelist[game.system.id].flags = { adv: true };
				}

				if (actor !== false) {
					whitelist.dnd5e = {
						flags: {
							adv: true
						},
						abilities: [
							"str",
							"dex",
							"con",
							"int",
							"wis",
							"cha"
						],
						attributes: [
							"init",
							"prof",
						],
						custom: {
							attributes: {
								profHalf: {
									label: "prof_half",
									name: "1/2 Prof",
									formula: actor.data.data?.attributes?.prof !== undefined ? Math.floor(actor.data.data.attributes.prof / 2) : 0
								},
								levelHalf: {
									label: "level_half",
									name: "1/2 Level",
									formula: actor.data.data?.details?.level !== undefined ? Math.floor(actor.data.data.details.level?.value ?? actor.data.data.details.level / 2) : 0
								},
								profDouble: {
									label: "prof_double",
									name: "2x Prof",
									formula: actor.data.data?.attributes?.prof !== undefined ? "(2 * @attr.prof)" : 0
								}
							}
						}
					};
					whitelist.pf2e = {
						flags: {
							adv: false
						},
						abilities: [
							"str",
							"dex",
							"con",
							"int",
							"wis",
							"cha"
						],
						attributes: [
							"perception",
						],
						custom: {
							attributes: {
								profTrained: {
									label: "prof_t",
									name: "Trained",
									formula: "(2 + @details.level.value)"
								},
								profExpert: {
									label: "prof_e",
									name: "Expert",
									formula: "(4 + @details.level.value)"
								},
								profMaster: {
									label: "prof_m",
									name: "Master",
									formula: "(6 + @details.level.value)"
								},
								profLegendary: {
									label: "prof_l",
									name: "Legendary",
									formula: "(8 + @details.level.value)"
								}
							}
						}
					};
					whitelist.dcc = {
						flags: {
							adv: false
						},
						abilities: [
							"str",
							"agl",
							"sta",
							"per",
							"int",
							"lck"
						],
						attributes: [],
						custom: {}
					};

					// Let systems or other modules modify the buttons whitelist.
					Hooks.call("dcCalcWhitelist", whitelist, actor);

					// Build abilities.
					abilities = [];
					for (let prop in actor.data.data.abilities) {
						if (whitelist[game.system.id].abilities.includes(prop)) {
							let formula = "";
							if (actor.data.data.abilities[prop].mod !== undefined) {
								formula = `@abil.${prop}.mod`;
							}
							else if (actor.data.data.abilities[prop].value !== undefined) {
								formula = `@abil.${prop}.value`;
							}
							else {
								formula = `@abil.${prop}`;
							}
							abilities.push({
								label: prop,
								name: prop,
								formula: formula
							});
						}
					}

					// Build attributes.
					attributes = [];

					// Add level for systems that place it in details.
					if (actor.data.data.attributes !== undefined) {
						if (actor.data.data.attributes.level === undefined && actor.data.data?.details?.level !== undefined) {
							attributes.push({
								label: "level",
								name: "level",
								formula: actor.data.data.details.level?.value ? "@details.level.value" : "@details.level"
							});
						}

						for (let prop in actor.data.data.attributes) {
							if (whitelist[game.system.id].attributes.includes(prop)) {
								let formula = "";
								if (actor.data.data.attributes[prop].mod !== undefined) {
									formula = `@attr.${prop}.mod`;
								}
								else if (actor.data.data.attributes[prop].value !== undefined) {
									formula = `@attr.${prop}.value`;
								}
								else {
									formula = `@attr.${prop}`;
								}
								attributes.push({
									label: prop,
									name: prop,
									formula: formula
								});
							}
						}
					}

					// Add custom attributes.
					customButtons = [];
					if (whitelist[game.system.id].custom !== undefined) {
						// Iterate through the kinds of properties, such as 'abilities' or
						// 'attributes'.
						for (let customProps in whitelist[game.system.id].custom) {
							// Loop through the properties in that attribute.
							for (let prop in whitelist[game.system.id].custom[customProps]) {
								let customButton = {
									label: prop,
									name: whitelist[game.system.id].custom[customProps][prop].name,
									formula: whitelist[game.system.id].custom[customProps][prop].formula
								};

								if (customProps === "abilities") {
									// Replace existing.
									let updated = false;
									abilities.find((element, index) => {
										if (element.label !== undefined && element.label === prop) {
											abilities[index] = customButton;
											updated = true;
										}
									});
									// Otherwise, append.
									if (!updated) {
										abilities.push(customButton);
									}
								}
								else if (customProps === "attributes") {
									// Replace existing.
									let updated = false;
									attributes.find((element, index) => {
										if (element.label !== undefined && element.label === prop) {
											attributes[index] = customButton;
											updated = true;
										}
									});
									// Otherwise, append.
									if (!updated) {
										attributes.push(customButton);
									}
								}
								else {
									customButtons.push(customButton);
								}
							}
						}
					}
				}

				// Add funky dice buttons
				if (game.system.id === "dcc") {
					const funkyDice = [
						{
							label: "d3",
							name: "d3",
							formula: "d3"
						},
						{
							label: "d5",
							name: "d5",
							formula: "d5"
						},
						{
							label: "d7",
							name: "d7",
							formula: "d7"
						},
						{
							label: "d14",
							name: "d14",
							formula: "d14"
						},
						{
							label: "d16",
							name: "d16",
							formula: "d16"
						},
						{
							label: "d24",
							name: "d24",
							formula: "d24"
						},
						{
							label: "d30",
							name: "d30",
							formula: "d30"
						}
					];
					customButtons = funkyDice.concat(customButtons);
				}

				// Build the template.
				let templateData = {
					rolls: Cookies.get("diceTray.diceFormula"),
					abilities: abilities,
					attributes: attributes,
					customButtons: customButtons,
					adv: whitelist[game.system.id].flags !== undefined ? whitelist[game.system.id].flags.adv : false
				};

				// Render the modal.
				renderTemplate(templatePath, templateData).then((dlg) => {
					new DiceCalculatorDialog({
						title: game.i18n.localize("DICE_TRAY.RollDice"),
						content: dlg,
						buttons: {
							roll: {
								label: game.i18n.localize("DICE_TRAY.Roll"),
								callback: () => dcRollDice(actor)
							}
						}
					}, { top: ev.clientY - 80 }).render(true);
				});
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
function dcRollDice(actor = false) {
	// Retrieve the formula.
	let formula = $(".dice-calculator textarea").val();
	// Replace shorthand.
	formula = formula.replace(/@abil\./g, "@abilities.").replace(/@attr\./g, "@attributes.");
	// Roll the dice!
	let data = actor ? actor.getRollData() : {};
	let r = new Roll(formula, data);
	r.toMessage();
	// Throw a warning to the user if they tried to use a stat without a token.
	// If there's no actor and the user tried to use a stat, warn them.
	if (!actor && formula.includes("@")) {
		ui.notifications.warn("A token attribute was specified in your roll, but no token was selected.");
	}
	// Store it for later.
	let formulaArray = Cookies.get("diceTray.diceFormula");
	formulaArray = !formulaArray ? [] : formulaArray;
	// Only update if this is a new formula.
	if ($.inArray(formula, formulaArray) === -1) {
		formulaArray.unshift(formula);
		formulaArray = formulaArray.slice(0, 10);
		Cookies.set("diceTray.diceFormula", formulaArray, { expires: 7 });
	}
}
