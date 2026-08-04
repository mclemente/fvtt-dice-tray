import GenericDiceMap from "./templates/template.js";

export default class daggerheartDiceMap extends GenericDiceMap {
	get buttonFormulas() {
		return {
			kh: "advantage",
			kl: "disadvantage"
		};
	}

	get dice() {
		return {
			"/dr": { img: "systems/daggerheart/assets/icons/dice/duality/DualityBW.svg", tooltip: _loc("DAGGERHEART.GENERAL.dualityRoll") },
			"/fr": { img: "systems/daggerheart/assets/icons/dice/hope/d12.svg", alternative: true, tooltip: _loc("DAGGERHEART.GENERAL.fateRoll") },
			"/fr type=fear": { img: "systems/daggerheart/assets/icons/dice/fear/d12.svg", alternative: true, tooltip: _loc("DAGGERHEART.GENERAL.fateRoll") },
			...super.dice,
		};
	}

	get rows() {
		const dice = this.dice;
		const { d4, d6, d8, d10, d12 } = dice;
		return [
			{
				d4,
				d6,
				d8,
				d10,
				d12,
				"/dr": dice["/dr"],
				"/fr": {
					...dice["/fr"],
					drawer: {
						"/fr type=fear": dice["/fr type=fear"]
					}
				}
			}
		];
	}

	get labels() {
		return {
			advantage: "DICE_TRAY.Advantage",
			adv: "DICE_TRAY.Adv",
			disadvantage: "DICE_TRAY.Disadvantage",
			dis: "DICE_TRAY.Dis"
		};
	}

	_extraButtonsLogic(html) {
		for (const button of html.querySelectorAll(".dice-tray__ad")) {
			button.addEventListener("click", (event) => {
				event.preventDefault();
				const dataset = event.currentTarget.dataset;
				const chat = this.textarea;
				let chatVal = String(chat.value);
				const matchString = /\/dr\s*(?:(?<term>advantage|disadvantage)=true)*/g;

				const match = matchString.exec(chatVal);

				if (match) {
					const { term } = match.groups;
					if (term === dataset.formula) chatVal = chatVal = "";
					else if (term) chatVal = chatVal.replace(term, dataset.formula);
					else chatVal = `${chatVal} ${dataset.formula}=true`;
				} else if (!chatVal) {
					chatVal = `/dr ${dataset.formula}=true`;
				}

				// Handle toggle classes.
				const toggleClass = (selector, condition) => {
					html.querySelector(selector)?.classList.toggle("active", condition);
				};
				toggleClass(".dice-tray__advantage", chatVal.includes(" advantage=true"));
				toggleClass(".dice-tray__disadvantage", chatVal.includes("disadvantage=true"));
				// Update the value.
				chat.value = chatVal;
			});
		}
	}
}
