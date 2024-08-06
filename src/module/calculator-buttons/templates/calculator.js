export default class DiceCalculator {
	/** Sets if the KH/KL buttons will be called Advantage/Disadvantage */
	adv = false;

	/** Buttons that aren't dependent on an actor being selected, like extra dice buttons */
	customButtons = [];

	/**
	 * Handles the data and returns it to the module.
	 * @returns {{Array}}
	 */
	getData() {
		return {
			customButtons: this.customButtons
		};
	}
}
