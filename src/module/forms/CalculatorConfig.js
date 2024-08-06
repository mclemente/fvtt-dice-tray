const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class CalculatorConfig extends HandlebarsApplicationMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		classes: ["form"],
		id: "dice-tray-calculator-config",
		tag: "form",
		position: {
			width: 420,
			height: "auto",
		},
		form: {
			handler: CalculatorConfig.#onSubmit,
			closeOnSubmit: true,
		},
		window: {
			contentClasses: ["standard-form"],
			title: "Dice Calculator Configuration"
		},
	};

	static PARTS = {
		config: {
			template: "modules/dice-calculator/templates/CalculatorConfig.hbs"
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	};

	_getButtons() {
		return [
			{ type: "submit", icon: "fa-solid fa-save", label: "SETTINGS.Save" },
			{ type: "reset", action: "reset", icon: "fa-solid fa-undo", label: "SETTINGS.Reset" },
		];
	}

	_prepareContext(options) {
		const dice = CONFIG.Dice.fulfillment.dice;
		const configs = game.settings.get("dice-calculator", "calculatorConfigs");
		return {
			dice,
			configs,
			buttons: this._getButtons()
		};
	}

	static async #onSubmit(event, form, formData) {
		const settings = foundry.utils.expandObject(formData.object);
		await game.settings.set("dice-calculator", "calculatorConfigs", settings);
	}
}
