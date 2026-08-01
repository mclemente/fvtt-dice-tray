import GenericDiceMap from "./templates/template.js";

export default class cosmereDiceMap extends GenericDiceMap {
	get dice() {
		return {
			dp: { img: "systems/cosmere-rpg/assets/icons/svg/dice/dp_op.svg", tooltip: game.i18n.localize("DICE.Plot.Die") },
			...super.dice
		};
	}

	get rows() {
		const { d4, d6, d8, d10, d12, d20, dp } = this.dice;
		return [d4, d6, d8, d10, d12, d20, dp];
	}

	get labels() {
		return {
			advantage: "DICE_TRAY.Advantage",
			adv: "DICE_TRAY.Adv",
			disadvantage: "DICE_TRAY.Disadvantage",
			dis: "DICE_TRAY.Dis"
		};
	}
}
