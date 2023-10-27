import GenericDiceMap from "./templates/template.js";

export default class DungeonCrawlClassicsDiceMap extends GenericDiceMap {
	// Redundant, buttons don't keep lit up on use
	removeAdvOnRoll = false;

	get buttonFormulas() {
		return {
			kh: "+1",
			kl: "-1"
		};
	}

	get dice() {
		return [
			{
				d3: { img: "modules/dice-calculator/assets/icons/d3black.svg" },
				d4: { img: "icons/dice/d4black.svg" },
				d5: { img: "modules/dice-calculator/assets/icons/d5black.svg" },
				d6: { img: "icons/dice/d6black.svg" },
				d7: { img: "modules/dice-calculator/assets/icons/d7black.svg" },
				d8: { img: "icons/dice/d8black.svg" },
				d10: { img: "icons/dice/d10black.svg" },
			},
			{
				d12: { img: "icons/dice/d10black.svg" },
				d14: { img: "modules/dice-calculator/assets/icons/d14black.svg" },
				d16: { img: "modules/dice-calculator/assets/icons/d16black.svg" },
				d20: { img: "icons/dice/d20black.svg" },
				d24: { img: "modules/dice-calculator/assets/icons/d24black.svg" },
				d30: { img: "modules/dice-calculator/assets/icons/d30black.svg" },
				d100: { img: "modules/dice-calculator/assets/icons/d100black.svg" },
			},
		];
	}

	get labels() {
		return {
			advantage: "DICE_TRAY.PlusOneDieLong",
			adv: "DICE_TRAY.PlusOneDie",
			disadvantage: "DICE_TRAY.MinusOneDieLong",
			dis: "DICE_TRAY.MinusOneDie"
		};
	}

	_extraButtonsLogic(html) {
		html.find(".dice-tray__ad").on("click", (event) => {
			event.preventDefault();
			// Get the chat box
			let $chat = html.find("#chat-form textarea");
			let chat_val = String($chat.val());
			let match_string = /(\d+)d(\d+)/;

			// Find the first dice on the line to update
			const match = chat_val.match(match_string);
			if (match) {
				const dice_chain = [3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 30];
				// Locate this die in the dice chain
				const chain_index = dice_chain.indexOf(parseInt(match[2]));
				if (chain_index >= 0) {
					const new_index = chain_index + parseInt(event.currentTarget.dataset.formula);
					// Is the new index still in range?
					if (new_index >= 0 && new_index < dice_chain.length) {
						chat_val = chat_val.replace(match_string, `${match[1]}d${dice_chain[new_index]}`);
					}
				}
			}

			// Update the value.
			$chat.val(chat_val);
		});
	}
}
