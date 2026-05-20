import GenericDiceMap from "./templates/template.js";

export default class alienrpgDiceMap extends GenericDiceMap {
	showExtraButtons = false;

	get dice() {
		return [
			{
				db: {
					tooltip: game.i18n.localize("ALIENRPG.Base"),
					img: "systems/alienrpg/ui/alien-dice-b6.png",
					alternative: true
				},
				ds: {
					tooltip: game.i18n.localize("ALIENRPG.Stress"),
					img: "systems/alienrpg/ui/alien-dice-y6.png",
					alternative: true
				}
			}
		];
	}
}
