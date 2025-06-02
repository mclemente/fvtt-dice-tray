const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class DiceCreator extends HandlebarsApplicationMixin(ApplicationV2) {
	constructor(object, options = {}) {
		super(options);
		const { dice, diceRows, form, settings } = object;
		this.object = { dice, diceRows, settings };
		this.parent = form;
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
		diceRows: {
			template: "./modules/dice-calculator/templates/DiceCreator.hbs"
		},
		footer: { template: "templates/generic/form-footer.hbs" }
	};

	_prepareContext(options) {
		const { dice, diceRows, settings } = this.object;
		const nextRow = diceRows.findIndex((row) => Object.keys(row).length < 7);
		const rowIndex = (nextRow !== -1 ? nextRow : diceRows.length) + 1;
		const label = dice?.key ? "SETTINGS.Save" : "DICE_TRAY.DiceCreator.CreateDice";
		return {
			dice,
			diceRows: this.object.diceRows, // this.diceRows,
			value: dice?.row ?? rowIndex,
			maxRows: rowIndex,
			settings,
			buttons: [
				{ type: "submit", icon: "fa-solid fa-save", label },
			]
		};
	}

	static async #onSubmit(event, form, formData) {
		let { dice, row } = foundry.utils.expandObject(formData.object);
		// Account for ROW being 1-index for better UX
		const actualRow = row - 1;
		if (this.object.dice && this.object.dice.row !== row) {
			const key = this.object.dice.originalKey;
			delete this.parent.diceRows[actualRow][key];
		}
		if (row > this.parent.diceRows.length) {
			this.parent.diceRows.push({});
		}
		const cleanKey = Object.fromEntries(Object.entries(dice).filter(([k, v]) => k !== "key" && v !== ""));
		if (!cleanKey.img && !cleanKey.label) {
			cleanKey.label = dice.key;
		}
		this.parent.diceRows[actualRow][dice.key] = cleanKey;
		this.parent.render(true);
	}
}
