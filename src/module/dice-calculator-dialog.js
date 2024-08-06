export class DiceCalculatorDialog extends foundry.applications.api.DialogV2 {
	static DEFAULT_OPTIONS = {
		id: "dialog-{id}",
		classes: ["dialog", "dialog--dice-calculator"],
		tag: "dialog",
		position: {
			width: 400,
			left: window.innerWidth - 710,
			top: window.innerHeight - 500
		},
		window: {
			frame: true,
			positioned: true,
			minimizable: false
		}
	};

	get title() {
		return game.i18n.localize("DICE_TRAY.Calculator");
	}

	_onRender(context, options) {
		// this.window.header.style.display = "none";
		const textInput = this.element.querySelector(".dice-calculator__text-input");
		const buttons = this.element.querySelectorAll(".dice-calculator--button");

		textInput.addEventListener("focus", (event) => {
			this.element.querySelector(".dice-calculator__rolls--hidden")?.classList.toggle("visible");
		});
		textInput.addEventListener("blur", (event) => {
			setTimeout(() => {
				this.element.querySelector(".dice-calculator__rolls--hidden")?.classList.toggle("visible");
			}, 250);
		});

		for (const button of buttons) {
			button.addEventListener("click", (event) => {
				event.preventDefault();

				// Retrieve variables to start things off.
				const buttonFormula = event.currentTarget.dataset.formula;
				let currentFormula = textInput.value;
				let currentFormulaArray = currentFormula.split(" ");
				let last = currentFormulaArray.slice(-1)[0];

				// Used for determining when to add directly.
				// TODO replace for Object.keys(CONFIG.Dice.fulfillment.dice)
				const standardDice = [
					"d3",
					"d4",
					"d6",
					"d8",
					"d10",
					"d12",
					"d20",
					"d30",
					"d100"
				];

				// Used to prevent doubling up on operations/symbols.
				const opFormulas = ["/", "*", "+", "-"];
				const parenthesesFormulas = ["(", ")"];

				const isOperationOrParenthesis = (formula) =>
					opFormulas.includes(formula) || parenthesesFormulas.includes(formula);

				// Skip if last and incoming item are operation/parenthesis or if both are "dx"
				if (
					(isOperationOrParenthesis(buttonFormula) && isOperationOrParenthesis(last))
					|| (buttonFormula === "d" && last === "d")
				) {
					return;
				}

				// Handle clear.
				if (buttonFormula === "CLEAR") {
					currentFormula = "";
				}
				// Handle backspace/delete.
				else if (buttonFormula === "DELETE") {
					currentFormulaArray.pop();
					currentFormula = currentFormulaArray.join(" ");
				}
				// Handle token attributes and abilities.
				else if (last.includes("@") || buttonFormula.includes("@")) {
					let joiner = opFormulas.includes(last) || opFormulas.includes(buttonFormula) ? " " : " + ";
					joiner = last.length < 1 ? "" : joiner;
					currentFormula = currentFormula + joiner + buttonFormula;
				}
				// Handle inputs such as 'd4' and 'd6'
				else if (buttonFormula.includes("d")) {
					let updated = false;
					let count = 0;
					// @TODO: Investigate whether this option is worthwhile, perhaps as a
					// a setting.
					// -----------------------------------------------------------------------
					// Loop through all existing items in the formula array to see if this
					// die type has been used before. If so, increase the count on that entry.
					// for (let i = 0; i < currentFormulaArray.length; i++) {
					//   if (currentFormulaArray[i].includes(buttonFormula)) {
					//     let result = currentFormulaArray[i].split('d');
					//     if (result[0] && (result[0].length !== 0 || !isNaN(result[0]))) {
					//       count = parseInt(result[0]);
					//     }
					//     else {
					//       count = 1;
					//     }
					//     updated = true;
					//     currentFormulaArray[i] = (count + 1) + buttonFormula;
					//   }
					// }

					// Update the number of dice in the last item if it's the same as the
					// button formula.
					const matchString = new RegExp(`${buttonFormula}(?!0)`, "i");
					if (matchString.test(last)) {
						let result = last.split("d");
						if (result[0] && (result[0].length !== 0 || !isNaN(result[0]))) {
							count = parseInt(result[0]);
						} else {
							count = 1;
						}
						const adv = result[1].split(/\d+/)[1];
						updated = true;
						currentFormulaArray[currentFormulaArray.length - 1] = (count + 1) + buttonFormula + adv;
					}
					// If we updated an item, create a new text version of the formula.
					if (updated) {
						currentFormula = currentFormulaArray.join(" ");
					}
					// Otherwise, append to the original.
					else {
						let joiner = " ";
						if (last.includes("d")) {
							joiner = " + ";
						} else if (!isNaN(last)) {
							joiner = "";
						}
						currentFormula = currentFormula + joiner + buttonFormula;
					}
				}
				// Handle adv/dis.
				else if (buttonFormula.includes("k")) {
					if (!last.includes("d")) return;
					// If the last item isn't kh or kl, append.
					let lastArray = last.split("k");
					if (!last.includes("k")) {
						if (/^(1|)(d\d+)/.test(last)) {
							const match = last.match(/^(1|)(d\d+)/);
							last = `2${match[2]}`;
						}

						currentFormula = currentFormula.slice(0, -1 * last.length);
						currentFormula = `${currentFormula} ${last}${buttonFormula}`.trim();
					}
					// Otherwise check to see if we should either replace (such as going
					// from kh to kl) or increase the count.
					else if (lastArray[1]) {
						let dieCount = lastArray[0].split("d")[0];
						let lastType = lastArray[1].substr(0, 1);
						let buttonType = buttonFormula.substr(1, buttonFormula.length);
						let lastCount = lastArray[1].substr(1, lastArray[1].length);
						let count = parseInt(lastCount);
						dieCount = parseInt(dieCount);
						dieCount = isNaN(dieCount) ? 1 : dieCount;
						count = isNaN(count) ? 2 : count + 1;

						// We need to avoid allowing more dice to be kept than are being
						// rolled.
						if (count >= dieCount) {
							count = dieCount - 1;
						}

						if (count === 1) {
							count = "";
						}

						// Build the new string.
						currentFormulaArray.pop();
						currentFormula = `${currentFormulaArray.join(" ")} ${lastArray[0]}k${buttonType}`.trim();

						if (buttonType === lastType) {
							currentFormula = currentFormula + count;
						}
					}
				}
				// Handle custom dice.
				else if (buttonFormula === "d") {
					let joiner = last.includes("d") || isNaN(last) ? " + " : "";
					currentFormula = currentFormula + joiner + buttonFormula;
				}
				// Handle numbers appended to custom dice..
				else if (
					(last === "d" || last.includes("k")
					|| parenthesesFormulas.includes(last)) && !isNaN(buttonFormula)
				) {
					currentFormula = currentFormula + buttonFormula;
				}
				// All other inputs.
				else {
				// Normally we want to append with either an empty string or a space.
					let joiner = "";
					if (opFormulas.includes(buttonFormula)) {
						joiner = " ";
					}
					// If the last item is a die, append with as addition.
					else if (last.includes("d")) {
						if (standardDice.includes(last) && buttonFormula !== "0") {
							joiner = " + ";
						}
						// If the last item isn't a complete die (such as "3d") and this is
						// a number, append directly.
						else if (!isNaN(last) || !isNaN(parseInt(buttonFormula))) {
							joiner = "";
						} else {
							joiner = " ";
						}
					} else if (isNaN(parseInt(last))) {
						joiner = " ";
					}
					currentFormula = currentFormula + joiner + buttonFormula;
				}

				textInput.value = currentFormula;
			});
		}
	}

	async _onSubmit(target, event) {
		event.preventDefault();
		const button = this.options.buttons[target?.dataset.action];
		const result = (await button?.callback?.(event, target, this.element)) ?? button?.action;
		await this.options.submit?.(result);
	}
}
