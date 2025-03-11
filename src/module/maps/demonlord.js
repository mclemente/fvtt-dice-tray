import GenericDiceMap from "./templates/template.js";

export default class demonlordDiceMap extends GenericDiceMap {

	get dice() {
		const dice = [
			{
				d3: { img: "modules/dice-calculator/assets/icons/d3black.svg" },
				d6: { img: "icons/dice/d6black.svg" },
				d20: { img: "icons/dice/d20black.svg" }
			}
		];
		return dice;
	}

	get buttonFormulas() {
		return {
			kh: "+",
			kl: "-"
		};
	}

	get labels() {
		return {
			advantage: game.i18n.localize("DL.DialogBoon"),
			adv: game.i18n.localize("DL.DialogBoon"),
			disadvantage: game.i18n.localize("DL.DialogBane"),
			dis: game.i18n.localize("DL.DialogBane")
		};
	}

	_extraButtonsLogic(html) {
		const buttons = html.querySelectorAll(".dice-tray__ad");
		for (const button of buttons) {
			button.addEventListener("click", (event) => {
				event.preventDefault();
				let sign = event.currentTarget.dataset.formula;
				const chat = this.textarea; // Assuming `this.textarea` refers to a valid element
				let chatVal = String(chat.value);
				const matchString = /(?<sign>[+-])(?<qty>\d*)d6kh/;
				const match = chatVal.match(matchString);

				if (match) {
					let qty = parseInt(match.groups.qty) || 1;
					let replacement = "";

					if (match.groups.sign === sign) {
						qty += 1;
						replacement = `${sign}${qty}d6kh`;
					} else if (qty !== 1) {
						qty -= 1;
						sign = sign === "+" ? "-" : "+";
						replacement = `${sign}${qty}d6kh`;
					}

					chatVal = chatVal.replace(matchString, replacement);
				} else {
					chatVal = `${chatVal}${sign}1d6kh`;
				}

				chat.value = chatVal;
			});
		}
	}
}

