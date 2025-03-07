import GenericDiceMap from "./templates/template.js";

export default class GrimwildDiceMap extends GenericDiceMap {
	// Ironically, this is used to *remove* extra buttons like the input.
	// @todo update the parent class to add something like a render hook
	// for a more accurate place to modify the final markup.
	showExtraButtons = true;

	// Prepare dice buttons.
	get dice() {
		return [
			{
				d: {
					// img: "icons/dice/d6black.svg",
					tooltip: "Dice",
					label: "<i class=\"fas fa-dice-d6\"></i> d",
					direction: "LEFT"
				},
				t: {
					// img: "icons/dice/d8black.svg",
					tooltip: "Thorns",
					label: "<i class=\"fas fa-dice-d8\"></i> t",
					direction: "LEFT"
				},
				p: {
					// img: "icons/dice/d6black.svg",
					tooltip: "Pool",
					label: "<i class=\"fas fa-dice-d6\"></i> Pool",
					direction: "LEFT"
				},
			}
		];
	}

	// Override the chat formula logic.
	updateChatDice(dataset, direction, html) {
		// Get the DOM element rather than the jQuery object.
		html = html[0];
		// Retrieve the current chat value.
		const chat = html.querySelector("#chat-form textarea");
		let currFormula = String(chat.value);
		// Exit early if there's nothing in chat and this is a remove operation.
		if (direction === "sub" && currFormula === "") return;
		// Grab the dice roll mode from chat.
		let rollPrefix = this._getRollMode(html);
		// Store the current dice and thorn values for later.
		let dice = "";
		let thorns = "";

		// If the current formula is empty, set it to the roll prefix as our baseline.
		if (currFormula === "") currFormula = rollPrefix;

		// Prepare a string of possible roll types for the regex. This should also
		// catch any manually written roll types, like "/gmroll".
		const rollModes = [
			"/roll", "/r",
			"/publicroll", "/pr",
			"/gmroll", "/gmr",
			"/blindroll", "/broll", "/br",
			"/selfroll", "/sr"
		].join("|");

		// Convert our operation into math.
		let delta = direction === "add" ? 1 : -1;

		// Regex for the dice expression. Examples: /r 4d2t, /gmr 2d, /br 4p
		const rollTextRegex = new RegExp(`(${rollModes})+\\s*(\\d+[dp])*(\\d+t)*`);
		// Run the regex with capture groups for targeted replacement.
		currFormula = currFormula.replace(rollTextRegex, (match, rollMode, diceMatch, thornsMatch) => {
			// If this is a remove operation and no dice were found, exit early.
			if (direction === "sub" && !diceMatch) {
				return match;
			}

			// Handle dice and pools.
			if (dataset.formula === "d" || dataset.formula === "p") {
				if (diceMatch) {
					diceMatch = diceMatch.replace(/(\d+)([dp])/, (subMatch, digit, letter) => {
						const newDigit = Number(digit) + delta;
						return newDigit > 0 ? `${newDigit}${dataset.formula}` : "";
					});

					if (!diceMatch && thornsMatch) {
						thornsMatch = "";
					}
				}
				else if (delta > 0) {
					diceMatch = `1${dataset.formula}`;
				}

				if (thornsMatch && dataset.formula === "p") {
					thornsMatch = "";
				}
			}

			// Handle thorns.
			if (dataset.formula === "t") {
				if (thornsMatch) {
					thornsMatch = thornsMatch.replace(/(\d+)(t)/, (subMatch, digit, letter) => {
						const newDigit = Number(digit) + delta;
						return newDigit > 0 ? `${newDigit}${letter}` : "";
					});
				}
				else if (delta > 0) {
					thornsMatch = "1t";
				}

				if (!diceMatch) {
					diceMatch = "1d";
				}

				diceMatch = diceMatch.replace("p", "d");
			}

			// Update variables.
			dice = diceMatch;
			thorns = thornsMatch;

			// Update the chat string.
			return `${rollPrefix} ${diceMatch}${thornsMatch ?? ""}`;
		});

		// Update flags over dice buttons. Use document instead of html so that we
		// also catch the popout element if present.
		let flagButton = document.querySelectorAll(".dice-tray__flag");
		flagButton.forEach((button) => {
			const buttonType = button.closest("button")?.dataset?.formula ?? false;
			// Update dice button.
			if (buttonType === "d") {
				if (dice && ["d", "t"].includes(dataset.formula)) {
					button.textContent = dice;
					button.classList.remove("hide");
				}
				else {
					button.textContent = "";
					button.classList.add("hide");
				}
			}
			// Update thorn button.
			else if (buttonType === "t") {
				if (thorns && ["d", "t"].includes(dataset.formula)) {
					button.textContent = thorns;
					button.classList.remove("hide");
				}
				else {
					button.textContent = "";
					button.classList.add("hide");
				}
			}
			// Update pool button.
			else if (buttonType === "p") {
				if (dice && dataset.formula === "p") {
					button.textContent = dice;
					button.classList.remove("hide");
				}
				else {
					button.textContent = "";
					button.classList.add("hide");
				}
			}
		});

		// Update chat area.
		chat.value = currFormula;
	}

	/**
	 * Remove buttons unused by Grimwild.
	 * @param {HTMLElement} html
	 */
	_createExtraButtons(html) {
		html = html[0];
		html.querySelector(".dice-tray__math--sub").remove();
		html.querySelector(".dice-tray__math--add").remove();
		html.querySelector(".dice-tray__input").remove();
	}
}
