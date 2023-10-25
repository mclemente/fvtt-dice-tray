// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

export function registerSettings() {
	game.settings.register("dice-calculator", "enableDiceCalculator", {
		name: game.i18n.localize("DICE_TRAY.SETTINGS.enableDiceCalculator.name"),
		hint: game.i18n.localize("DICE_TRAY.SETTINGS.enableDiceCalculator.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
		requiresReload: true
	});

	game.settings.register("dice-calculator", "enableDiceTray", {
		name: game.i18n.localize("DICE_TRAY.SETTINGS.enableDiceTray.name"),
		hint: game.i18n.localize("DICE_TRAY.SETTINGS.enableDiceTray.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
		requiresReload: true
	});

	game.settings.register("dice-calculator", "enableExtraDiceInSwade", {
		name: game.i18n.localize("DICE_TRAY.SETTINGS.enableExtraDiceInSwade.name"),
		hint: game.i18n.localize("DICE_TRAY.SETTINGS.enableExtraDiceInSwade.hint"),
		scope: "world",
		config: game.system.id === "swade",
		default: false,
		type: Boolean,
		requiresReload: true
	});

	game.settings.register("dice-calculator", "formulaArray", {
		scope: "world",
		config: false,
		default: false,
		type: Array,
	});
}
