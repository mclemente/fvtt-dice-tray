import GenericDiceMap from "./templates/template.js";

export default class DungeonCrawlClassicsDiceMap extends GenericDiceMap {
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

	applyLayout(html) {
		let dice_chain = [3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 30];
		let labels = {
			plusdie: "DICE_TRAY.PlusOneDieLong",
			plusd: "DICE_TRAY.PlusOneDie",
			minusdie: "DICE_TRAY.MinusOneDieLong",
			minusd: "DICE_TRAY.MinusOneDie",
		};
		html.find(".dice-tray__roll").on("click", (event) => {
			event.preventDefault();
			let spoofed = this.triggerRollClick();
			// Trigger the event.
			html.find("#chat-message").trigger(spoofed);
			html.find(".dice-tray__input").val(0);
			html.find(".dice-tray__flag").text("");
			html.find(".dice-tray__flag").addClass("hide");
		});
		html.find("#chat-message").keydown((e) => {
			if (e.code === "Enter" || e.key === "Enter" || e.keycode === "13") {
				html.find(".dice-tray__flag").text("");
				html.find(".dice-tray__flag").addClass("hide");
			}
		});
		html.find("#dice-tray-math").show();
		html.find("#dice-tray-math").append(
			`<div class="dice-tray__stacked flexcol">
                <button class="dice-tray__dicechain" data-mod="+1" data-tooltip="${game.i18n.localize(labels.plusdie)}" data-tooltip-direction="UP">
					${game.i18n.localize(labels.plusd)}
				</button>
                <button class="dice-tray__dicechain" data-mod="-1" data-tooltip="${game.i18n.localize(labels.minusdie)}" data-tooltip-direction="UP">
					${game.i18n.localize(labels.minusd)}
				</button>
            </div>`
		);
		html.find(".dice-tray__dicechain").on("click", (event) => {
			event.preventDefault();
			// Get the chat box
			let $chat = html.find("#chat-form textarea");
			let chat_val = String($chat.val());
			let match_string = /(\d+)d(\d+)/;

			// Find the first dice on the line to update
			const match = chat_val.match(match_string);
			if (match) {
				// Locate this die in the dice chain
				const chain_index = dice_chain.indexOf(parseInt(match[2]));
				if (chain_index >= 0) {
					const new_index = chain_index + parseInt(event.currentTarget.dataset.mod);
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
