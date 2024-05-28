export class DiceCreator extends FormApplication {
	constructor(object, options = {}) {
		super(object, options);
		Hooks.once("closeDiceRowSettings", () => this.close());
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "dice-creator-form",
			title: "DICE_TRAY.SETTINGS.DiceCreator",
			template: "./modules/dice-calculator/templates/DiceCreator.hbs",
			classes: ["sheet", "dice-tray-dice-creator"],
			width: 400,
			closeOnSubmit: true,
		});
	}

	getData(options) {
		const nextRow = this.object.diceRows.findIndex((row) => Object.keys(row).length < 7);
		return {
			dice: this.object.dice,
			diceRows: this.object.diceRows, // this.diceRows,
			nextRow: nextRow < 0 ? this.object.diceRows.length : nextRow,
			maxRows: Math.max(nextRow + 1, this.object.diceRows.length),
		};
	}

	async activateListeners(html) {
		super.activateListeners(html);
		html.find("button[name=cancel]").on("click", async (event) => {
			this.close();
		});
	}

	async _updateObject(event, formData) {
		const { dice, row } = foundry.utils.expandObject(formData);
		if (this.object.dice && dice.row !== row) {
			const key = this.object.dice.originalKey;
			delete this.object.form.diceRows[row][key];
		}
		if (row + 1 > this.object.form.diceRows.length) {
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
