export class DiceTrayGeneralSettings extends FormApplication {
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "dice-tray-form",
			title: "Dice Tray Settings",
			template: "./modules/dice-calculator/templates/GeneralSettings.hbs",
			classes: ["sheet", "dice-calculator-general-settings"],
			tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "general" }],
			width: 600,
			height: "fit-content",
			closeOnSubmit: true,
			resizable: true
		});
	}

	_prepSetting(key) {
		const settingData = game.settings.settings.get(`dice-calculator.${key}`);

		const { name, hint, type, range, choices, isColor, hasTextarea } = settingData;
		const select = choices !== undefined ? Object.entries(choices).map(([key, value]) => ({ key, value })) : [];

		let settingType = type.name;
		if (range) {
			settingType = "Range";
		} else if (choices) {
			settingType = "Select";
		} else if (isColor) {
			settingType = "Color";
		} else if (hasTextarea) {
			settingType = "Textarea";
		}

		return {
			id: key,
			value: game.settings.get("dice-calculator", key),
			name,
			hint,
			type: settingType,
			range,
			select,
		};
	}

	_prepFlag(key) {
		const { name, hint, default: def, type } = game.settings.settings.get(`dice-calculator.${key}`);
		return {
			id: key,
			name,
			hint,
			value: game.user.flags?.["dice-calculator"]?.[key] ?? def,
			type: type.name,
		};
	}

	async resetToDefault(key) {
		const defaultValue = game.settings.settings.get(`dice-calculator.${key}`).default;
		await game.settings.set("dice-calculator", key, defaultValue);
	}

	getData() {
		const isGM = game.user.isGM;
		let data = {
			tabs: {
				general: {
					icon: "fas fa-cogs",
					name: "DICE_TRAY.SETTINGS.General",
				}
			},
		};
		if (isGM) {
			data.settings = {
				general: {
					enableDiceCalculator: this._prepSetting("enableDiceCalculator"),
					enableDiceTray: this._prepSetting("enableDiceTray"),
					enableExtraDiceInSwade: this._prepSetting("enableExtraDiceInSwade"),
				}
			};
		} else {
			data.settings = {
				general: {
					enableDiceCalculator: this._prepFlag("enableDiceCalculator"),
					enableDiceTray: this._prepFlag("enableDiceTray"),
					enableExtraDiceInSwade: this._prepFlag("enableExtraDiceInSwade"),
				},
			};
		}

		for (const s in data.settings) {
			// eslint-disable-next-line no-unused-vars
			data.settings[s] = Object.fromEntries(
				Object.entries(data.settings[s]).filter(([key, value]) => value !== undefined),
			);
		}

		data.numOfTabs = Object.keys(data.tabs).length;

		return data;
	}

	async activateListeners(html) {
		super.activateListeners(html);
		html.find("button").on("click", async (event) => {
			if (event.currentTarget?.dataset?.action === "reset") {
				const keys = [
					"enableDiceCalculator",
					"enableDiceTray",
					"enableExtraDiceInSwade",
				];
				if (game.user.isGM) {
					await Promise.all(
						keys.map(async (key) => {
							await this.resetToDefault(key);
						}),
					);
				} else {
					await Promise.all(
						keys.map(async (key) => {
							await game.user.unsetFlag("dice-calculator", key);
						}),
					);
				}
				this.close();
			}
		});
	}

	async _updateObject(event, formData) {
		let requiresClientReload = false;
		let requiresWorldReload = false;
		for (let [k, v] of Object.entries(foundry.utils.flattenObject(formData))) {
			let s = game.settings.settings.get(`dice-calculator.${k}`);
			let current = game.user.isGM ? game.settings.get(s.namespace, s.key) : game.user.getFlag("dice-calculator", k);
			if (v === current) continue;
			requiresClientReload ||= s.scope === "client" && s.requiresReload;
			requiresWorldReload ||= s.scope === "world" && s.requiresReload;
			if (game.user.isGM) {
				await game.settings.set(s.namespace, s.key, v);
			} else {
				await game.user.setFlag("dice-calculator", k, v);
			}
		}
		if (requiresClientReload || requiresWorldReload) {
			SettingsConfig.reloadConfirm({ world: requiresWorldReload });
		}
	}

	static renderDiceTrayGeneralSettings(settingsConfig, html) {
		const enableDiceTray = game.settings.get("dice-calculator", "enableDiceTray");
		const enableDiceTrayCheckbox = html.find('input[name="enableDiceTray"]');
		const enableExtraDiceInSwadeCheckbox = html.find('input[name="enableExtraDiceInSwade"]');
		const gameIsSwade = game.system.id === "swade";

		function hideForm(form, boolean) {
			form.style.display = boolean ? "none" : "";
		}
		function disableCheckbox(checkbox, boolean) {
			checkbox.prop("disabled", boolean);
		}

		if (gameIsSwade) {
			disableCheckbox(enableExtraDiceInSwadeCheckbox, !enableDiceTray);

			enableDiceTrayCheckbox.on("change", (event) => {
				disableCheckbox(enableExtraDiceInSwadeCheckbox, !event.target.checked);
			});
		} else {
			const swadeCheckboxGroup = enableExtraDiceInSwadeCheckbox.parent()[0];
			hideForm(swadeCheckboxGroup, true);
		}
	}
}
