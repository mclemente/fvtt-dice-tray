import { DiceCreator } from "./DiceCreator";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
export class DiceRowSettings extends HandlebarsApplicationMixin(ApplicationV2) {
	constructor(object, options = {}) {
		super(object, options);
		this.diceRows = foundry.utils.deepClone(game.settings.get("dice-calculator", "diceRows"));
		this.dice = foundry.utils.deepClone(game.settings.get("dice-calculator", "dice"));
	}

	static DEFAULT_OPTIONS = {
		id: "dice-row-form",
		form: {
			handler: DiceRowSettings.#onSubmit,
			closeOnSubmit: true,
		},
		position: {
			width: 450,
			height: "auto",
		},
		tag: "form",
		window: {
			icon: "fas fa-dice",
			contentClasses: ["standard-form", "dice-tray-row-settings"],
			title: "DICE_TRAY.SETTINGS.DiceRowSettings"
		},
		actions: {
			add: DiceRowSettings.#add,
			reset: DiceRowSettings.#reset
		}
	};

	static PARTS = {
		diceRows: {
			template: "./modules/dice-calculator/templates/DiceRowSettings.hbs"
		},
		footer: { template: "templates/generic/form-footer.hbs" }
	};

	settings;

	static get settingsKeys() {
		const keys = ["compactMode", "hideNumberInput", "hideNumberButtons", "hideRollButton"];
		if (CONFIG.DICETRAY.showExtraButtons) keys.splice(4, 0, "hideAdv");
		return keys;
	}

	_prepareContext(options) {
		this.settings ??= DiceRowSettings.settingsKeys.reduce((obj, key) => {
			obj[key] = game.settings.get("dice-calculator", key);
			return obj;
		}, {});
		// Filter used dice from the pool, checking any drawers
		this.dice = Object.fromEntries(
			Object.entries(this.dice).filter(([key, value]) => {
				return this.diceRows.some((dr) => {
					return !dr[key] && !Object.values(dr).some((dv) => dv.drawer?.[key]);
				});
			})
		);
		return {
			diceRows: this.diceRows,
			settings: this.settings,
			preview: true,
			pool: [this.dice],
			showExtraButtons: CONFIG.DICETRAY.showExtraButtons,
			buttons: [
				{ type: "button", icon: "fa-solid fa-plus", label: "DICE_TRAY.DiceCreator.CreateDice", action: "add" },
				{ type: "submit", icon: "fa-solid fa-save", label: "SETTINGS.Save" },
				{ type: "button", icon: "fa-solid fa-undo", label: "SETTINGS.Reset", action: "reset" }
			]
		};
	}

	_onRender(context, options) {
		super._onRender(context, options);
		if (context.showExtraButtons && !context.settings.hideAdv) {
			CONFIG.DICETRAY._createExtraButtons(this.element);
		}
		this.element.querySelectorAll("input.dice-tray__input").forEach((el) => el.disabled = true);
		for (const input of this.element.querySelectorAll(".form-group input")) {
			input.addEventListener("click", (event) => {
				const { checked, name } = event.currentTarget;
				this.settings[name] = checked;
				this.render(true);
			});
		}
		this.element.querySelectorAll(".dice-tray:not(.dice-tray__pool) button.dice-tray__button").forEach((button) => {
			button.addEventListener("click", (event) => {
				event.preventDefault();
				this.#editDice(event, this.diceRows);
			});
			button.addEventListener("contextmenu", (event) => {
				event.preventDefault();
				const { formula: key, drawer } = event.target.dataset;
				const parent = event.target.parentElement;
				const isDrawerButton = parent.classList.contains("dice-tray__drawer");

				let row = this.diceRows.findIndex((r) => r[key]);
				let first = this.diceRows[row]?.[key];

				const emptyDrawer = (k) => {
					this.dice[k] = first.drawer[k];
					delete first.drawer[k];
				};

				if (drawer) {
					this.element.querySelectorAll(`.dice-tray__drawer[data-drawer="${key}"] button`)
						.forEach((d) => emptyDrawer(d.dataset.formula));
					first.drawer = null;
				}

				if (isDrawerButton) {
					const firstKey = parent.dataset.drawer;
					row = this.diceRows.findIndex((r) => r[firstKey]);
					first = this.diceRows[row][firstKey];
					emptyDrawer(key);
					if (!Object.keys(first.drawer).length) first.drawer = null;
				} else {
					this.dice[key] = first;
					delete this.diceRows[row][key];
				}

				if (!Object.keys(this.diceRows[row]).length) {
					this.diceRows.splice(row, 1);
				}
				this.render(false);
			});
		});
		this.element.querySelectorAll(".dice-tray.dice-tray__pool button.dice-tray__button").forEach((button) => {
			button.addEventListener("click", (event) => {
				event.preventDefault();
				this.#editDice(event, this.dice);
			});
			button.addEventListener("contextmenu", (event) => {
				event.preventDefault();
				const { formula: key } = event.target.dataset;
				delete this.dice[key];
				this.render(false);
			});
		});
		this.element.querySelectorAll(".dice-tray__drawer[data-drawer]").forEach((drawer) => {
			const key = drawer.dataset.drawer;
			const button = this.element.querySelector(`.dice-tray button.dice-tray__button[data-drawer="${key}"`);
			button.style.anchorName = `--${CSS.escape(key)}`;
			drawer.style.positionAnchor = button.style.anchorName;
		});
	}

	#editDice(event, source) {
		let row;
		let diceData;
		const parent = event.target.parentElement;
		const { formula: key, tooltip } = event.target.dataset;

		if (!Array.isArray(source)) {
			diceData = source[key];
		} else if (parent.classList.contains("dice-tray__drawer")) {
			const firstKey = parent.dataset.drawer;
			if (!row) row = source.findIndex((r) => r[firstKey]);
			diceData = source[row][firstKey].drawer[key];
		} else {
			if (!row) row = source.findIndex((r) => r[key]);
			diceData = source[row][key];
		}
		const { color, img, label } = diceData;
		new DiceCreator({
			form: this,
			diceRows: null,
			dice: {
				key,
				originalKey: key, // In case the key is changed later.
				color,
				img,
				label,
				tooltip: tooltip !== key ? tooltip : "",
				row: row + 1,
			},
			settings: this.settings
		}).render(true);
	}

	static #add() {
		new DiceCreator({
			form: this,
			diceRows: this.diceRows,
			settings: this.settings
		}).render(true);
	}

	static #reset() {
		this.diceRows = game.settings.settings.get("dice-calculator.diceRows").default;
		this.render(false);
	}

	static async #onSubmit(event, form, formData) {
		let forceRender = false;
		await Promise.all(
			DiceRowSettings.settingsKeys.map(async (key) => {
				const current = game.settings.get("dice-calculator", key);
				if (current !== this.settings[key]) {
					await game.settings.set("dice-calculator", key, this.settings[key]);
					forceRender = true;
				}
			})
		);
		await Promise.all(
			["diceRows", "dice"].map(async (s) => {
				const current = game.settings.get("dice-calculator", s);

				if (JSON.stringify(this[s]) !== JSON.stringify(current)) {
					await game.settings.set("dice-calculator", s, this[s]);
					forceRender = true;
				}
			})
		);
		if (forceRender) Hooks.callAll("dice-calculator.forceRender");
	}
}
