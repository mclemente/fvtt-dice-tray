import { DiceRowSettings } from "./forms/DiceRowSettings";
import { DiceTrayGeneralSettings } from "./forms/DiceTraySettings";

export function registerSettings() {
	game.settings.registerMenu("dice-calculator", "GeneralSettings", {
		name: "DICE_TRAY.SETTINGS.GeneralSettings",
		label: "DICE_TRAY.SETTINGS.GeneralSettings",
		icon: "fas fa-cogs",
		type: DiceTrayGeneralSettings,
	});
	game.settings.registerMenu("dice-calculator", "DiceRowSettings", {
		name: "DICE_TRAY.SETTINGS.DiceRowSettings",
		label: "DICE_TRAY.SETTINGS.DiceRowSettings",
		icon: "fas fa-cogs",
		type: DiceRowSettings,
		restricted: true,
	});

	game.settings.register("dice-calculator", "enableDiceCalculator", {
		name: game.i18n.localize("DICE_TRAY.SETTINGS.enableDiceCalculator.name"),
		hint: game.i18n.localize("DICE_TRAY.SETTINGS.enableDiceCalculator.hint"),
		scope: "world",
		config: false,
		default: true,
		type: Boolean,
		requiresReload: true
	});

	game.settings.register("dice-calculator", "enableDiceTray", {
		name: game.i18n.localize("DICE_TRAY.SETTINGS.enableDiceTray.name"),
		hint: game.i18n.localize("DICE_TRAY.SETTINGS.enableDiceTray.hint"),
		scope: "world",
		config: false,
		default: true,
		type: Boolean,
		requiresReload: true
	});

	game.settings.register("dice-calculator", "hideAdv", {
		name: game.i18n.localize("DICE_TRAY.SETTINGS.hideAdv.name"),
		hint: game.i18n.localize("DICE_TRAY.SETTINGS.hideAdv.hint"),
		scope: "world",
		config: CONFIG.DICETRAY.constructor.name === "TemplateDiceMap",
		default: false,
		type: Boolean,
		requiresReload: true
	});

	// Menu Settings

	game.settings.register("dice-calculator", "diceRows", {
		scope: "world",
		config: false,
		default: CONFIG.DICETRAY.dice,
		type: Array,
	});

	game.settings.register("dice-calculator", "rolls", {
		scope: "world",
		config: false,
		default: [],
		type: Array,
	});

	game.settings.register("dice-calculator", "popout", {
		name: "DICE_TRAY.SETTINGS.popout.name",
		hint: "DICE_TRAY.SETTINGS.popout.hint",
		scope: "client",
		config: true,
		default: "none",
		choices: {
			none: "",
			tokens: game.i18n.localize("CONTROLS.GroupToken"),
			all: game.i18n.localize("DICE_TRAY.SETTINGS.popout.options.all"),
		},
		type: String,
		onChange: () => ui.controls.initialize()
	});

	game.settings.register("dice-calculator", "autoOpenPopout", {
		name: "DICE_TRAY.SETTINGS.autoOpenPopout.name",
		hint: "DICE_TRAY.SETTINGS.autoOpenPopout.hint",
		scope: "client",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register("dice-calculator", "popoutPosition", {
		scope: "client",
		config: false,
		default: {},
		type: Object
	});

	for (const [key, data] of Object.entries(CONFIG.DICETRAY.settings)) {
		game.settings.register("dice-calculator", key, foundry.utils.mergeObject(
			{
				scope: "world",
				config: true
			},
			data
		));
	}
}
