import GenericDiceMap from "./templates/template.js";

export default class pf2eDiceMap extends GenericDiceMap {
	get buttonFormulas() {
		if (game.settings.get("dice-calculator", "flatCheck")) {
			return {
				kh: 5,
				kl: 11
			};
		}
		return super.buttonFormulas;
	}

	get dice() {
		return [
			{
				d4: { img: "icons/dice/d4black.svg" },
				d6: { img: "icons/dice/d6black.svg" },
				d8: { img: "icons/dice/d8black.svg" },
				d10: { img: "icons/dice/d10black.svg" },
				d12: { img: "icons/dice/d12black.svg" },
				d20: { img: "icons/dice/d20black.svg" }
			}
		];
	}

	flatCheckLabel(dc) {
		return game.i18n.format("DICE_TRAY.SETTINGS.PF2E.flatCheckLabel", {
			dc: game.i18n.format("PF2E.InlineAction.Check.DC", { dc }),
			text: game.i18n.localize("PF2E.FlatCheck"),
		});
	}

	get labels() {
		if (game.settings.get("dice-calculator", "flatCheck")) {
			const dc = game.i18n.localize("PF2E.Check.DC.Unspecific");
			return {
				advantage: this.flatCheckLabel(5),
				adv: game.i18n.format("DICE_TRAY.SETTINGS.PF2E.flatCheckLabel", { dc, text: 5 }),
				disadvantage: this.flatCheckLabel(11),
				dis: game.i18n.format("DICE_TRAY.SETTINGS.PF2E.flatCheckLabel", { dc, text: 11 }),
			};
		}
		return {
			advantage: "DICE_TRAY.Fortune",
			adv: "DICE_TRAY.For",
			disadvantage: "DICE_TRAY.Misfortune",
			dis: "DICE_TRAY.Mis"
		};
	}

	get settings() {
		return {
			flatCheck: {
				name: "DICE_TRAY.SETTINGS.PF2E.flatCheck.name",
				hint: "DICE_TRAY.SETTINGS.PF2E.flatCheck.hint",
				default: true,
				type: Boolean,
				onChange: () => CONFIG.DICETRAY.render()
			}
		};
	}

	_extraButtonsLogic(html) {
		if (game.settings.get("dice-calculator", "flatCheck")) {
			for (const button of html.querySelectorAll(".dice-tray__ad")) {
				button.addEventListener("click", (event) => {
					event.preventDefault();
					const { formula } = event.currentTarget.dataset;
					const actor = canvas.tokens.controlled.length === 1
						? canvas.tokens.controlled[0].actor
						: game.user.character ?? {};
					game.pf2e.Check.roll(new game.pf2e.StatisticModifier(this.flatCheckLabel(formula), []), {
						actor: actor ?? {},
						type: "flat-check",
						dc: { value: formula },
						options: new Set(["flat-check"]),
						createMessage: true,
						skipDialog: true,
					});
				});
			}
		} else {
			super._extraButtonsLogic(html);
		}
	}
}
