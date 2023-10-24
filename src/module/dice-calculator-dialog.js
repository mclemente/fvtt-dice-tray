export class DiceCalculatorDialog extends Dialog {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "templates/hud/dialog.html",
			focus: true,
			classes: ["dialog", "dialog--dice-calculator"],
			width: 400,
			// top: event.clientY - 80, TODO has to be set during render
			left: window.innerWidth - 710,
			jQuery: true
		});
	}

	activateListeners(html) {
		super.activateListeners(html);
		// Toggle the memory display.
		html.find(".dice-calculator__text-input").on("focus", (event) => {
			$(".dice-calculator__rolls--hidden").addClass("visible");
		});
		html.find(".dice-calculator__text-input").on("blur", (event) => {
			setTimeout(() => {
				$(".dice-calculator__rolls--hidden").removeClass("visible");
			}, 250);
		});

		// Replace with the selected die formula.
		html.find(".dice-calculator__roll").on("click", (event) => {
			let formula = event.text();
			$(".dice-calculator__text-input").val(formula);
		});

		// Update the dice formula.
		html.find(".dice-calculator--button").on("click", (event) => {
			event.preventDefault();

			// Retrieve variables to start things off.
			let buttonFormula = String($(event.currentTarget).data("formula"));
			let $formulaInput = $(document).find(".dice-calculator textarea");
			let currentFormula = $formulaInput.val();
			let currentFormulaArray = currentFormula.split(" ");
			let last = currentFormulaArray.slice(-1)[0];
			let skip = false;

			// Used for determining when to add directly.
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
			const opFormulas = [
				"/",
				"*",
				"+",
				"-"
			];
			const parenthesesFormulas = [
				"(",
				")"
			];

			// If the last item and the incoming item are both math operations,
			// skip adding it.
			if (opFormulas.includes(last) && opFormulas.includes(buttonFormula)) {
				skip = true;
			}

			// If the incoming item is either an operation or parentheses, skip it
			// in certain cases.
			if (opFormulas.includes(buttonFormula)
			|| parenthesesFormulas.includes(buttonFormula)) {
				if (last == buttonFormula) {
					skip = true;
				}

				if (opFormulas.includes(last) || parenthesesFormulas.includes(last)) {
					skip = true;
				}
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
				if (last.includes(buttonFormula)) {
					let result = last.split("d");
					if (result[0] && (result[0].length !== 0 || !isNaN(result[0]))) {
						count = parseInt(result[0]);
					}
					else {
						count = 1;
					}
					updated = true;
					currentFormulaArray[currentFormulaArray.length - 1] = (count + 1) + buttonFormula;
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
					}
					else if (!isNaN(last)) {
						joiner = "";
					}
					currentFormula = currentFormula + joiner + buttonFormula;
				}
			}
			// Handle adv/dis.
			else if (buttonFormula.includes("k")) {
				if (last.includes("d")) {
				// If the last item isn't kh or kl, append.
					let lastArray = last.split("k");
					if (!last.includes("k")) {
						if (last === "d20") {
							last = "2d20";
						}

						currentFormula = currentFormula.slice(0, -1 * last.length);
						currentFormula = `${currentFormula} ${last}${buttonFormula}`;
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
						currentFormula = `${currentFormulaArray.join(" ") + lastArray[0]}k${buttonType}`;

						if (buttonType === lastType) {
							currentFormula = currentFormula + count;
						}
					}
				}
				else {
					skip = true;
				}
			}
			// Handle custom dice.
			else if (buttonFormula === "d") {
				let joiner = last.includes("d") || isNaN(last) ? " + " : "";
				currentFormula = currentFormula + joiner + buttonFormula;
			}
			// Handle numbers appended to custom dice..
			else if ((last === "d" || last.includes("k")
			|| parenthesesFormulas.includes(last)) && !isNaN(buttonFormula)) {
				currentFormula = currentFormula + buttonFormula;
			}
			// All other inputs.
			else {
			// Normally we want to append with either an empty string or a space.
				let joiner = "";
				if (currentFormula.length === 0) {
					joiner = "";
				}
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
					}
					else {
						joiner = " ";
					}
				}
				else if (isNaN(parseInt(last))) {
					joiner = " ";
				}
				currentFormula = currentFormula + joiner + buttonFormula;
			}

			// If no operations said to skip this entry, update the input.
			if (!skip) {
				$formulaInput.val(currentFormula);
			}
		});
	}
}
