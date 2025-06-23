import GenericDiceMap from "./templates/template.js";

export default class SWADEDiceMap extends GenericDiceMap {
	removeAdvOnRoll = false;

	get dice() {
		const dice = [
			{
				d4: { img: "icons/dice/d4black.svg" },
				d6: { img: "icons/dice/d6black.svg" },
				d8: { img: "icons/dice/d8black.svg" },
				d10: { img: "icons/dice/d10black.svg" },
				d12: { img: "icons/dice/d12black.svg" }
			}
		];
		return dice;
	}

	get labels() {
		return {
			advantage: game.i18n.localize("DICE_TRAY.WildDie"),
			adv: game.i18n.localize("DICE_TRAY.Wild"),
			disadvantage: game.i18n.localize("DICE_TRAY.ExplodingDie"),
			dis: game.i18n.localize("DICE_TRAY.Ace")
		};
	}

	get settings() {
		return {
			wildDieBehavior: {
				name: "DICE_TRAY.SETTINGS.SWADE.wildDieBehavior.name",
				hint: "DICE_TRAY.SETTINGS.SWADE.wildDieBehavior.hint",
				default: false,
				type: Boolean
			}
		};
	}

	_extraButtonsLogic(html) {
		const advantage = html.querySelector(".dice-tray__advantage");
		const disadvantage = html.querySelector(".dice-tray__disadvantage");
		advantage.addEventListener("click", (event) => {
			event.preventDefault();
			advantage.classList.toggle("active");
			disadvantage.classList.toggle("active", advantage.classList.contains("active"));
		});
		disadvantage.addEventListener("click", (event) => {
			event.preventDefault();
			disadvantage.classList.toggle("active");
			if (!disadvantage.classList.contains("active")) advantage.classList.remove("active");
		});
	}

	rawFormula(qty, dice, html) {
		let roll_suffix = "";
		let add_wild = html.querySelector(".dice-tray__advantage").classList.contains("active");

		if (html.querySelector(".dice-tray__disadvantage").classList.contains("active")) {
			roll_suffix = "x=";
		}

		if (add_wild) {
			if (!game.settings.get("dice-calculator", "wildDieBehavior")) {
				return `{${qty === "" ? 1 : qty}${dice}${roll_suffix},1d6${roll_suffix}}kh`;
			}

			dice = dice.replace("(", "").replace(")", "");
			if (!Number.isNumeric(qty)) {
				return `{1(${dice})${roll_suffix}.*,1d6${roll_suffix}}kh(?<qty>\\d*)`;
			}
			return `{${`1${dice}${roll_suffix},`.repeat(qty)}1d6${roll_suffix}}kh${qty}`;
		}
		return `${qty === "" ? 1 : qty}${dice}${roll_suffix}`;
	}
}

