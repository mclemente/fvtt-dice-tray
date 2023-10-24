export class DiceCalculator {
	adv = false;

	customButtons = [];

	actorSpecificButtons(actor) {
		const abilities = [];
		const attributes = [];
		const customButtons = [];
		return { abilities, attributes, customButtons };
	}

	getData(actor = null) {
		let { abilities, attributes, customButtons } = this.actorSpecificButtons(actor);
		return {
			abilities,
			attributes,
			customButtons: [...customButtons, ...this.customButtons]
		};
	}
}
