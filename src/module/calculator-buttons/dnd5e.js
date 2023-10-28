import { DiceCalculator } from "./templates/calculator";

export default class dnd5eDiceCalculator extends DiceCalculator {
	adv = true;

	abilities = ["str", "dex", "con", "int", "wis", "cha"];

	attributes = {
		init: game.i18n.localize("DND5E.Initiative"),
		prof: game.i18n.localize("DND5E.Proficiency")
	};

	actorSpecificButtons(actor) {
		const abilities = [];
		const attributes = [];
		const customButtons = [];

		if (actor) {
			if (actor.system.abilities) {
				for (let prop in actor.system.abilities) {
					if (this.abilities.includes(prop)) {
						let formula = "";
						if (actor.system.abilities[prop].mod !== undefined) {
							formula = `@abil.${prop}.mod`;
						} else if (actor.system.abilities[prop].value !== undefined) {
							formula = `@abil.${prop}.value`;
						} else {
							formula = `@abil.${prop}`;
						}
						abilities.push({
							label: prop,
							name: game.i18n.localize(`DND5E.Ability${prop.capitalize()}Abbr`),
							formula: formula
						});
					}
				}
			}
			if (actor.system.attributes) {
				if (actor.system?.details?.level) {
					const level = actor.system.details.level;
					attributes.push(...[
						{
							label: "level",
							name: game.i18n.localize("DND5E.Level"),
							formula: "@details.level"
						},
						{
							label: "level_half",
							name: `1/2 ${game.i18n.localize("DND5E.Level")}`,
							formula: level !== undefined ? Math.floor(level / 2) : 0
						}
					]);
				}

				for (let prop in actor.system.attributes) {
					if (prop in this.attributes) {
						let formula = "";
						if (actor.system.attributes[prop].mod !== undefined) {
							formula = `@attr.${prop}.mod`;
						} else if (actor.system.attributes[prop].value !== undefined) {
							formula = `@attr.${prop}.value`;
						} else {
							formula = `@attr.${prop}`;
						}
						attributes.push({
							label: prop,
							name: this.attributes[prop],
							formula: formula
						});
					}
				}
				if (actor.system?.attributes?.prof) {
					const prof = actor.system.attributes.prof;
					attributes.push({
						label: "prof_half",
						name: "1/2 Prof",
						formula: prof !== undefined ? Math.floor(prof / 2) : 0
					});
					attributes.push({
						label: "prof_double",
						name: "2x Prof",
						formula: prof !== undefined ? 2 * prof : 0
					});
				}
			}
		}

		return { abilities, attributes, customButtons };
	}
}
