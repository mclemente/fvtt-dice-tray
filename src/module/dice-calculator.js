import * as keymaps from "./maps/_module.js";

import { DiceTrayPopOut } from "./dice-tray-popout.js";
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
	if (game.settings.get("dice-calculator", "enableDiceTray")) {
		Hooks.on("dice-calculator.forceRender", () => CONFIG.DICETRAY.render());
		Hooks.once("renderChatLog", () => CONFIG.DICETRAY.render());
		Hooks.on("renderChatLog", (chatlog, html, data, opt) => {
			if (!chatlog.isPopout) return;
			moveDiceTray();
		});
		Hooks.on("closeChatLog", (chatlog, html, data, opt) => {
			if (!chatlog.isPopout) return;
			moveDiceTray();
		});
		Hooks.on("activateChatLog", (chatlog) => {
			if (ui.chat.popout?.rendered && !ui.chat.isPopout) return;
			moveDiceTray();
		});
		Hooks.on("deactivateChatLog", (chatlog) => {
			if (ui.chat.popout?.rendered && !ui.chat.isPopout) return;
			moveDiceTray();
		});
		Hooks.on("collapseSidebar", (sidebar, expanded) => {
			if (ui.chat.popout?.rendered && !ui.chat.isPopout) return;
			moveDiceTray();
		});
	}
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

function moveDiceTray() {
	const inputElement = document.getElementById("chat-message");
	inputElement.insertAdjacentElement("afterend", CONFIG.DICETRAY.element);
}

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

// Called when a message is sent through chat
Hooks.on("chatMessage", () => CONFIG.DICETRAY.reset());
