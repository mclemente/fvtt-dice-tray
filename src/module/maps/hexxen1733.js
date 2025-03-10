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
		const $mod_input = html.find(".dice-tray__input");
		const mod_val = Number($mod_input.val());

		if ($mod_input.length === 0 || isNaN(mod_val)) return;

		let mod_string = "";
		let mod_temp = "";
		if (mod_val > 0) {
			mod_string = `${mod_val}+`;
		} else if (mod_val < 0) {
			mod_temp = Math.abs(mod_val);
			mod_string = `${mod_temp}-`;
		}

		const $chat = this.textarea;
		const chat_val = String($chat.val());

		const match_string = /(\d+)(\+|-)$/;
		if (match_string.test(chat_val)) {
			$chat.val(chat_val.replace(match_string, mod_string));
		} else if (chat_val !== "") {
			$chat.val(chat_val + mod_string);
		} else {
			const rollPrefix = this._getRollMode(html);
			$chat.val(`${rollPrefix} ${mod_string}`);
		}
		if (/(\/r|\/gmr|\/br|\/sr) $/g.test($chat.val())) {
			$chat.val("");
		}
	}

	updateChatDice(dataset, direction, html) {
		const $chat = this.textarea;
		let currFormula = String($chat.val());
		if (direction === "sub" && currFormula === "") return;
		let newFormula = null;
		let rollPrefix = this._getRollMode(html);
		let qty = 0;
		let dice = "";

		let match_dice = dataset.formula;
		const match_string = new RegExp(`${this.rawFormula("(\\d*)", `(${match_dice})`, html)}(?=[0-9]|$)`);

		if (match_string.test(currFormula)) {
			const match = currFormula.match(match_string);
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
				const new_match_string = new RegExp(regexxx);
				currFormula = currFormula.replace(new_match_string, newFormula);
				if (!(/(\d+[hsbe+-])/.test(currFormula))) {

					currFormula = "";
				}
			} else {
				newFormula = this.rawFormula(qty, parts.die, html);
				currFormula = currFormula.replace(match_string, newFormula);
			}
			$chat.val(currFormula);
		} else {
			if (!qty) {
				qty = 1;
			}
			if (currFormula === "") {
				$chat.val(`${rollPrefix} ${this.rawFormula(qty, dice || dataset.formula, html)}`);
			} else {
				const signal = (/(\/r|\/gmr|\/br|\/sr) (?!-)/g.test(currFormula)) ? "" : "";
				currFormula = currFormula.replace(/(\/r|\/gmr|\/br|\/sr) /g, `${rollPrefix} ${this.rawFormula(qty, dice || dataset.formula, html)}${signal}`);
				$chat.val(currFormula);
			}
		}
		// TODO consider separate this into another method to make overriding simpler
		// TODO e.g. cases where a button adds 2+ dice

		// Add a flag indicator on the dice.
		qty = Number(qty);
		const $flag_button = html.find(`.dice-tray__flag--${dataset.formula}`);
		if (!qty) {
			qty = direction === "add" ? 1 : 0;
		}

		if (qty > 0) {
			$flag_button.textContent =(qty);
			$flag_button.classList.remove("hide");
		} else if (qty < 0) {
			$flag_button.textContent =(qty);
		} else {
			$flag_button.textContent =("");
			$flag_button.classList.add("hide");
		}

		currFormula = $chat.val();
		currFormula = currFormula.replace(/(\/r|\/gmr|\/br|\/sr)(( \+)| )/g, `${rollPrefix} `)
			.replace(/\+{2}/g, "+")
			.replace(/-{2}/g, "-");
		$chat.val(currFormula);
		this.applyModifier(html);
	}
}
