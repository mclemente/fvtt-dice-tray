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
		return {
			diceRows: this.diceRows,
			settings: this.settings,
			isPreview: true,
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
		let dragged;
		if (context.showExtraButtons && !context.settings.hideAdv) {
			CONFIG.DICETRAY._createExtraButtons(this.element);
		}
		this.element.querySelectorAll(".dice-rows .dice-tray__buttons").forEach((row) => {
			row.addEventListener("drop", (event) => {
				const { drawer, key, origin } = JSON.parse(event.dataTransfer.getData("text/plain") || "{}");

				const buttons = [...row.children].filter((el) => el.matches(".dice-tray__button"));
				let button;
				let nearestDistance = Infinity;
				for (const b of buttons) {
					const rect = b.getBoundingClientRect();
					const centerX = rect.left + (rect.width / 2);
					const distance = Math.abs(event.clientX - centerX);

					if (distance < nearestDistance) {
						button = b;
						nearestDistance = distance;
					}
				}
				if (button === dragged) return;

				if (origin === "dice-calculator-preview") {
					const dice = CONFIG.DICETRAY.dice;
					const rowElement = button.closest("[data-row]");
					const row = rowElement.dataset.row;
					// Moved out of a Drawer
					if (drawer) {
						const drawerDoor = this.diceRows[row][drawer];
						delete drawerDoor.drawer[key];
						if (!Object.keys(drawerDoor.drawer).length) {
							const drawerElement = this.element.querySelector(`.dice-tray__drawer[data-drawer=${drawer}]`);
							drawerElement.remove();
							drawerDoor.drawer = null;
						}
					}
					// Moved into a Drawer
					if (dragged.parentElement.dataset.drawer) {
						const dr = dragged.parentElement.dataset.drawer;
						const drawerDoor = this.diceRows[row][dr];
						if (!drawerDoor.drawer) drawerDoor.drawer = {};
						drawerDoor.drawer[key] = dice[key];
					}
					this.diceRows[row] = Object.fromEntries(
						[...rowElement.children]
							.filter((el) => el.matches(".dice-tray__button"))
							.map((el) => {
								const key = el.dataset.formula;
								return [key, this.diceRows[row][key] ?? dice[key]];
							})
					);
					delete this.dice[key];
				}
				dragged = null;
			});
		});
		this.element.querySelectorAll("input.dice-tray__input").forEach((el) => el.disabled = true);
		for (const input of this.element.querySelectorAll(".form-group input")) {
			input.addEventListener("click", (event) => {
				const { checked, name } = event.currentTarget;
				this.settings[name] = checked;
				this.render(true);
			});
		}
		this.element.querySelectorAll(".dice-tray button.dice-tray__button[draggable=true]").forEach((button) => {
			button.addEventListener("dragstart", (event) => {
				dragged = event.target;
				const key = button.dataset.formula;
				const drawer = button.closest(".dice-tray__drawer")?.dataset?.drawer;
				event.dataTransfer.setData("text/plain", JSON.stringify({ origin: "dice-calculator-preview", key, drawer }));
			});
			button.addEventListener("dragend", (event) => {
				const data = JSON.parse(event.dataTransfer.getData("text/plain") || "{}");
				if (data?.origin === "dice-calculator-preview") {
					this.render(false);
				}
				dragged = null;
			});
		});
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
			button.addEventListener("dragover", async (event) => {
				if (button === dragged) return;
				const data = JSON.parse(event.dataTransfer.getData("text/plain") || "{}");
				if (data?.origin === "dice-calculator-preview") {
					const rect = button.getBoundingClientRect();
					const topPosition = event.clientY - rect.top;
					const before = event.clientX < rect.left + (rect.width / 2);
					const next = before ? event.target : event.target.nextSibling;
					if (next === dragged) return;
					if (topPosition < rect.height * 0.25) {
						const dragParent = dragged.parentElement;
						const key = button.dataset.formula;
						// Drag over current drawer
						if (dragParent.dataset?.drawer === key) return;

						// Drag over pre-existing drawer
						if (button.parentElement.dataset.drawer) {
							button.after(dragged);
							return;
						}
						// Drag over top of button, create new drawer
						const div = document.createElement("div");
						div.classList.add("dice-tray__drawer", "flexcol");
						div.dataset.drawer = key;
						div.style.positionAnchor = `--${CSS.escape(key)}`;
						div.append(dragged);

						button.style.anchorName = `--${CSS.escape(key)}`;
						button.dataset.drawer = key;
						button.after(div);
						return;
					}
					if (dragged.nextSibling === next || next.parentElement.dataset.drawer) return;
					dragged.remove();
					button.parentNode.insertBefore(dragged, next);
				}
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
		for (const button of this.element.querySelectorAll(".dice-tray .dice-tray__math button")) {
			button.addEventListener("click", async (event) => {
				event.preventDefault();
			});
		}
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
		this.diceRows = CONFIG.DICETRAY.rows;
		this.dice = Object.fromEntries(
			Object.entries(CONFIG.DICETRAY.dice)
				.filter(([key]) =>
					!this.diceRows.some(
						(r) => r[key] || Object.values(r).some((d) => d.drawer?.[key])
					)
				)
		);
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
