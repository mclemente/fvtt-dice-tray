import { DiceRowSettings } from "./forms/DiceRowSettings";

export function registerSettings() {
	game.settings.registerMenu("dice-calculator", "DiceRowSettings", {
		name: "DICE_TRAY.SETTINGS.DiceRowSettings",
		label: "DICE_TRAY.SETTINGS.DiceRowSettings",
		icon: "fas fa-cogs",
		type: DiceRowSettings,
		restricted: true,
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

	game.settings.register("dice-calculator", "popout", {
		name: "DICE_TRAY.SETTINGS.popout.name",
		hint: "DICE_TRAY.SETTINGS.popout.hint",
		scope: "user",
		config: true,
		default: "none",
		choices: {
			none: "",
			tokens: game.i18n.localize("CONTROLS.GroupToken"),
			all: game.i18n.localize("DICE_TRAY.SETTINGS.popout.options.all"),
		},
		type: String,
		onChange: async () => await ui.controls.render({ reset: true })
	});

	game.settings.register("dice-calculator", "autoOpenPopout", {
		name: "DICE_TRAY.SETTINGS.autoOpenPopout.name",
		hint: "DICE_TRAY.SETTINGS.autoOpenPopout.hint",
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register("dice-calculator", "popoutPosition", {
		scope: "user",
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
