import { DiceCalculator } from "./templates/calculator";

export default class dccDiceCalculator extends DiceCalculator {
	abilities = ["str", "agl", "sta", "per", "int", "lck"];

	customButtons = [
		{
			label: "d3",
			name: "d3",
			formula: "d3"
		},
		{
			label: "d5",
			name: "d5",
			formula: "d5"
		},
		{
			label: "d7",
			name: "d7",
			formula: "d7"
		},
		{
			label: "d14",
			name: "d14",
			formula: "d14"
		},
		{
			label: "d16",
			name: "d16",
			formula: "d16"
		},
		{
			label: "d24",
			name: "d24",
			formula: "d24"
		},
		{
			label: "d30",
			name: "d30",
			formula: "d30"
		}
	];

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
						}
						else if (actor.system.abilities[prop].value !== undefined) {
							formula = `@abil.${prop}.value`;
						}
						else {
							formula = `@abil.${prop}`;
						}
						abilities.push({
							label: prop,
							name: game.i18n.localize(`DCC.Ability${prop.capitalize()}Short`),
							formula: formula
						});
					}
				}
			}
			if (actor.system.details?.level?.value) {
				attributes.push({
					label: "level",
					name: game.i18n.localize("DCC.Level"),
					formula: "@details.level.value"
				});
			}
		}

		return { abilities, attributes, customButtons };
	}
}
