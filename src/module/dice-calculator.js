import * as keymaps from "./maps/_module.js";

import { DiceTrayPopOut } from "./dice-tray-popout.js";
import { KEYS } from "./maps/_keys.js";
import { registerSettings } from "./settings.js";

// Initialize module
Hooks.once("init", () => {
	loadTemplates(["modules/dice-calculator/templates/tray.html"]);
});

Hooks.once("i18nInit", () => {
	const newMaps = foundry.utils.deepClone(keymaps);

	Hooks.callAll("dice-calculator.keymaps", newMaps, newMaps.Template);
	const supportedSystemMaps = Object.keys(newMaps).join("|");
	const systemMapsRegex = new RegExp(`^(${supportedSystemMaps})$`);
	const providerStringMaps = getProviderString(systemMapsRegex) || "Template";
	CONFIG.DICETRAY = new newMaps[providerStringMaps]();

	registerSettings();
	game.keybindings.register("dice-calculator", "popout", {
		name: "DICE_TRAY.KEYBINGINDS.popout.name",
		onDown: async () => {
			await togglePopout();
			if (game.settings.get("dice-calculator", "popout") === "none") return;
			const tool = ui.controls.control.tools.diceTray;
			if (tool) {
				tool.active = !tool.active;
				ui.controls.render();
			}
		}
	});
});

Hooks.once("ready", () => {
	if (game.settings.get("dice-calculator", "autoOpenPopout")) togglePopout();
});

function getProviderString(regex) {
	const id = game.system.id;
	if (id in KEYS) {
		return KEYS[id];
	} else if (regex.test(id)) {
		return id;
	}
	return "";
}

async function togglePopout() {
	CONFIG.DICETRAY.popout ??= new DiceTrayPopOut();
	if (CONFIG.DICETRAY.popout.rendered) await CONFIG.DICETRAY.popout.close({ animate: false });
	else await CONFIG.DICETRAY.popout.render(true);
}

Hooks.on("renderChatLog", async (chatlog, html, data) => {
	// Prepare the dice tray for rendering.
	let chatForm = html.querySelector(".chat-form");
	const options = {
		dicerows: game.settings.get("dice-calculator", "diceRows"),
	};

	const content = await renderTemplate("modules/dice-calculator/templates/tray.html", options);

	if (content.length > 0) {
		const trayElement = document.createElement("div");
		trayElement.innerHTML = content;
		chatForm.insertAdjacentElement("afterend", trayElement);

		const diceButtons = trayElement.querySelectorAll(".dice-tray__button");
		diceButtons.forEach((button) => {
			button.addEventListener("click", (event) => {
				event.preventDefault();
				const dataset = event.currentTarget.dataset;
				CONFIG.DICETRAY.updateChatDice(dataset, "add", html);
			});

			button.addEventListener("contextmenu", (event) => {
				event.preventDefault();
				const dataset = event.currentTarget.dataset;
				CONFIG.DICETRAY.updateChatDice(dataset, "sub", html);
			});
		});
		// Handle drag events.
		trayElement.querySelectorAll(".dice-tray__button, .dice-tray__ad").forEach((button) => {
			button.addEventListener("dragstart", (event) => {
				const dataset = event.currentTarget.dataset;
				const dragData = JSON.parse(JSON.stringify(dataset));
				if (dragData?.formula) {
					// Grab the modifier, if any.
					const parentElement = event.currentTarget.closest(".dice-tray");
					const modInput = parentElement.querySelector(".dice-tray__input");
					const mod = modInput.value;

					// Handle advantage/disadvantage.
					if (dragData.formula === "kh") {
						dragData.formula = "2d20kh";
					} else if (dragData.formula === "kl") {
						dragData.formula = "2d20kl";
					}

					// Grab the count, if any.
					const qty = button.querySelector(".dice-tray__flag").textContent;
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
		});

		// Handle drop for dice.
		document.documentElement.addEventListener("drop", (event) => {
			// This try-catch is needed because it conflicts with other modules
			try {
				const data = JSON.parse(event.originalEvent.dataTransfer.getData("text/plain"));
				// If there's a formula, trigger the roll.
				if (data?.origin === "dice-calculator" && data?.formula) {
					new Roll(data.formula).toMessage();
					event.stopImmediatePropagation();
				}
			} catch(err) {
				// Unable to Parse Data, Return Event
				return event;
			}
		});

		// Handle correcting the modifier math if it's null.
		const diceTrayInput = trayElement.querySelector(".dice-tray__input");
		diceTrayInput.addEventListener("input", (event) => {
			let modVal = Number(event.target.value);
			modVal = Number.isNaN(modVal) ? 0 : modVal;
			event.target.value = modVal;
			CONFIG.DICETRAY.applyModifier(html);
		});

		// Handle changing the modifier with the scroll well.
		diceTrayInput.addEventListener("wheel", (event) => {
			event.preventDefault();
			const diff = event.deltaY < 0 ? 1 : -1;
			let modVal = Number(diceTrayInput.value);
			modVal = Number.isNaN(modVal) ? 0 : modVal;
			diceTrayInput.value = modVal + diff;
			CONFIG.DICETRAY.applyModifier(html);
		});

		// Handle +/- buttons near the modifier input.
		const mathButtons = trayElement.querySelectorAll("button.dice-tray__math");
		mathButtons.forEach((button) => {
			button.addEventListener("click", (event) => {
				event.preventDefault();
				let mod_val = Number(html.querySelector('input[name="dice.tray.modifier"]').value);
				mod_val = Number.isNaN(mod_val) ? 0 : mod_val;

				switch (event.currentTarget.dataset.formula) {
					case "+1":
						mod_val += 1;
						break;
					case "-1":
						mod_val -= 1;
						break;
					default:
						break;
				}

				html.querySelector('input[name="dice.tray.modifier"]').value = mod_val;
				CONFIG.DICETRAY.applyModifier(html);
			});
		});
		CONFIG.DICETRAY.applyLayout(html);
	}
});

Hooks.on("getSceneControlButtons", (controls) => {
	const popout = game.settings.get("dice-calculator", "popout");
	if (popout === "none") return;
	const autoOpenPopout = game.settings.get("dice-calculator", "autoOpenPopout");
	const addButton = (control) => {
		control.tools.diceTray = {
			name: "diceTray",
			title: "Dice Tray",
			icon: "fas fa-dice-d20",
			onChange: () => togglePopout(),
			active: CONFIG.DICETRAY.popout?.rendered || (!game.ready && autoOpenPopout),
			toggle: true,
		};
	};
	if (popout === "tokens") addButton(controls.tokens);
	else Object.keys(controls).forEach((c) => addButton(controls[c]));
});

Hooks.on("chatMessage", () => CONFIG.DICETRAY.reset());
