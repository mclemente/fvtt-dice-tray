import DiceCalculator from "./templates/calculator";

export default class archmageDiceCalculator extends DiceCalculator {
	adv = true;

	abilities = ["str", "dex", "con", "int", "wis", "cha"];

	attributes = ["init", "level", "standardBonuses"];

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
							name: game.i18n.localize(`ARCHMAGE.${prop}.key`),
							formula: formula
						});
					}
				}
				// Add a custom row of buttons based on 13th Age's ability damage at high levels.
				let levelMultiplier = 1;
				if (actor.data.data.attributes.level.value >= 8) {
					levelMultiplier = 3;
				} else if (actor.data.data.attributes.level.value >= 5) {
					levelMultiplier = 2;
				}

				if (levelMultiplier > 1) {
					for (let prop in actor.system.abilities) {
						customButtons.push({
							label: prop,
							name: `${levelMultiplier}x ${prop}`,
							formula: `(${levelMultiplier} * @abil.str.mod)`
						});
					}
				}
			}
			if (actor.system.attributes) {
				for (let prop of this.attributes) {
					if (prop in actor.system.attributes) {
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
							name: prop,
							formula: formula
						});
					}
				}
				if (actor.system.attributes?.level) {
					const level = actor.system.attributes.level;
					attributes.push({
						label: "level_half",
						name: "1/2 Level",
						formula: level !== undefined ? Math.floor(level / 2) : 0
					});
				}
			}
			attributes.push(...[
				{
					label: "escalation",
					name: "Esc. Die",
					formula: "@attr.escalation.value"
				},
				{
					label: "melee",
					name: "W [Melee]",
					formula: "@attr.weapon.melee.value"
				},
				{
					label: "ranged",
					name: "W [Ranged]",
					formula: "@attr.weapon.ranged.value"
				},
				{
					label: "standard_bonuses",
					name: "Standard Bonuses",
					formula: "@attr.standardBonuses.value"
				}
			]);
		}

		return { abilities, attributes, customButtons };
	}
}
