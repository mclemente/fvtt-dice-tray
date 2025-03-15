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
		if (direction === "sub" && currFormula === "") return;
		let newFormula = null;
		let rollPrefix = this._getRollMode(html);
		let qty = 0;
		let dice = "";

		let match_dice = dataset.formula;
		const matchString = new RegExp(`${this.rawFormula("(\\d*)", `(${match_dice})`, html)}(?=[0-9]|$)`);

		if (matchString.test(currFormula)) {
			const match = currFormula.match(matchString);
			const parts = {
				txt: match[0] || "",
				qty: match[1] || "1",
				die: match[2] || "",
			};

			if (parts.die === "" && match[3]) {
				parts.die = match[3];
			}

			qty = direction === "add" ? Number(parts.qty) + (qty || 1) : Number(parts.qty) - (qty || 1);

			// Update the dice quantity.
			qty = qty < 1 ? "" : qty;

			if (qty === "" && direction === "sub") {
				newFormula = "";
				let regexxx =`${this.rawFormula("(\\d+)", `(${match_dice})`, html)}(?=[0-9]|$)`;
				const newMatchString = new RegExp(regexxx);
				currFormula = currFormula.replace(newMatchString, newFormula);
				if (!(/(\d+[hsbe+-])/.test(currFormula))) {

					currFormula = "";
				}
			} else {
				newFormula = this.rawFormula(qty, parts.die, html);
				currFormula = currFormula.replace(matchString, newFormula);
			}
			chat.value = currFormula;
		} else {
			if (!qty) {
				qty = 1;
			}
			if (currFormula === "") {
				chat.value = `${rollPrefix} ${this.rawFormula(qty, dice || dataset.formula, html)}`;
			} else {
				const signal = (/(\/r|\/gmr|\/br|\/sr) (?!-)/g.test(currFormula)) ? "" : "";
				currFormula = currFormula.replace(/(\/r|\/gmr|\/br|\/sr) /g, `${rollPrefix} ${this.rawFormula(qty, dice || dataset.formula, html)}${signal}`);
				chat.value = currFormula;
			}
		}
		// TODO consider separate this into another method to make overriding simpler
		// TODO e.g. cases where a button adds 2+ dice

		// Add a flag indicator on the dice.
		qty = Number(qty);
		const flagButton = html.querySelector(`.dice-tray__flag--${dataset.formula}`);
		if (!qty) {
			qty = direction === "add" ? 1 : 0;
		}

		if (qty > 0) {
			flagButton.textContent = qty;
			flagButton.classList.remove("hide");
		} else if (qty < 0) {
			flagButton.textContent = qty;
		} else {
			flagButton.textContent = "";
			flagButton.classList.add("hide");
		}

		currFormula = chat.value;
		currFormula = currFormula.replace(/(\/r|\/gmr|\/br|\/sr)(( \+)| )/g, `${rollPrefix} `)
			.replace(/\+{2}/g, "+")
			.replace(/-{2}/g, "-");
		chat.value = currFormula;
		this.applyModifier(html);
	}
}
