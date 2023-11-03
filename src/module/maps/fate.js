import GenericDiceMap from "./templates/template.js";

export default class FateDiceMap extends GenericDiceMap {
	get dice() {
		return [
			{
				d6: { img: "icons/dice/d6black.svg" },
				"4df": { label: game.i18n.localize("DICE_TRAY.FateDice")},
			}
		];
	}
}
