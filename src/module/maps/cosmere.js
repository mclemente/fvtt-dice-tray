import GenericDiceMap from "./templates/template.js";

export default class cosmereDiceMap extends GenericDiceMap {
	showExtraButtons = false;

	get dice() {
		return [
			{
				d4: { img: "icons/dice/d4black.svg" },
				d6: { img: "icons/dice/d6black.svg" },
				d8: { img: "icons/dice/d8black.svg" },
				d10: { img: "icons/dice/d10black.svg" },
				d12: { img: "icons/dice/d12black.svg" },
				d20: { img: "icons/dice/d20black.svg" },
				dp: { label: "P", tooltip: game.i18n.localize("DICE.Plot.Die") },
			}
		];
	}
}
