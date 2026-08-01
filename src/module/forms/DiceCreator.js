const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class DiceCreator extends HandlebarsApplicationMixin(ApplicationV2) {
	constructor(object, options = {}) {
		super(options);
		const { dice, diceRows, form, settings } = object;
		this.object = { dice, diceRows, settings };
		this.diceRowSettings = form;
		Hooks.once("closeDiceRowSettings", () => this.close());
	}

	static DEFAULT_OPTIONS = {
		id: "dice-creator-form",
		form: {
			handler: DiceCreator.#onSubmit,
			closeOnSubmit: true,
		},
		position: {
			width: 450,
			height: "auto",
		},
		tag: "form",
		window: {
			icon: "fas fa-dice",
			contentClasses: ["standard-form", "dice-tray-dice-creator"],
			title: "DICE_TRAY.SETTINGS.DiceCreator"
		}
	};

	static PARTS = {
		diceCreator: {
			template: "./modules/dice-calculator/templates/DiceCreator.hbs"
		},
		footer: { template: "templates/generic/form-footer.hbs" }
	};

	_prepareContext(options) {
		const { dice, diceRows, settings } = this.object;
		const label = dice?.key ? "SETTINGS.Save" : "DICE_TRAY.DiceCreator.CreateDice";
		let nextRow;
		let rowIndex;
		if (diceRows) {
			nextRow = diceRows.findIndex((row) => Object.keys(row).length < 7);
			rowIndex = (nextRow !== -1 ? nextRow : diceRows.length) + 1;
		}
		return {
			dice,
			diceRows: this.object.diceRows, // this.diceRows,
			row: dice?.row ?? rowIndex ?? null,
			maxRows: rowIndex ?? null,
			settings,
			buttons: [
				{ type: "submit", icon: "fa-solid fa-save", label },
			]
		};
	}

	#submitRow(dice, row) {
		if (this.object.dice && this.object.dice.row !== row) {
			const key = this.object.dice.originalKey;
			delete this.diceRowSettings.diceRows[row][key];
		}
		if (row > this.diceRowSettings.diceRows.length) {
			this.diceRowSettings.diceRows.push({});
		}
		const cleanKey = Object.fromEntries(Object.entries(dice).filter(([k, v]) => k !== "key" && v !== ""));
		if (!cleanKey.img && !cleanKey.label) {
			cleanKey.label = dice.key;
		}
		if (!cleanKey.img && cleanKey.alternative) {
			cleanKey.alternative = false;
		}
		this.diceRowSettings.diceRows[row][dice.key] = cleanKey;
	}

	#submitPool(dice) {
		const cleanKey = Object.fromEntries(Object.entries(dice).filter(([k, v]) => k !== "key" && v !== ""));
		if (!cleanKey.img && !cleanKey.label) {
			cleanKey.label = dice.key;
		}
		if (!cleanKey.img && cleanKey.alternative) {
			cleanKey.alternative = false;
		}
		this.diceRowSettings.dice[dice.key] = cleanKey;
	}

	static #onSubmit(event, form, formData) {
		let { dice, row } = foundry.utils.expandObject(formData.object);
		if (row !== undefined) {
			// Account for row being 1-index for better UX
			this.#submitRow(dice, row - 1);
		} else this.#submitPool(dice);
		this.diceRowSettings.render(true);
	}
}
