import GenericDiceMap from "./templates/template.js";

export default class FateDiceMap extends GenericDiceMap {
	get dice() {
		return [
			{
				"4df": { label: game.i18n.localize("DICE_TRAY.FateDice")},
			}
		];
	}
}
