import { DiceCreator } from "./DiceCreator";

export class DiceRowSettings extends FormApplication {
	constructor(object, options = {}) {
		super(object, options);
		this.diceRows = foundry.utils.deepClone(game.settings.get("dice-calculator", "diceRows"));
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "dice-row-form",
			title: "DICE_TRAY.SETTINGS.DiceRowSettings",
			template: "./modules/dice-calculator/templates/DiceRowSettings.hbs",
			classes: ["sheet", "dice-tray-row-settings"],
			width: 320,
			height: "auto",
			closeOnSubmit: true,
		});
	}

	getData(options) {
		return {
			diceRows: this.diceRows,
		};
	}

	async activateListeners(html) {
		super.activateListeners(html);
		html.find(".dice-tray button").on("click", async (event) => {
			event.preventDefault();
		});
		html.find(".dice-tray__button").on("click", async (event) => {
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
					row: row,
				},
			}).render(true);
		});
		html.find(".dice-tray__button").on("contextmenu", async (event) => {
			event.preventDefault();
			const { formula: key } = Object.keys(event.target.parentElement.dataset).length
				? event.target.parentElement.dataset
				: event.target.dataset;
			const row = this.diceRows.findIndex((r) => r[key]);
			delete this.diceRows[row][key];
			if (!Object.keys(this.diceRows[row]).length) {
				this.diceRows.splice(1, row);
			}
			this.render(false);
		});
		html.find("button[name=add]").on("click", async (event) => {
			new DiceCreator({
				form: this,
				diceRows: this.diceRows,
			}).render(true);
		});
		html.find("button[name=cancel]").on("click", async (event) => {
			this.close();
		});
		html.find("button[name=reset]").on("click", async (event) => {
			this.diceRows = game.settings.settings.get("dice-calculator.diceRows").default;
			this.render(false);
		});
	}

	async _updateObject(event, formData) {
		const current = game.settings.get("dice-calculator", "diceRows");
		if (JSON.stringify(this.diceRows) !== JSON.stringify(current)) {
			await game.settings.set("dice-calculator", "diceRows", this.diceRows);
			await SettingsConfig.reloadConfirm({ world: true });
		}
	}
}
