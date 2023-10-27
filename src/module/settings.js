import { DiceTrayGeneralSettings } from "./forms/DiceTraySettings";

export function registerSettings() {
	game.settings.registerMenu("dice-calculator", "GeneralSettings", {
		name: "DICE_TRAY.SETTINGS.GeneralSettings",
		label: game.i18n.localize("DICE_TRAY.SETTINGS.GeneralSettings"),
		icon: "fas fa-cogs",
		type: DiceTrayGeneralSettings,
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

	game.settings.register("dice-calculator", "enableExtraDiceInSwade", {
		name: game.i18n.localize("DICE_TRAY.SETTINGS.enableExtraDiceInSwade.name"),
		hint: game.i18n.localize("DICE_TRAY.SETTINGS.enableExtraDiceInSwade.hint"),
		scope: "world",
		config: false,
		condition: game.system.id === "swade",
		default: false,
		type: Boolean,
		requiresReload: true
	});

	game.settings.register("dice-calculator", "rolls", {
		scope: "world",
		config: false,
		default: [],
		type: Array,
	});
}

Hooks.on("renderDiceTrayGeneralSettings", DiceTrayGeneralSettings.renderHealthEstimateStyleSettingsHandler);
