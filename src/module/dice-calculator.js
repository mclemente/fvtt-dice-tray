import * as keymaps from "./maps/_module.js";

import { DiceTrayPopOut } from "./dice-tray-popout.js";
import { DiceRowSettings } from "./forms/DiceRowSettings.js";
import { KEYS } from "./maps/_keys.js";
import { registerSettings } from "./settings.js";

// Initialize module
Hooks.once("init", () => {
	foundry.applications.handlebars.loadTemplates(["modules/dice-calculator/templates/tray.html"]);
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
	const enableTray = game.settings.get("dice-calculator", "enableDiceTray");
	if (!enableTray) return;
	// Prepare the dice tray for rendering.
	let chatForm = html.querySelector(".chat-form");
	const options = {
		dicerows: game.settings.get("dice-calculator", "diceRows"),
		settings: DiceRowSettings.settingsKeys.reduce((obj, key) => {
			obj[key] = game.settings.get("dice-calculator", key);
			return obj;
		}, {})
	};

	const content = await foundry.applications.handlebars.renderTemplate("modules/dice-calculator/templates/tray.html", options);

	if (content.length > 0) {
		chatForm.insertAdjacentHTML("afterend", content);
		CONFIG.DICETRAY.applyListeners(chatForm.nextElementSibling);
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

// Called when a message is sent through chat (be it Enter key or the Roll button)
Hooks.on("chatMessage", () => CONFIG.DICETRAY.reset());
