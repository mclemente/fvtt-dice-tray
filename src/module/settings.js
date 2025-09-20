import { DiceRowSettings } from "./forms/DiceRowSettings";

export function registerSettings() {
	game.settings.registerMenu("dice-calculator", "DiceRowSettings", {
		name: "DICE_TRAY.SETTINGS.DiceRowSettings",
		label: "DICE_TRAY.SETTINGS.DiceRowSettings",
		icon: "fas fa-cogs",
		type: DiceRowSettings,
		restricted: true,
	});

	game.settings.register("dice-calculator", "enableDiceTray", {
		name: game.i18n.localize("DICE_TRAY.SETTINGS.enableDiceTray.name"),
		hint: game.i18n.localize("DICE_TRAY.SETTINGS.enableDiceTray.hint"),
		scope: "user",
		config: true,
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

	game.settings.register("dice-calculator", "compactMode", {
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});
	game.settings.register("dice-calculator", "hideNumberInput", {
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
	});
	game.settings.register("dice-calculator", "hideNumberButtons", {
		scope: "world",
		config: false,
		default: true,
		type: Boolean,
	});
	game.settings.register("dice-calculator", "hideRollButton", {
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
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

	game.settings.register("dice-calculator", "rightClickCommand", {
		name: "DICE_TRAY.SETTINGS.rightClickCommand.name",
		hint: "DICE_TRAY.SETTINGS.rightClickCommand.hint",
		scope: "world",
		config: true,
		type: new foundry.data.fields.StringField({
			required: true,
			blank: false,
			choices: {
				decrease: "DICE_TRAY.SETTINGS.rightClickCommand.options.decrease",
				roll: "DICE_TRAY.SETTINGS.rightClickCommand.options.roll"
			},
			initial: "decrease"
		}),
		onChange: (v) => { CONFIG.DICETRAY._rightClickCommand = v; }
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
