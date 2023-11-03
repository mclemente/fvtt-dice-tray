export class DiceCreator extends FormApplication {
	constructor(object, options = {}) {
		super(object, options);
		Hooks.once("closeDiceRowSettings", () => this.close());
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "dice-creator-form",
			title: "DICE_TRAY.SETTINGS.DiceCreator",
			template: "./modules/dice-calculator/templates/DiceCreator.hbs",
			classes: ["sheet", "dice-tray-dice-creator"],
			width: 400,
			height: "fit-content",
			closeOnSubmit: true,
			resizable: true
		});
	}

	getData(options) {
		const nextRow = Math.max(this.object.diceRows.findIndex((row) => Object.keys(row).length < 7), 1);
		return {
			dice: this.object.dice,
			diceRows: this.object.diceRows, // this.diceRows,
			nextRow,
			numOfRows: Math.max(nextRow, 1)
		};
	}

	async activateListeners(html) {
		super.activateListeners(html);
		html.find("button[name=cancel]").on("click", async (event) => {
			this.close();
		});
	}

	async _updateObject(event, formData) {
		const { dice, row } = expandObject(formData);
		if (this.object.dice && dice.row !== row) {
			delete this.object.form.diceRows[row][dice.key];
		}
		if ((row + 1) > this.object.form.diceRows.length) {
			this.object.form.diceRows.push({});
		}
		const cleanKey = Object.fromEntries(Object.entries(dice).filter(([k, v]) => k !== "key" && v !== ""));
		if (!cleanKey.img && !cleanKey.label) {
			cleanKey.label = dice.key;
		}
		this.object.form.diceRows[row][dice.key] = cleanKey;
		this.object.form.render(true);
	}
}
