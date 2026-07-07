import GenericDiceMap from "./templates/template.js";

export default class daggerheartDiceMap extends GenericDiceMap {
	get buttonFormulas() {
		return {
			kh: "advantage",
			kl: "disadvantage"
		};
	}

	get dice() {
		return [
			{
				d4: { img: "icons/dice/d4black.svg" },
				d6: { img: "icons/dice/d6black.svg" },
				d8: { img: "icons/dice/d8black.svg" },
				d10: { img: "icons/dice/d10black.svg" },
				d12: { img: "icons/dice/d12black.svg" },
				"/dr": { label: "DR", tooltip: "Duality Roll" },
				"/df": { label: "FR", tooltip: "Fate Roll" },
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
					if (term === dataset.formula) chatVal = chatVal.replace(new RegExp(`(${term}=true)`), "").trim();
					else if (term) chatVal = chatVal.replace(term, dataset.formula);
					else chatVal = `${chatVal} ${dataset.formula}=true`;
				} else if (!chatVal) {
					chatVal = `/dr ${dataset.formula}=true`;
				}

				// Handle toggle classes.
				const toggleClass = (selector, condition) => {
					html.querySelector(selector)?.classList.toggle("active", condition);
				};
				toggleClass(".dice-tray__advantage", chatVal.includes("advantage=true"));
				toggleClass(".dice-tray__disadvantage", chatVal.includes("disadvantage=true"));
				// Update the value.
				chat.value = chatVal;
			});
		}
	}
}
