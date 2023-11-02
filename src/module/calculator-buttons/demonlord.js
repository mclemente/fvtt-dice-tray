import { DiceCalculator } from "./templates/calculator";

export default class demonlordDiceCalculator extends DiceCalculator {
	adv = false;

	abilities = ["agility", "intellect", "perception", "strength", "will"]; // The system calls these "attribtues"

	attributes = ["corruption", "insanity"]; // The system calls these "Characteristics"

	actorSpecificButtons(actor) {
		const attributes = [];
		const abilities = [];
		const customButtons = [];

		if (actor) {
			if (actor.system?.attributes) {
				for (let prop in actor.system.attributes) {
					if (this.abilities.includes(prop)) {
						if (actor.system.attributes[prop].modifier !== undefined) {
							abilities.push({
								label: prop,
								name: game.i18n.localize(`DL.Attribute${prop.capitalize()}`),
								formula: `@attr.${prop}.modifier`
							});
						}
					}
				}

				if (actor.system?.level) {
					const level = actor.system.level;
					attributes.push(...[
						{
							label: "level",
							name: game.i18n.localize("DL.CharLevel"),
							formula: "@level"
						},
						{
							label: "level_half",
							name: `1/2 ${game.i18n.localize("DL.CharLevel")}`,
							formula: level !== undefined ? Math.floor(level / 2) : 0
						}
					]);
				}
			}
			if (actor.system?.characteristics) {
				for (let prop in actor.system.characteristics) {
					if (this.attributes.includes(prop)) {
						if (actor.system.characteristics[prop].value !== undefined) {
							attributes.push({
								label: prop,
								name: game.i18n.localize(`DL.Char${prop.capitalize()}`),
								formula: `@characteristics.${prop}.value`
							});
						}
					}
				}
			}
		}

		return { abilities, attributes, customButtons };
	}
}
