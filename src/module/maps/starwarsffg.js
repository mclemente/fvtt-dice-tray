import GenericDiceMap from "./templates/template.js";

export default class starwarsffgDiceMap extends GenericDiceMap {
	showExtraButtons = false;

	get dice() {
		return [
			{
				dp: {
					tooltip: game.i18n.localize("SWFFG.DiceProficiency"),
					img: "systems/starwarsffg/images/dice/starwars/yellow.png",
					color: "#fef135"
				},
				da: {
					tooltip: game.i18n.localize("SWFFG.DiceAbility"),
					img: "systems/starwarsffg/images/dice/starwars/green.png",
					color: "#46ac4f"
				},
				dc: {
					tooltip: game.i18n.localize("SWFFG.DiceChallenge"),
					img: "systems/starwarsffg/images/dice/starwars/red.png",
					color: "#751317"
				},
				di: {
					tooltip: game.i18n.localize("SWFFG.DiceDifficulty"),
					img: "systems/starwarsffg/images/dice/starwars/purple.png",
					color: "#52287e"
				},
				db: {
					tooltip: game.i18n.localize("SWFFG.DiceBoost"),
					img: "systems/starwarsffg/images/dice/starwars/blue.png",
					color: "#76c3db"
				},
				ds: {
					tooltip: game.i18n.localize("SWFFG.DiceSetback"),
					img: "systems/starwarsffg/images/dice/starwars/black.png",
					color: "#141414"
				},
				df: {
					tooltip: game.i18n.localize("SWFFG.DiceForce"),
					img: "systems/starwarsffg/images/dice/starwars/whiteHex.png",
					color: "#ffffff"
				}
			}
		];
	}
}
