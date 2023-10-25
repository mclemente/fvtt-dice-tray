import GenericDiceMap from "./templates/template.js";

export default class SWADEDiceMap extends GenericDiceMap {
	get dice() {
		const dice = [
			{
				d4: { img: "icons/dice/d4black.svg" },
				d6: { img: "icons/dice/d6black.svg" },
				d8: { img: "icons/dice/d8black.svg" },
				d10: { img: "icons/dice/d10black.svg" },
				d12: { img: "icons/dice/d12black.svg" }
			}
		];
		if (game.settings.get("dice-calculator", "enableExtraDiceInSwade")) {
			dice[0].d20 = { img: "icons/dice/d20black.svg" };
			dice[0].d100 = { img: "icons/dice/d100black.svg" };
		}
		return dice;
	}

	applyLayout(html) {
		html.find("#dice-tray-math").show();
		html.find("#dice-tray-math").append(
			`<div class="dice-tray__stacked flexcol">
                <button class="dice-tray__ad dice-tray__advantage" data-formula="kh" data-tooltip="${game.i18n.localize("DICE_TRAY.WildDie")}" data-tooltip-direction="UP">
                    ${game.i18n.localize("DICE_TRAY.Wild")}
                </button>
                <button class="dice-tray__ad dice-tray__disadvantage" data-formula="kl" data-tooltip="${game.i18n.localize("DICE_TRAY.ExplodingDie")}" data-tooltip-direction="UP">
                    ${game.i18n.localize("DICE_TRAY.Ace")}
                </button>
            </div>`
		);
		html.find(".dice-tray__advantage").on("click", (event) => {
			event.preventDefault();
			if (!html.find(".dice-tray__advantage").hasClass("active")) {
				html.find(".dice-tray__advantage").addClass("active");
				html.find(".dice-tray__disadvantage").addClass("active");
			}
			else {
				html.find(".dice-tray__advantage").removeClass("active");
			}
		});
		html.find(".dice-tray__disadvantage").on("click", (event) => {
			event.preventDefault();
			if (!html.find(".dice-tray__disadvantage").hasClass("active")) {
				html.find(".dice-tray__disadvantage").addClass("active");
			}
			else {
				html.find(".dice-tray__disadvantage").removeClass("active");
				html.find(".dice-tray__advantage").removeClass("active");
			}
		});
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
	}

	rawFormula(qty, dice, html) {
		let roll_suffix = "";
		let add_wild = html.find(".dice-tray__advantage").hasClass("active");

		if (html.find(".dice-tray__disadvantage").hasClass("active")) {
			roll_suffix = "x=";
		}

		if (add_wild) {
			return `{${qty === "" ? 1 : qty}${dice}${roll_suffix},1d6${roll_suffix}}kh`;
		}
		return `${qty === "" ? 1 : qty}${dice}${roll_suffix}`;
	}
}

