import GenericDiceMap from "./templates/template.js";

export default class dnd5eDiceMap extends GenericDiceMap {
	get labels() {
		return {
			advantage: "DICE_TRAY.Advantage",
			adv: "DICE_TRAY.Adv",
			disadvantage: "DICE_TRAY.Disadvantage",
			dis: "DICE_TRAY.Dis"
		};
	}
}
