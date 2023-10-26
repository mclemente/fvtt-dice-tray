import GenericDiceMap from "./templates/template.js";

export default class pf2eDiceMap extends GenericDiceMap {
	get labels() {
		return {
			advantage: "DICE_TRAY.Fortune",
			adv: "DICE_TRAY.For",
			disadvantage: "DICE_TRAY.Misfortune",
			dis: "DICE_TRAY.Mis"
		};
	}
}
