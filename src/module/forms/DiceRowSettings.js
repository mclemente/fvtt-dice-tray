import { DiceCreator } from "./DiceCreator";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
export class DiceRowSettings extends HandlebarsApplicationMixin(ApplicationV2) {
	constructor(object, options = {}) {
		super(object, options);
		this.diceRows = foundry.utils.deepClone(game.settings.get("dice-calculator", "diceRows"));
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

	static settingsKeys = ["compactMode", "hideNumberInput", "hideRollButton"];

	_prepareContext(options) {
		this.settings ??= DiceRowSettings.settingsKeys.reduce((obj, key) => {
			obj[key] = game.settings.get("dice-calculator", key);
			return obj;
		}, {});
		return {
			diceRows: this.diceRows,
			settings: this.settings,
			buttons: [
				{ type: "button", icon: "fa-solid fa-plus", label: "DICE_TRAY.DiceCreator.CreateDice", action: "add" },
				{ type: "submit", icon: "fa-solid fa-save", label: "SETTINGS.Save" },
				{ type: "button", icon: "fa-solid fa-undo", label: "SETTINGS.Reset", action: "reset" }
			]
		};
	}

	_onRender(context, options) {
		super._onRender(context, options);
		CONFIG.DICETRAY.applyLayout(this.element);
		const diceTrayInput = this.element.querySelector("input.dice-tray__input");
		for (const input of this.element.querySelectorAll(".form-group input")) {
			input.addEventListener("click", async (event) => {
				const { checked, name } = event.currentTarget;
				this.settings[name] = checked;
				this.render(true);
			});
		}
		if (diceTrayInput) diceTrayInput.disabled = true;
		for (const button of this.element.querySelectorAll(".dice-tray button.dice-tray__button")) {
			button.addEventListener("click", async (event) => {
				event.preventDefault();
				const { formula: key, tooltip } = Object.keys(event.target.parentElement.dataset).length
					? event.target.parentElement.dataset
					: event.target.dataset;
				const row = this.diceRows.findIndex((r) => r[key]);
				const diceData = this.diceRows[row][key];
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
				const { formula: key } = Object.keys(event.target.parentElement.dataset).length
					? event.target.parentElement.dataset
					: event.target.dataset;
				const row = this.diceRows.findIndex((r) => r[key]);
				delete this.diceRows[row][key];
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
		const current = game.settings.get("dice-calculator", "diceRows");
		if (JSON.stringify(this.diceRows) !== JSON.stringify(current)) {
			await game.settings.set("dice-calculator", "diceRows", this.diceRows);
			forceRender = true;
		}
		if (forceRender) Hooks.callAll("dice-calculator.forceRender");
	}
}
