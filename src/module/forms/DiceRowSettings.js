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
			unused: true,
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
		CONFIG.DICETRAY.applyLayout(this.element, { hideAdv: context.settings.hideAdv });
		this.element.querySelectorAll("input.dice-tray__input").forEach((el) => el.disabled = true);
		for (const input of this.element.querySelectorAll(".form-group input")) {
			input.addEventListener("click", async (event) => {
				const { checked, name } = event.currentTarget;
				this.settings[name] = checked;
				this.render(true);
			});
		}
		for (const button of this.element.querySelectorAll(".dice-tray button.dice-tray__button")) {
			button.addEventListener("click", async (event) => {
				event.preventDefault();
				let row;
				let diceData;
				const parent = event.target.parentElement;
				const { formula: key, tooltip } = Object.keys(parent.dataset).length
					? parent.dataset
					: event.target.dataset;
				if (parent.classList.contains("dice-tray__drawer")) {
					const first = parent.firstElementChild.dataset.formula;
					row = this.diceRows.findIndex((r) => r[first]);
					diceData = this.diceRows[row][first].drawer[key];
				} else {
					row = this.diceRows.findIndex((r) => r[key]);
					diceData = this.diceRows[row][key];
				}
				const { color, img, label } = diceData;
				new DiceCreator({
					form: this,
					diceRows: this.diceRows,
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
			});
			button.addEventListener("contextmenu", async (event) => {
				event.preventDefault();
				let row;
				const { formula: key } = Object.keys(event.target.parentElement.dataset).length
					? event.target.parentElement.dataset
					: event.target.dataset;
				const parent = event.target.parentElement;
				if (parent.classList.contains("dice-tray__drawer")) {
					// TODO remove all elements if target is first child
					const firstKey = parent.firstElementChild.dataset.formula;
					row = this.diceRows.findIndex((r) => r[firstKey]);
					const first = this.diceRows[row][firstKey];
					this.dice[key] = first.drawer[key];
					delete first.drawer[key];
					if (!Object.keys(first.drawer).length) first.drawer = null;
				} else {
					row = this.diceRows.findIndex((r) => r[key]);
					this.dice[key] = this.diceRows[row][key];
					delete this.diceRows[row][key];
				}
				if (!Object.keys(this.diceRows[row]).length) {
					this.diceRows.splice(row, 1);
				}
				this.render(false);
			});
		}
		for (const button of this.element.querySelectorAll(".dice-tray .dice-tray__math button")) {
			button.addEventListener("click", async (event) => {
				event.preventDefault();
			});
		}
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
