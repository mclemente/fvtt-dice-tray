export class DiceCalculator {
	/** Sets if the KH/KL buttons will be called Advantage/Disadvantage */
	adv = false;

	/** Buttons that aren't dependent on an actor being selected, like extra dice buttons */
	customButtons = [];

	/**
	 * Gets buttons that are specific to an actor.
	 * @param {Actor} actor
	 * @returns {{Array, Array ,Array}}
	 */
	actorSpecificButtons(actor) {
		const abilities = [];
		const attributes = [];
		const customButtons = [];
		return { abilities, attributes, customButtons };
	}

	/**
	 * Handles the data and returns it to the module.
	 * @param {Actor} actor
	 * @returns {{Array, Array ,Array}}
	 */
	getData(actor = null) {
		let { abilities, attributes, customButtons } = this.actorSpecificButtons(actor);
		return {
			abilities,
			attributes,
			customButtons: [...customButtons, ...this.customButtons]
		};
	}
}
