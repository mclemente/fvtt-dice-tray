import DiceCalculator from "./templates/calculator";

export default class pf2eDiceCalculator extends DiceCalculator {
	adv = true;

	abilities = ["str", "dex", "con", "int", "wis", "cha"];

	attributes = ["perception"];

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
							name: game.i18n.localize(`PF2E.AbilityId.${prop}`),
							formula: formula
						});
					}
				}
			}
			if (actor.system.attributes?.perception) {
				let formula = "@attr.perception.value";
				attributes.push({
					label: "perception",
					name: game.i18n.localize("PF2E.PerceptionLabel"),
					formula: formula
				});
			}
			if (actor.system.details?.level?.value) {
				attributes.push(...[
					{
						label: "level",
						name: game.i18n.localize("PF2E.LevelLabel"),
						formula: "@details.level.value"
					},
					{
						label: "prof_t",
						name: game.i18n.localize("PF2E.ProficiencyLevel1"),
						formula: "(2 + @details.level.value)"
					},
					{
						label: "prof_e",
						name: game.i18n.localize("PF2E.ProficiencyLevel2"),
						formula: "(4 + @details.level.value)"
					},
					{
						label: "prof_m",
						name: game.i18n.localize("PF2E.ProficiencyLevel3"),
						formula: "(6 + @details.level.value)"
					},
					{
						label: "prof_l",
						name: game.i18n.localize("PF2E.ProficiencyLevel4"),
						formula: "(8 + @details.level.value)"
					},
				]);
			}
		}

		return { abilities, attributes, customButtons };
	}
}
