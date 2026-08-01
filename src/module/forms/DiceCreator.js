const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class DiceCreator extends HandlebarsApplicationMixin(ApplicationV2) {
	constructor(object, options = {}) {
		super(options);
		this.object = object;
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
		const { dice, insideDrawer, maxRows, row, settings } = this.object;
		const label = dice?.key ? "SETTINGS.Save" : "DICE_TRAY.DiceCreator.CreateDice";
		return {
			dice,
			insideDrawer,
			row: row !== undefined ? row + 1 : maxRows ?? null,
			maxRows,
			settings,
			buttons: [
				{ type: "submit", icon: "fa-solid fa-save", label },
			]
		};
	}

	#cleanDiceData(dice) {
		const clean = Object.fromEntries(
			Object.entries(dice).filter(([k, v]) => k !== "key" && v !== "")
		);
		if (!clean.img) {
			clean.label ??= dice.key;
			if (clean.alternative) clean.alternative = false;
		}
		return clean;
	}

	#submitRow(dice, row) {
		const { insideDrawer, originalKey: origKey, row: origRow } = this.object;
		const cleanKey = this.#cleanDiceData(dice);
		if (row > this.parent.diceRows.length - 1) this.parent.diceRows.push({});
		let target = this.parent.diceRows[row];

		if (dice.drawer) cleanKey.drawer = target[origKey].drawer;

		if (insideDrawer) target[insideDrawer].drawer[dice.key] = cleanKey;
		else target[dice.key] = cleanKey;

		if (origRow !== row) delete this.parent.diceRows[origRow][origKey];
	}

	static #onSubmit(event, form, formData) {
		let { dice, row } = foundry.utils.expandObject(formData.object);
		if (row !== undefined) {
			// Account for row being 1-index for better UX
			row--;
			this.#submitRow(dice, row );
		} else {
			this.parent.dice[dice.key] = this.#cleanDiceData(dice);
		}
	}

	async close(options={}) {
		if (options.submitted) this.parent.render({ force: true });
		await super.close(options);
	}
}
