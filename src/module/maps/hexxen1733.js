import GenericDiceMap from "./templates/template.js";
export default class HeXXen1733DiceMap extends GenericDiceMap {
	/** Shows the KH/KL buttons */
	showExtraButtons = false;

	get dice() {
		return [
			{
				h: {
					tooltip: "HeXXenwürfel",
					img: "systems/hexxen-1733/img/dice/svg/erfolgswuerfel_einfach.svg",
					color: "#00a806"
				},
				s: {
					tooltip: "Segnungswürfel",
					img: "systems/hexxen-1733/img/dice/svg/erfolgswuerfel_doppel.svg",
					color: "#d1c5a8"
				},
				b: {
					tooltip: "Blutwürfel",
					img: "systems/hexxen-1733/img/dice/svg/blutwuerfel_3.svg",
					color: "#a74937"
				},
				e: {
					tooltip: "Elixierwürfel",
					img: "systems/hexxen-1733/img/dice/svg/elixirwuerfel_5.svg",
					color: "#4c7ba0"
				}
			}
		];
	}

	applyModifier(html) {
		const modInput = html.querySelector(".dice-tray__input");
		if (!modInput) return;
		const modVal = Number(modInput.value);

		if (modInput.length === 0 || isNaN(modVal)) return;

		let modString = "";
		let modTemp = "";
		if (modVal > 0) {
			modString = `${modVal}+`;
		} else if (modVal < 0) {
			modTemp = Math.abs(modVal);
			modString = `${modTemp}-`;
		}

		const chat = this.textarea;
		const chatVal = String(chat.value);

		const matchString = /(\d+)(\+|-)$/;
		if (matchString.test(chatVal)) {
			chat.value = chatVal.replace(matchString, modString);
		} else if (chatVal !== "") {
			chat.value = chatVal + modString;
		} else {
			const rollPrefix = this._getRollMode(html);
			chat.value = `${rollPrefix} ${modString}`;
		}

		if (/(\/r|\/gmr|\/br|\/sr) $/g.test(chat.value)) {
			chat.value = "";
		}
	}

	updateChatDice(dataset, direction, html) {
		const chat = this.textarea;
		let currFormula = String(chat.value);

		if (direction === "sub" && currFormula === "") {
			this.reset();
			return;
		}

		const rollPrefix = this._getRollMode(html);
		let qty = 1;
		let dice = "";

		let matchDice = dataset.formula;
		const matchString = new RegExp(`${this.rawFormula("(?<qty>\\d*)", `(?<dice>${matchDice})`, html)}(?=[0-9]|$)`);

		if (matchString.test(currFormula)) {
			const match = currFormula.match(matchString);
			const parts = {
				txt: match[0] || "",
				qty: Number(match.groups?.qty ?? (match[1] || 1)),
				die: match.groups?.dice ?? (match[2] || ""),
			};

			if (parts.die === "" && match[3]) {
				parts.die = match[3];
			}

			qty = direction === "add" ? parts.qty + (qty || 1) : parts.qty - (qty || 1);

			if (!qty && direction === "sub") {
				let regexxx =`${this.rawFormula("(\\d+)", `(${matchDice})`, html)}(?=[0-9]|$)`;
				const newMatchString = new RegExp(regexxx);
				currFormula = currFormula.replace(newMatchString, "");
				if (!(/(\d+[hsbe+-])/.test(currFormula))) {
					currFormula = "";
				}
			} else currFormula = currFormula.replace(matchString, this.rawFormula(qty, parts.die, html));
		} else if (currFormula === "") {
			currFormula = `${rollPrefix} ${this.rawFormula(qty, dice || dataset.formula, html)}`;
		} else {
			const signal = (/(\/r|\/gmr|\/br|\/sr) (?!-)/g.test(currFormula)) ? "+" : "";
			currFormula = currFormula.replace(/(\/r|\/gmr|\/br|\/sr) /g, `${rollPrefix} ${this.rawFormula(qty, dice || dataset.formula, html)}${signal}`);
		}
		chat.value = currFormula;

		// Add a flag indicator on the dice.
		const flagNumber = direction === "add" ? qty : 0;
		this.updateDiceFlags(flagNumber, dataset.formula);

		currFormula = currFormula.replace(/(\/r|\/gmr|\/br|\/sr)(( \+)| )/g, `${rollPrefix} `).replace(/\+{2}/g, "+").replace(/-{2}/g, "-");
		chat.value = currFormula;
		this.applyModifier(html);
	}
}
