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
		html.find(".dice-tray__ad").on("click", (event) => {
			event.preventDefault();
			let sign = event.currentTarget.dataset.formula;
			let $chat = html.find("#chat-form textarea");
			let chat_val = String($chat.val());
			let match_string = /(?<sign>[+-])(?<qty>\d*)d6kh/;
			const match = chat_val.match(match_string);
			if (match) {
				let qty = parseInt(match.groups.qty);
				let replacement = "";
				if (match.groups.sign === sign) {
					qty += 1;
					replacement = `${sign}${qty}d6kh`;
				} else if (qty !== 1) {
					qty -=1;
					sign = (sign === "+") ? "-" : "+";
					replacement = `${sign}${qty}d6kh`;
				}
				chat_val = chat_val.replace(match_string, replacement);
			} else {
				chat_val = `${chat_val}${sign}1d6kh`;
			}
			$chat.val(chat_val);
		});
	}
}

