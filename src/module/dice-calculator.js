class DiceCalculator {
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

class archmageDiceCalculator extends DiceCalculator {
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

class dccDiceCalculator extends DiceCalculator {
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
						} else if (actor.system.abilities[prop].value !== undefined) {
							formula = `@abil.${prop}.value`;
						} else {
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

class demonlordDiceCalculator extends DiceCalculator {
	adv = false;

	abilities = ["agility", "intellect", "perception", "strength", "will"]; // The system calls these "attribtues"

	attributes = ["corruption", "insanity"]; // The system calls these "Characteristics"

	actorSpecificButtons(actor) {
		const attributes = [];
		const abilities = [];
		const customButtons = [];

		if (actor) {
			if (actor.system?.attributes) {
				for (let prop in actor.system.attributes) {
					if (this.abilities.includes(prop)) {
						if (actor.system.attributes[prop].modifier !== undefined) {
							abilities.push({
								label: prop,
								name: game.i18n.localize(`DL.Attribute${prop.capitalize()}`),
								formula: `@attr.${prop}.modifier`
							});
						}
					}
				}

				if (actor.system?.level) {
					const level = actor.system.level;
					attributes.push(...[
						{
							label: "level",
							name: game.i18n.localize("DL.CharLevel"),
							formula: "@level"
						},
						{
							label: "level_half",
							name: `1/2 ${game.i18n.localize("DL.CharLevel")}`,
							formula: level !== undefined ? Math.floor(level / 2) : 0
						}
					]);
				}
			}
			if (actor.system?.characteristics) {
				for (let prop in actor.system.characteristics) {
					if (this.attributes.includes(prop)) {
						if (actor.system.characteristics[prop].value !== undefined) {
							attributes.push({
								label: prop,
								name: game.i18n.localize(`DL.Char${prop.capitalize()}`),
								formula: `@characteristics.${prop}.value`
							});
						}
					}
				}
			}
		}

		return { abilities, attributes, customButtons };
	}
}

class dnd5eDiceCalculator extends DiceCalculator {
	adv = true;

	abilities = ["str", "dex", "con", "int", "wis", "cha"];

	attributes = {
		init: game.i18n.localize("DND5E.Initiative"),
		prof: game.i18n.localize("DND5E.Proficiency")
	};

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
							name: game.i18n.localize(`DND5E.Ability${prop.capitalize()}Abbr`),
							formula: formula
						});
					}
				}
			}
			if (actor.system.attributes) {
				if (actor.system?.details?.level) {
					const level = actor.system.details.level;
					attributes.push(...[
						{
							label: "level",
							name: game.i18n.localize("DND5E.Level"),
							formula: "@details.level"
						},
						{
							label: "level_half",
							name: `1/2 ${game.i18n.localize("DND5E.Level")}`,
							formula: level !== undefined ? Math.floor(level / 2) : 0
						}
					]);
				}

				for (let prop in actor.system.attributes) {
					if (prop in this.attributes) {
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
							name: this.attributes[prop],
							formula: formula
						});
					}
				}
				if (actor.system?.attributes?.prof) {
					const prof = actor.system.attributes.prof;
					attributes.push({
						label: "prof_half",
						name: "1/2 Prof",
						formula: prof !== undefined ? Math.floor(prof / 2) : 0
					});
					attributes.push({
						label: "prof_double",
						name: "2x Prof",
						formula: prof !== undefined ? 2 * prof : 0
					});
				}
			}
		}

		return { abilities, attributes, customButtons };
	}
}

class pf2eDiceCalculator extends DiceCalculator {
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

var diceCalculators = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Template: DiceCalculator,
	archmage: archmageDiceCalculator,
	dcc: dccDiceCalculator,
	demonlord: demonlordDiceCalculator,
	dnd5e: dnd5eDiceCalculator,
	pf2e: pf2eDiceCalculator
});

class TemplateDiceMap {
	/** Unmark the KH/KL buttons if a roll is made */
	removeAdvOnRoll = true;

	/** Shows the KH/KL buttons */
	showExtraButtons = true;

	/**
	 * The formula that will be rendered on the KH/KL buttons
	 * @returns {{}}
	 *
	 * @example Making the buttons be +1/-1 for additional logic
	 * ```js
	 * return {
	 *	kh: "+1",
	 *	kl: "-1"
	 * };
	 */
	get buttonFormulas() {
		return {
			kh: "kh",
			kl: "kl"
		};
	}

	/**
	 * The dice rows that will be shown on the dice tray.
	 * @property {String} color		Optional RGB or Hex value that colors a dice's background image. If none is preset, it will be white.
	 * @property {String} img		The path to an image that will be shown on the button. If none is present, the label will be used instead.
	 * @property {String} label		The label meant to be used when the button doesn't have a proper image, like Fate Dice or multiple dice.
	 * @property {String} tooltip	Optional tooltip that will be shown instead of the key. Useful for special dice like Genesys system's.
	 * @returns {[Object]}
	 *
	 * @example
	 * ```js Dice buttons with mixed image/label
	 * return [{
	 * 	d6: { img: "icons/dice/d6black.svg" },
	 *  "4df": { label: "Fate Dice" }
	 * }];
	 * ```
	 *
	 * @example Dice buttons with just labels
	 * ```js
	 * return [{
	 * 	d6: { label: "1d6" },
	 *  "2d6": { label: "2d6" }
	 *  "3d6": { label: "3d6" }
	 * }];
	 * ```
	 *
	 * @example Dice buttons with tooltips
	 * ```js
	 * return [{
	 * 	da: { tooltip: "Proficiency" },
	 *  ds: { tooltip: "Setback" }
	 *  df: { tooltip: "Force" }
	 * }];
	 * ```
	 */
	get dice() {
		return [
			{
				d4: { img: "icons/dice/d4black.svg" },
				d6: { img: "icons/dice/d6black.svg" },
				d8: { img: "icons/dice/d8black.svg" },
				d10: { img: "icons/dice/d10black.svg" },
				d12: { img: "icons/dice/d12black.svg" },
				d20: { img: "icons/dice/d20black.svg" },
				d100: { img: "modules/dice-calculator/assets/icons/d100black.svg" },
			}
		];
	}

	/**
	 * Labels that will be shown on the Keep Highest/Lowest button if they are shown.
	 */
	get labels() {
		return {
			advantage: "DICE_TRAY.KeepHighest",
			adv: "KH",
			disadvantage: "DICE_TRAY.KeepLowest",
			dis: "KL"
		};
	}

	/**
	 * Logic to set display the additiona KH/KL buttons and event listeners.
	 * @param {HTMLElement} html
	 */
	applyLayout(html) {
		if (this.showExtraButtons) {
			this._createExtraButtons(html);
			this._extraButtonsLogic(html);
		}

		/** Clicking the Roll button clears and hides all orange number flags, and unmark the KH/KL keys */
		html.find(".dice-tray__roll").on("click", (event) => {
			event.preventDefault();
			let spoofed = this.triggerRollClick();
			html.find("#chat-message").trigger(spoofed);
			this._resetTray(html);
		});

		/** Sending a message on the chat form clears the text and hides the orange numbers */
		html.find("#chat-message").keydown((e) => {
			if (e.code === "Enter" || e.key === "Enter" || e.keycode === "13") {
				this._resetTray(html);
			}
		});
	}

	/**
	 * Creates the KH/KL buttons
	 * @param {HTMLElement} html
	 */
	_createExtraButtons(html) {
		const { kh, kl } = this.buttonFormulas;
		html.find("#dice-tray-math").removeAttr("hidden");
		html.find("#dice-tray-math").append(
			`<div class="dice-tray__stacked flexcol">
                <button class="dice-tray__ad dice-tray__advantage"
					data-formula="${kh}"
					data-tooltip="${game.i18n.localize(this.labels.advantage)}"
					data-tooltip-direction="UP">
                    ${game.i18n.localize(this.labels.adv)}
                </button>
                <button class="dice-tray__ad dice-tray__disadvantage"
					data-formula="${kl}"
					data-tooltip="${game.i18n.localize(this.labels.disadvantage)}"
					data-tooltip-direction="UP">
                    ${game.i18n.localize(this.labels.dis)}
                </button>
            </div>`
		);
	}

	/**
	 * Sets the logic for using the KH/KL buttons.
	 * This version appends KH/KL to rolls. Check DCC or SWADE for other uses.
	 * @param {HTMLElement} html
	 */
	_extraButtonsLogic(html) {
		html.find(".dice-tray__ad").attr("draggable", true).on("click", (event) => {
			event.preventDefault();
			let dataset = event.currentTarget.dataset;
			let $chat = html.find("#chat-form textarea");
			let chat_val = String($chat.val());
			let match_string = /\d*d\d+[khl]*/;

			// If there's a d20, toggle the current if needed.
			if (match_string.test(chat_val)) {
				// If there was previously a kh or kl, update it.
				if (/d\d+k[hl]/g.test(chat_val)) {
					chat_val = chat_val.replace(/(\d*)(d\d+)(k[hl]\d*)/g, (match, p1, p2, p3, offset, string) => {
						let diceKeep = this.updateDiceKeep(p1, p2, p3, -1, dataset.formula);
						html.find(`.dice-tray__flag--${p2}`).text(diceKeep.count);
						return diceKeep.content;
					});
				}
				// Otherwise, add it.
				else {
					chat_val = chat_val.replace(/(\d*)(d\d+)/g, (match, p1, p2, offset, string) => {
						let diceKeep = this.updateDiceKeep(p1, p2, "", 1, dataset.formula);
						html.find(`.dice-tray__flag--${p2}`).text(diceKeep.count);
						return diceKeep.content;
					});
				}
			}
			// else {
			// 	let diceKeep = this.updateDiceKeep("1", "d20", "", 1, dataset.formula);
			// 	html.find(".dice-tray__flag--d20").text(diceKeep.count);
			// 	chat_val += diceKeep.content;
			// }

			// Handle toggle classes.
			if (chat_val.includes("kh")) {
				html.find(".dice-tray__advantage").addClass("active");
			} else {
				html.find(".dice-tray__advantage").removeClass("active");
			}

			if (chat_val.includes("kl")) {
				html.find(".dice-tray__disadvantage").addClass("active");
			} else {
				html.find(".dice-tray__disadvantage").removeClass("active");
			}
			// Update the value.
			$chat.val(chat_val);
		});
	}

	_resetTray(html) {
		html.find(".dice-tray__input").val(0);
		html.find(".dice-tray__flag").text("").addClass("hide");
		if (this.removeAdvOnRoll) {
			html.find(".dice-tray__ad").removeClass("active");
		}
	}

	/**
	 * Logic to apply the number on the -/+ selector.
	 * @param {HTMLElement} html
	 */
	applyModifier(html) {
		const $mod_input = html.find(".dice-tray__input");
		const mod_val = Number($mod_input.val());

		if ($mod_input.length === 0 || isNaN(mod_val)) return;

		let mod_string = "";
		if (mod_val > 0) {
			mod_string = `+${mod_val}`;
		} else if (mod_val < 0) {
			mod_string = `${mod_val}`;
		}

		const $chat = html.find("#chat-form textarea");
		const chat_val = String($chat.val());

		const match_string = /(\+|-)(\d+)$/;
		if (match_string.test(chat_val)) {
			$chat.val(chat_val.replace(match_string, mod_string));
		} else if (chat_val !== "") {
			$chat.val(chat_val + mod_string);
		} else {
			const rollPrefix = this._getRollMode(html);
			$chat.val(`${rollPrefix} ${mod_string}`);
		}
		if (/(\/r|\/gmr|\/br|\/sr) $/g.test($chat.val())) {
			$chat.val("");
		}
	}

	/**
	 * Returns a string with the number of dice to be rolled.
	 * Generally simple, unless the system demands some complex use.
	 * Consider checking SWADE's implementation.
	 * @param {String} qty
	 * @param {String} dice
	 * @param {HTMLElement} html
	 * @returns {String}
	 */
	rawFormula(qty, dice, html) {
		return `${qty === "" ? 1 : qty}${dice}`;
	}

	/**
	 * Creates a fake Enter keypress to trigger the chat message box.
	 * @returns {{}}
	 */
	triggerRollClick() {
		// Set up the keypress event properties.
		let spoofedProperties = {
			which: 13,
			keycode: 13,
			code: "Enter",
			key: "Enter",
		};
		// Create an event for the keypress.
		let spoofed = $.Event("keydown", spoofedProperties);
		// Create a second event for the originalEvent property.
		let spoofedOriginal = $.Event("keydown", spoofedProperties);
		spoofedOriginal.isComposing = false;
		// Assign the original event.
		spoofed.originalEvent = spoofedOriginal;

		return spoofed;
	}

	/**
	 * Handles clicks on the dice buttons.
	 * @param {Object} dataset
	 * @param {String} direction
	 * @param {HTMLElement} html
	 * @returns
	 */
	updateChatDice(dataset, direction, html) {
		const $chat = html.find("#chat-form textarea");
		let currFormula = String($chat.val());
		if (direction === "sub" && currFormula === "") return;
		let newFormula = null;
		let rollPrefix = this._getRollMode(html);
		let qty = 0;
		let dice = "";

		let match_dice = dataset.formula;
		if (dataset.formula === "d10") {
			// Filter out d100s
			match_dice = "d10(?!0)";
		} else if (/^(\d+)(d.+)/.test(dataset.formula)) {
			const match = dataset.formula.match(/^(\d+)(d.+)/);
			qty = Number(match[1]);
			match_dice = match[2];
			dice = match[2];
		}
		// Catch KH/KL
		match_dice = `${match_dice}[khl]*`;

		const match_string = new RegExp(`${this.rawFormula("(\\d*)", `(${match_dice})`, html)}(?=\\+|\\-|$)`);
		if (match_string.test(currFormula)) {
			const match = currFormula.match(match_string);
			const parts = {
				txt: match[0] || "",
				qty: match[1] || "1",
				die: match[2] || "",
			};

			if (parts.die === "" && match[3]) {
				parts.die = match[3];
			}

			qty = direction === "add" ? Number(parts.qty) + (qty || 1) : Number(parts.qty) - (qty || 1);

			// Update the dice quantity.
			qty = qty < 1 ? "" : qty;

			if (qty === "" && direction === "sub") {
				newFormula = "";
				const new_match_string = new RegExp(`${this.rawFormula("(\\d*)", `(${match_dice})`, html)}(?=\\+|\\-|$)`);
				currFormula = currFormula.replace(new_match_string, newFormula);
				if (new RegExp(`${rollPrefix}\\s+(?!.*d\\d+.*)`).test(currFormula)) {
					currFormula = "";
				}
			} else {
				newFormula = this.rawFormula(qty, parts.die, html);
				currFormula = currFormula.replace(match_string, newFormula);
			}
			$chat.val(currFormula);
		} else {
			if (!qty) {
				qty = 1;
			}
			if (currFormula === "") {
				$chat.val(`${rollPrefix} ${this.rawFormula(qty, dice || dataset.formula, html)}`);
			} else {
				const signal = (/(\/r|\/gmr|\/br|\/sr) (?!-)/g.test(currFormula)) ? "+" : "";
				currFormula = currFormula.replace(/(\/r|\/gmr|\/br|\/sr) /g, `${rollPrefix} ${this.rawFormula(qty, dice || dataset.formula, html)}${signal}`);
				$chat.val(currFormula);
			}
		}

		// TODO consider separate this into another method to make overriding simpler
		// TODO e.g. cases where a button adds 2+ dice

		// Add a flag indicator on the dice.
		qty = Number(qty);
		const $flag_button = html.find(`.dice-tray__flag--${dataset.formula}`);
		if (!qty) {
			qty = direction === "add" ? 1 : 0;
		}

		if (qty > 0) {
			$flag_button.text(qty);
			$flag_button.removeClass("hide");
		} else if (qty < 0) {
			$flag_button.text(qty);
		} else {
			$flag_button.text("");
			$flag_button.addClass("hide");
		}

		currFormula = $chat.val();
		currFormula = currFormula.replace(/(\/r|\/gmr|\/br|\/sr)(( \+)| )/g, `${rollPrefix} `).replace(/\+{2}/g, "+").replace(/-{2}/g, "-").replace(/\+$/g, "");
		$chat.val(currFormula);
		this.applyModifier(html);
	}

	/**
	 * Gets the selected roll mode
	 * @param {HTMLElement} html
	 * @returns {String}
	 */
	_getRollMode(html) {
		const rollMode = game.settings.get("core", "rollMode");
		switch (rollMode) {
			case "gmroll":
				return "/gmr";
			case "blindroll":
				return "/br";
			case "selfroll":
				return "/sr";
			case "publicroll":
			default:
				return "/r";
		}
	}

	/**
     * Process a formula to apply advantage or disadvantage. Should be used
     * within a regex replacer function's callback.
     *
     * @param {string} count | String match for the current dice count.
     * @param {string} dice | String match for the dice type (d20).
     * @param {string} khl | String match for kh|l (includes kh|l count).
     * @param {number} countDiff | Integer to adjust the dice count by.
     * @param {string} newKhl | Formula on the button (kh or kl).
     * @returns {object} Object with content and count keys.
     */
	updateDiceKeep(count, dice, khl, countDiff, newKhl) {
		// Start by getting the current number of dice (minimum 1).
		let keep = Number.isNumeric(count) ? Number(count) : 1;
		if (keep === 0) {
			keep = 1;
		}

		// Apply the count diff to adjust how many dice we need for adv/dis.
		let newCount = keep + countDiff;
		let newKeep = newCount - 1;

		// Handling toggling on/off advantage.
		if (khl) {
			// If switching from adv to dis or vice versa, adjust the formula to
			// simply replace the kh and kl while leaving the rest as it was prior
			// to applying the count diff.
			if (!khl.includes(newKhl)) {
				newCount = keep;
				newKeep = newCount - 1;
				khl = newKhl;
			}
			// If the adv/dis buttons were clicked after they were previously
			// applied, we need to remove them. If it's currently 2d20kh or kl,
			// change it to 1d20. Otherwise, only strip the kh or kl.
			else {
				newCount = keep > 2 ? keep : newCount;
				newKeep = 0;
			}
		}
		// If adv/dis weren't enabled, then that means we need to enable them.
		else {
			khl = newKhl;
		}

		// Limit the count to 2 when adding adv/dis to avoid accidental super advantage.
		if (newCount > 2 && newKeep > 0) {
			newCount = 2;
			newKeep = newCount - 1;
		}

		// Create the updated text string.
		let result = `${newCount > 0 ? newCount : 1}${dice}`;
		// Append kh or kl if needed.
		if (newCount > 1 && newKeep > 0) {
			result = `${result}${newKhl.includes("kh") ? "kh" : "kl"}`;
		}

		// TODO: This allows for keeping multiple dice, but in this case, we only need to keep one.
		// if (newCount > 1 && newKeep > 1) result = `${result}${newKeep}`;

		// Return an object with the updated text and the new count.
		return {
			content: result,
			count: newCount
		};
	}
}

class dccDiceMap extends TemplateDiceMap {
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

class demonlordDiceMap extends TemplateDiceMap {

	get dice() {
		const dice = [
			{
				d3: { img: "modules/dice-calculator/assets/icons/d3black.svg" },
				d6: { img: "icons/dice/d6black.svg" },
				d20: { img: "icons/dice/d20black.svg" }
			}
		];
		return dice;
	}

	get buttonFormulas() {
		return {
			kh: "+",
			kl: "-"
		};
	}

	get labels() {
		return {
			advantage: game.i18n.localize("DL.DialogBoon"),
			adv: game.i18n.localize("DL.DialogBoon"),
			disadvantage: game.i18n.localize("DL.DialogBane"),
			dis: game.i18n.localize("DL.DialogBane")
		};
	}

	_extraButtonsLogic(html) {
		html.find(".dice-tray__ad").on("click", (event) => {
			event.preventDefault();
			let sign = event.currentTarget.dataset.formula;
			let $chat = html.find("#chat-form textarea");
			let chat_val = String($chat.val());
			let match_string = /(?<sign>[+-])(?<qty>\d*)d6kh/;
			const match = chat_val.match(match_string);
			if (match) {
				let qty = parseInt(match.groups.qty);
				let replacement = "";
				if (match.groups.sign === sign) {
					qty += 1;
					replacement = `${sign}${qty}d6kh`;
				} else if (qty !== 1) {
					qty -=1;
					sign = (sign === "+") ? "-" : "+";
					replacement = `${sign}${qty}d6kh`;
				}
				chat_val = chat_val.replace(match_string, replacement);
			} else {
				chat_val = `${chat_val}${sign}1d6kh`;
			}
			$chat.val(chat_val);
		});
	}
}

class dnd5eDiceMap extends TemplateDiceMap {
	get labels() {
		return {
			advantage: "DICE_TRAY.Advantage",
			adv: "DICE_TRAY.Adv",
			disadvantage: "DICE_TRAY.Disadvantage",
			dis: "DICE_TRAY.Dis"
		};
	}
}

class FateDiceMap extends TemplateDiceMap {
	get dice() {
		return [
			{
				d6: { img: "icons/dice/d6black.svg" },
				"4df": { label: game.i18n.localize("DICE_TRAY.FateDice")},
			}
		];
	}
}

class pf2eDiceMap extends TemplateDiceMap {
	get labels() {
		return {
			advantage: "DICE_TRAY.Fortune",
			adv: "DICE_TRAY.For",
			disadvantage: "DICE_TRAY.Misfortune",
			dis: "DICE_TRAY.Mis"
		};
	}
}

class starwarsffgDiceMap extends TemplateDiceMap {
	showExtraButtons = false;

	get dice() {
		return [
			{
				dp: {
					tooltip: game.i18n.localize("SWFFG.DiceProficiency"),
					img: "systems/starwarsffg/images/dice/starwars/yellow.png",
					color: "#fef135"
				},
				da: {
					tooltip: game.i18n.localize("SWFFG.DiceAbility"),
					img: "systems/starwarsffg/images/dice/starwars/green.png",
					color: "#46ac4f"
				},
				dc: {
					tooltip: game.i18n.localize("SWFFG.DiceChallenge"),
					img: "systems/starwarsffg/images/dice/starwars/red.png",
					color: "#751317"
				},
				di: {
					tooltip: game.i18n.localize("SWFFG.DiceDifficulty"),
					img: "systems/starwarsffg/images/dice/starwars/purple.png",
					color: "#52287e"
				},
				db: {
					tooltip: game.i18n.localize("SWFFG.DiceBoost"),
					img: "systems/starwarsffg/images/dice/starwars/blue.png",
					color: "#76c3db"
				},
				ds: {
					tooltip: game.i18n.localize("SWFFG.DiceSetback"),
					img: "systems/starwarsffg/images/dice/starwars/black.png",
					color: "#141414"
				},
				df: {
					tooltip: game.i18n.localize("SWFFG.DiceForce"),
					img: "systems/starwarsffg/images/dice/starwars/whiteHex.png",
					color: "#ffffff"
				}
			}
		];
	}
}

class SWADEDiceMap extends TemplateDiceMap {
	removeAdvOnRoll = false;

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
		return dice;
	}

	get labels() {
		return {
			advantage: game.i18n.localize("DICE_TRAY.WildDie"),
			adv: game.i18n.localize("DICE_TRAY.Wild"),
			disadvantage: game.i18n.localize("DICE_TRAY.ExplodingDie"),
			dis: game.i18n.localize("DICE_TRAY.Ace")
		};
	}

	_extraButtonsLogic(html) {
		html.find(".dice-tray__advantage").on("click", (event) => {
			event.preventDefault();
			if (!html.find(".dice-tray__advantage").hasClass("active")) {
				html.find(".dice-tray__advantage").addClass("active");
				html.find(".dice-tray__disadvantage").addClass("active");
			} else {
				html.find(".dice-tray__advantage").removeClass("active");
			}
		});
		html.find(".dice-tray__disadvantage").on("click", (event) => {
			event.preventDefault();
			if (!html.find(".dice-tray__disadvantage").hasClass("active")) {
				html.find(".dice-tray__disadvantage").addClass("active");
			} else {
				html.find(".dice-tray__disadvantage").removeClass("active");
				html.find(".dice-tray__advantage").removeClass("active");
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

var keymaps = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Template: TemplateDiceMap,
	dcc: dccDiceMap,
	demonlord: demonlordDiceMap,
	dnd5e: dnd5eDiceMap,
	ModularFate: FateDiceMap,
	fateCoreOfficial: FateDiceMap,
	fatex: FateDiceMap,
	pf2e: pf2eDiceMap,
	starwarsffg: starwarsffgDiceMap,
	swade: SWADEDiceMap
});

class DiceCalculatorDialog extends Dialog {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "templates/hud/dialog.html",
			focus: true,
			classes: ["dialog", "dialog--dice-calculator"],
			width: 400,
			left: window.innerWidth - 710,
			jQuery: true
		});
	}

	activateListeners(html) {
		super.activateListeners(html);
		// Toggle the memory display.
		html.find(".dice-calculator__text-input").on("focus", (event) => {
			$(".dice-calculator__rolls--hidden").addClass("visible");
		});
		html.find(".dice-calculator__text-input").on("blur", (event) => {
			setTimeout(() => {
				$(".dice-calculator__rolls--hidden").removeClass("visible");
			}, 250);
		});

		// Replace with the selected die formula.
		html.find(".dice-calculator__roll").on("click", (event) => {
			let formula = event.target.textContent;
			$(".dice-calculator__text-input").val(formula);
		});

		// Update the dice formula.
		html.find(".dice-calculator--button").on("click", (event) => {
			event.preventDefault();

			// Retrieve variables to start things off.
			let buttonFormula = String($(event.currentTarget).data("formula"));
			let $formulaInput = $(document).find(".dice-calculator textarea");
			let currentFormula = $formulaInput.val();
			let currentFormulaArray = currentFormula.split(" ");
			let last = currentFormulaArray.slice(-1)[0];
			let skip = false;

			// Used for determining when to add directly.
			const standardDice = [
				"d3",
				"d4",
				"d6",
				"d8",
				"d10",
				"d12",
				"d20",
				"d30",
				"d100"
			];

			// Used to prevent doubling up on operations/symbols.
			const opFormulas = [
				"/",
				"*",
				"+",
				"-"
			];
			const parenthesesFormulas = [
				"(",
				")"
			];

			// If the last item and the incoming item are both math operations,
			// skip adding it.
			if (opFormulas.includes(last) && opFormulas.includes(buttonFormula)) {
				skip = true;
			}

			// If the incoming item is either an operation or parentheses, skip it
			// in certain cases.
			if (opFormulas.includes(buttonFormula)
			|| parenthesesFormulas.includes(buttonFormula)) {
				if (last === buttonFormula) {
					skip = true;
				}

				if (opFormulas.includes(last) || parenthesesFormulas.includes(last)) {
					skip = true;
				}
			}

			// Handle clear.
			if (buttonFormula === "CLEAR") {
				currentFormula = "";
			}
			// Handle backspace/delete.
			else if (buttonFormula === "DELETE") {
				currentFormulaArray.pop();
				currentFormula = currentFormulaArray.join(" ");
			}
			// Handle token attributes and abilities.
			else if (last.includes("@") || buttonFormula.includes("@")) {
				let joiner = opFormulas.includes(last) || opFormulas.includes(buttonFormula) ? " " : " + ";
				joiner = last.length < 1 ? "" : joiner;
				currentFormula = currentFormula + joiner + buttonFormula;
			}
			// Handle inputs such as 'd4' and 'd6'
			else if (buttonFormula.includes("d")) {
				let updated = false;
				let count = 0;
				// @TODO: Investigate whether this option is worthwhile, perhaps as a
				// a setting.
				// -----------------------------------------------------------------------
				// Loop through all existing items in the formula array to see if this
				// die type has been used before. If so, increase the count on that entry.
				// for (let i = 0; i < currentFormulaArray.length; i++) {
				//   if (currentFormulaArray[i].includes(buttonFormula)) {
				//     let result = currentFormulaArray[i].split('d');
				//     if (result[0] && (result[0].length !== 0 || !isNaN(result[0]))) {
				//       count = parseInt(result[0]);
				//     }
				//     else {
				//       count = 1;
				//     }
				//     updated = true;
				//     currentFormulaArray[i] = (count + 1) + buttonFormula;
				//   }
				// }

				// Update the number of dice in the last item if it's the same as the
				// button formula.
				const matchString = new RegExp(`${buttonFormula}(?!0)`, "i");
				if (matchString.test(last)) {
					let result = last.split("d");
					if (result[0] && (result[0].length !== 0 || !isNaN(result[0]))) {
						count = parseInt(result[0]);
					} else {
						count = 1;
					}
					const adv = result[1].split(/\d+/)[1];
					updated = true;
					currentFormulaArray[currentFormulaArray.length - 1] = (count + 1) + buttonFormula + adv;
				}
				// If we updated an item, create a new text version of the formula.
				if (updated) {
					currentFormula = currentFormulaArray.join(" ");
				}
				// Otherwise, append to the original.
				else {
					let joiner = " ";
					if (last.includes("d")) {
						joiner = " + ";
					} else if (!isNaN(last)) {
						joiner = "";
					}
					currentFormula = currentFormula + joiner + buttonFormula;
				}
			}
			// Handle adv/dis.
			else if (buttonFormula.includes("k")) {
				if (last.includes("d")) {
				// If the last item isn't kh or kl, append.
					let lastArray = last.split("k");
					if (!last.includes("k")) {
						if (/^(1|)(d\d+)/.test(last)) {
							const match = last.match(/^(1|)(d\d+)/);
							last = `2${match[2]}`;
						}

						currentFormula = currentFormula.slice(0, -1 * last.length);
						currentFormula = `${currentFormula} ${last}${buttonFormula}`.trim();
					}
					// Otherwise check to see if we should either replace (such as going
					// from kh to kl) or increase the count.
					else if (lastArray[1]) {
						let dieCount = lastArray[0].split("d")[0];
						let lastType = lastArray[1].substr(0, 1);
						let buttonType = buttonFormula.substr(1, buttonFormula.length);
						let lastCount = lastArray[1].substr(1, lastArray[1].length);
						let count = parseInt(lastCount);
						dieCount = parseInt(dieCount);
						dieCount = isNaN(dieCount) ? 1 : dieCount;
						count = isNaN(count) ? 2 : count + 1;

						// We need to avoid allowing more dice to be kept than are being
						// rolled.
						if (count >= dieCount) {
							count = dieCount - 1;
						}

						if (count === 1) {
							count = "";
						}

						// Build the new string.
						currentFormulaArray.pop();
						currentFormula = `${currentFormulaArray.join(" ")} ${lastArray[0]}k${buttonType}`.trim();

						if (buttonType === lastType) {
							currentFormula = currentFormula + count;
						}
					}
				} else {
					skip = true;
				}
			}
			// Handle custom dice.
			else if (buttonFormula === "d") {
				let joiner = last.includes("d") || isNaN(last) ? " + " : "";
				currentFormula = currentFormula + joiner + buttonFormula;
			}
			// Handle numbers appended to custom dice..
			else if ((last === "d" || last.includes("k")
			|| parenthesesFormulas.includes(last)) && !isNaN(buttonFormula)) {
				currentFormula = currentFormula + buttonFormula;
			}
			// All other inputs.
			else {
			// Normally we want to append with either an empty string or a space.
				let joiner = "";
				if (currentFormula.length === 0) {
					joiner = "";
				}
				if (opFormulas.includes(buttonFormula)) {
					joiner = " ";
				}
				// If the last item is a die, append with as addition.
				else if (last.includes("d")) {
					if (standardDice.includes(last) && buttonFormula !== "0") {
						joiner = " + ";
					}
					// If the last item isn't a complete die (such as "3d") and this is
					// a number, append directly.
					else if (!isNaN(last) || !isNaN(parseInt(buttonFormula))) {
						joiner = "";
					} else {
						joiner = " ";
					}
				} else if (isNaN(parseInt(last))) {
					joiner = " ";
				}
				currentFormula = currentFormula + joiner + buttonFormula;
			}

			// If no operations said to skip this entry, update the input.
			if (!skip) {
				$formulaInput.val(currentFormula);
			}
		});
	}
}

/**
 * Javascript imports don't support dashes so the workaround
 * for systems with dashes in their names is to create this map.
 */
const KEYS = {
	"fate-core-official": "fateCoreOfficial"
};

async function preloadTemplates() {
	const templatePaths = [
		"modules/dice-calculator/templates/partials/settings.hbs",
		"modules/dice-calculator/templates/DiceCreator.hbs",
		"modules/dice-calculator/templates/DiceRowSettings.hbs",
		"modules/dice-calculator/templates/GeneralSettings.hbs",
		"modules/dice-calculator/templates/calculator.html",
		"modules/dice-calculator/templates/tray.html",
	];

	return loadTemplates(templatePaths);
}

class DiceCreator extends FormApplication {
	constructor(object, options = {}) {
		super(object, options);
		Hooks.once("closeDiceRowSettings", () => this.close());
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "dice-creator-form",
			title: "DICE_TRAY.SETTINGS.DiceCreator",
			template: "./modules/dice-calculator/templates/DiceCreator.hbs",
			classes: ["sheet", "dice-tray-dice-creator"],
			width: 400,
			closeOnSubmit: true,
		});
	}

	getData(options) {
		const nextRow = this.object.diceRows.findIndex((row) => Object.keys(row).length < 7);
		return {
			dice: this.object.dice,
			diceRows: this.object.diceRows, // this.diceRows,
			nextRow: nextRow < 0 ? this.object.diceRows.length : nextRow,
			maxRows: Math.max(nextRow + 1, this.object.diceRows.length),
		};
	}

	async activateListeners(html) {
		super.activateListeners(html);
		html.find("button[name=cancel]").on("click", async (event) => {
			this.close();
		});
	}

	async _updateObject(event, formData) {
		const { dice, row } = foundry.utils.expandObject(formData);
		if (this.object.dice && dice.row !== row) {
			const key = this.object.dice.originalKey;
			delete this.object.form.diceRows[row][key];
		}
		if (row + 1 > this.object.form.diceRows.length) {
			this.object.form.diceRows.push({});
		}
		const cleanKey = Object.fromEntries(Object.entries(dice).filter(([k, v]) => k !== "key" && v !== ""));
		if (!cleanKey.img && !cleanKey.label) {
			cleanKey.label = dice.key;
		}
		this.object.form.diceRows[row][dice.key] = cleanKey;
		this.object.form.render(true);
	}
}

class DiceRowSettings extends FormApplication {
	constructor(object, options = {}) {
		super(object, options);
		this.diceRows = foundry.utils.deepClone(game.settings.get("dice-calculator", "diceRows"));
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "dice-row-form",
			title: "DICE_TRAY.SETTINGS.DiceRowSettings",
			template: "./modules/dice-calculator/templates/DiceRowSettings.hbs",
			classes: ["sheet", "dice-tray-row-settings"],
			width: 320,
			height: "auto",
			closeOnSubmit: true,
		});
	}

	getData(options) {
		return {
			diceRows: this.diceRows,
		};
	}

	async activateListeners(html) {
		super.activateListeners(html);
		html.find(".dice-tray button").on("click", async (event) => {
			event.preventDefault();
		});
		html.find(".dice-tray__button").on("click", async (event) => {
			event.preventDefault();
			const { formula: key, tooltip } = Object.keys(event.target.parentElement.dataset).length
				? event.target.parentElement.dataset
				: event.target.dataset;
			const row = this.diceRows.findIndex((r) => r[key]);
			const diceData = this.diceRows[row][key];
			const { color, img, label } = diceData;
			new DiceCreator({
				form: this,
				diceRows: this.diceRows,
				dice: {
					key,
					originalKey: key, // In case the key is changed later.
					color,
					img,
					label,
					tooltip: tooltip !== key ? tooltip : "",
					row: row,
				},
			}).render(true);
		});
		html.find(".dice-tray__button").on("contextmenu", async (event) => {
			event.preventDefault();
			const { formula: key } = Object.keys(event.target.parentElement.dataset).length
				? event.target.parentElement.dataset
				: event.target.dataset;
			const row = this.diceRows.findIndex((r) => r[key]);
			delete this.diceRows[row][key];
			if (!Object.keys(this.diceRows[row]).length) {
				this.diceRows.splice(1, row);
			}
			this.render(false);
		});
		html.find("button[name=add]").on("click", async (event) => {
			new DiceCreator({
				form: this,
				diceRows: this.diceRows,
			}).render(true);
		});
		html.find("button[name=cancel]").on("click", async (event) => {
			this.close();
		});
		html.find("button[name=reset]").on("click", async (event) => {
			this.diceRows = game.settings.settings.get("dice-calculator.diceRows").default;
			this.render(false);
		});
	}

	async _updateObject(event, formData) {
		const current = game.settings.get("dice-calculator", "diceRows");
		if (JSON.stringify(this.diceRows) !== JSON.stringify(current)) {
			await game.settings.set("dice-calculator", "diceRows", this.diceRows);
			await SettingsConfig.reloadConfirm({ world: true });
		}
	}
}

class DiceTrayGeneralSettings extends FormApplication {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "dice-tray-form",
			title: "Dice Tray Settings",
			template: "./modules/dice-calculator/templates/GeneralSettings.hbs",
			classes: ["sheet", "dice-calculator-general-settings"],
			tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "general" }],
			width: 600,
			height: "fit-content",
			closeOnSubmit: true,
			resizable: true,
		});
	}

	_prepSetting(key) {
		const settingData = game.settings.settings.get(`dice-calculator.${key}`);

		const { name, hint, type, range, choices, isColor, hasTextarea } = settingData;
		const select = choices !== undefined ? Object.entries(choices).map(([key, value]) => ({ key, value })) : [];

		let settingType = type.name;
		if (range) {
			settingType = "Range";
		} else if (choices) {
			settingType = "Select";
		} else if (isColor) {
			settingType = "Color";
		} else if (hasTextarea) {
			settingType = "Textarea";
		}

		return {
			id: key,
			value: game.settings.get("dice-calculator", key),
			name,
			hint,
			type: settingType,
			range,
			select,
		};
	}

	_prepFlag(key) {
		const { name, hint, default: def, type } = game.settings.settings.get(`dice-calculator.${key}`);
		return {
			id: key,
			name,
			hint,
			value: game.user.flags?.["dice-calculator"]?.[key] ?? def,
			type: type.name,
		};
	}

	async resetToDefault(key) {
		const defaultValue = game.settings.settings.get(`dice-calculator.${key}`).default;
		await game.settings.set("dice-calculator", key, defaultValue);
	}

	getData() {
		const isGM = game.user.isGM;
		let data = {
			tabs: {
				general: {
					icon: "fas fa-cogs",
					name: "DICE_TRAY.SETTINGS.General",
				},
			},
		};
		if (isGM) {
			data.settings = {
				general: {
					enableDiceCalculator: this._prepSetting("enableDiceCalculator"),
					enableDiceTray: this._prepSetting("enableDiceTray"),
				},
			};
		} else {
			data.settings = {
				general: {
					enableDiceCalculator: this._prepFlag("enableDiceCalculator"),
					enableDiceTray: this._prepFlag("enableDiceTray"),
				},
			};
		}

		for (const s in data.settings) {
			// eslint-disable-next-line no-unused-vars
			data.settings[s] = Object.fromEntries(
				Object.entries(data.settings[s]).filter(([key, value]) => value !== undefined)
			);
		}

		data.numOfTabs = Object.keys(data.tabs).length;

		return data;
	}

	async activateListeners(html) {
		super.activateListeners(html);
		html.find("button").on("click", async (event) => {
			if (event.currentTarget?.dataset?.action === "reset") {
				const keys = ["enableDiceCalculator", "enableDiceTray"];
				if (game.user.isGM) {
					await Promise.all(
						keys.map(async (key) => {
							await this.resetToDefault(key);
						})
					);
				} else {
					await Promise.all(
						keys.map(async (key) => {
							await game.user.unsetFlag("dice-calculator", key);
						})
					);
				}
				this.close();
			}
		});
	}

	async _updateObject(event, formData) {
		let requiresClientReload = false;
		let requiresWorldReload = false;
		for (let [k, v] of Object.entries(foundry.utils.flattenObject(formData))) {
			let s = game.settings.settings.get(`dice-calculator.${k}`);
			let current = game.user.isGM
				? game.settings.get(s.namespace, s.key)
				: game.user.getFlag("dice-calculator", k);
			if (v === current) continue;
			requiresClientReload ||= s.scope === "client" && s.requiresReload;
			requiresWorldReload ||= s.scope === "world" && s.requiresReload;
			if (game.user.isGM) {
				await game.settings.set(s.namespace, s.key, v);
			} else {
				await game.user.setFlag("dice-calculator", k, v);
			}
		}
		if (requiresClientReload || requiresWorldReload) {
			SettingsConfig.reloadConfirm({ world: requiresWorldReload });
		}
	}
}

function registerSettings() {
	game.settings.registerMenu("dice-calculator", "GeneralSettings", {
		name: "DICE_TRAY.SETTINGS.GeneralSettings",
		label: "DICE_TRAY.SETTINGS.GeneralSettings",
		icon: "fas fa-cogs",
		type: DiceTrayGeneralSettings,
	});
	game.settings.registerMenu("dice-calculator", "DiceRowSettings", {
		name: "DICE_TRAY.SETTINGS.DiceRowSettings",
		label: "DICE_TRAY.SETTINGS.DiceRowSettings",
		icon: "fas fa-cogs",
		type: DiceRowSettings,
		restricted: true,
	});

	game.settings.register("dice-calculator", "enableDiceCalculator", {
		name: game.i18n.localize("DICE_TRAY.SETTINGS.enableDiceCalculator.name"),
		hint: game.i18n.localize("DICE_TRAY.SETTINGS.enableDiceCalculator.hint"),
		scope: "world",
		config: false,
		default: true,
		type: Boolean,
		requiresReload: true
	});

	game.settings.register("dice-calculator", "enableDiceTray", {
		name: game.i18n.localize("DICE_TRAY.SETTINGS.enableDiceTray.name"),
		hint: game.i18n.localize("DICE_TRAY.SETTINGS.enableDiceTray.hint"),
		scope: "world",
		config: false,
		default: true,
		type: Boolean,
		requiresReload: true
	});

	game.settings.register("dice-calculator", "hideAdv", {
		name: game.i18n.localize("DICE_TRAY.SETTINGS.hideAdv.name"),
		hint: game.i18n.localize("DICE_TRAY.SETTINGS.hideAdv.hint"),
		scope: "world",
		config: CONFIG.DICETRAY.constructor.name === "TemplateDiceMap",
		default: false,
		type: Boolean,
		requiresReload: true
	});

	// Menu Settings

	game.settings.register("dice-calculator", "diceRows", {
		scope: "world",
		config: false,
		default: CONFIG.DICETRAY.dice,
		type: Array,
	});

	game.settings.register("dice-calculator", "rolls", {
		scope: "world",
		config: false,
		default: [],
		type: Array,
	});
}

// Initialize module
Hooks.once("init", () => {
	preloadTemplates();
});

Hooks.once("i18nInit", () => {
	const newMaps = foundry.utils.deepClone(keymaps);
	const newCalculators = foundry.utils.deepClone(diceCalculators);

	Hooks.callAll("dice-calculator.keymaps", newMaps, newMaps.Template);
	const supportedSystemMaps = Object.keys(newMaps).join("|");
	const systemMapsRegex = new RegExp(`^(${supportedSystemMaps})$`);
	const providerStringMaps = getProviderString(systemMapsRegex) || "Template";
	CONFIG.DICETRAY = new newMaps[providerStringMaps]();

	Hooks.callAll("dice-calculator.calculator", newCalculators, newCalculators.Template);
	const supportedSystemCalculators = Object.keys(newCalculators).join("|");
	const systemCalculatorsRegex = new RegExp(`^(${supportedSystemCalculators})$`);
	const providerStringCalculators = getProviderString(systemCalculatorsRegex);

	if (providerStringCalculators) {
		CONFIG.DICETRAY.calculator = new newCalculators[providerStringCalculators]();
	}

	registerSettings();
});

function getProviderString(regex) {
	const id = game.system.id;
	if (id in KEYS) {
		return KEYS[id];
	} else if (regex.test(id)) {
		return id;
	}
	return "";
}

Hooks.on("renderSidebarTab", async (app, html, data) => {
	// Exit early if necessary;
	if (app.tabName !== "chat") return;
	const enableTray = game.user.getFlag("dice-calculator", "enableDiceTray") ?? game.settings.get("dice-calculator", "enableDiceTray");
	if (enableTray) {
		// Prepare the dice tray for rendering.
		let $chat_form = html.find("#chat-form");
		const options = {
			dicerows: game.settings.get("dice-calculator", "diceRows")
		};

		const content = await renderTemplate("modules/dice-calculator/templates/tray.html", options);

		if (content.length > 0) {
			let $content = $(content);
			$chat_form.after($content);
			$content.find(".dice-tray__button").on("click", (event) => {
				event.preventDefault();
				let dataset = event.currentTarget.dataset;

				CONFIG.DICETRAY.updateChatDice(dataset, "add", html);
			});
			$content.find(".dice-tray__button").on("contextmenu", (event) => {
				event.preventDefault();
				let dataset = event.currentTarget.dataset;

				CONFIG.DICETRAY.updateChatDice(dataset, "sub", html);
			});
			// Handle drag events.
			$content.find(".dice-tray__button").attr("draggable", true);
			$content.on("dragstart", ".dice-tray__button, .dice-tray__ad", (event) => {
				const dataset = event.currentTarget.dataset;
				const dragData = JSON.parse(JSON.stringify(dataset));
				if (dragData?.formula) {
					// Grab the modifier, if any.
					const $parent = $(event.currentTarget).parents(".dice-tray");
					const $modInput = $parent.find(".dice-tray__input");
					const mod = $modInput.val();

					// Handle advantage/disadvantage.
					if (dragData.formula === "kh") {
						dragData.formula = "2d20kh";
					} else if (dragData.formula === "kl") {
						dragData.formula = "2d20kl";
					}

					// Grab the count, if any.
					const qty = $(event.currentTarget).find(".dice-tray__flag").text();
					if (qty.length > 0 && !dragData.formula.includes("k")) {
						dragData.formula = `${qty}${dataset.formula}`;
					}

					// Apply the modifier.
					if (mod && mod !== "0") {
						dragData.formula += ` + ${mod}`;
					}
					dragData.origin = "dice-calculator";
					event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify(dragData));
				}
			});

			// Handle drop for dice.
			$("html").on("drop", (event) => {
				// This try-catch is needed because it conflicts with other modules
				try {
					const data = JSON.parse(event.originalEvent.dataTransfer.getData("text/plain"));
					// If there's a formula, trigger the roll.
					if (data?.origin === "dice-calculator" && data?.formula) {
						new Roll(data.formula).toMessage();
						event.stopImmediatePropagation();
					}
				} catch(err) {
					// Unable to Parse Data, Return Event
					return event;
				}
			});

			// Handle correcting the modifier math if it's null.
			$content.find(".dice-tray__input").on("input", (event) => {
				// event.preventDefault();
				let $self = $(event.currentTarget);
				let mod_val = $self.val();

				mod_val = Number(mod_val);
				mod_val = Number.isNaN(mod_val) ? 0 : mod_val;

				$self.val(mod_val);
				CONFIG.DICETRAY.applyModifier(html);
			})
				// Handle changing the modifier with the scroll well.
				.on("wheel", (event) => {
					let $self = $(event.currentTarget);
					let diff = event.originalEvent.deltaY < 0 ? 1 : -1;
					let mod_val = $self.val();
					mod_val = Number.isNaN(mod_val) ? 0 : Number(mod_val);
					$self.val(mod_val + diff);
					CONFIG.DICETRAY.applyModifier(html);
				});
			// Handle +/- buttons near the modifier input.
			$content.find("button.dice-tray__math").on("click", (event) => {
				event.preventDefault();
				let dataset = event.currentTarget.dataset;
				let mod_val = $('input[name="dice.tray.modifier"]').val();

				mod_val = Number(mod_val);
				mod_val = Number.isNaN(mod_val) ? 0 : mod_val;

				switch (dataset.formula) {
					case "+1":
						mod_val = mod_val + 1;
						break;
					case "-1":
						mod_val = mod_val - 1;
						break;
				}
				$('input[name="dice.tray.modifier"]').val(mod_val);
				CONFIG.DICETRAY.applyModifier(html);
			});
			CONFIG.DICETRAY.applyLayout(html);
		}
	}
	const enableCalculator = game.user.getFlag("dice-calculator", "enableDiceCalculator") ?? game.settings.get("dice-calculator", "enableDiceCalculator");
	if (enableCalculator) {
		// Render a modal on click.
		const diceIconSelector = html.find("#chat-controls .chat-control-icon i");
		diceIconSelector.addClass("dice-calculator-toggle");
		diceIconSelector.on("click", async (event) => {
			event.preventDefault();

			const $dialog = $(".dialog--dice-calculator");

			if ($dialog.length < 1) {
				const controlledTokens = canvas?.tokens?.controlled ?? [];
				const actor = controlledTokens.length > 0 ? controlledTokens[0].actor : null;

				const calculatorConfig = CONFIG.DICETRAY?.calculator?.getData(actor);
				const { abilities, attributes, customButtons } = calculatorConfig ?? {
					abilities: [],
					attributes: [],
					customButtons: []
				};

				// Build the template.
				const rolls = game.settings.get("dice-calculator", "rolls");
				const templateData = {
					rolls,
					abilities,
					attributes,
					customButtons,
					adv: CONFIG.DICETRAY?.calculator?.adv || false
				};

				// Render the modal.
				const content = await renderTemplate("modules/dice-calculator/templates/calculator.html", templateData);
				new DiceCalculatorDialog({
					title: `Dice Tray: ${game.i18n.localize("DICE_TRAY.Calculator")}`,
					content,
					buttons: {
						roll: {
							label: game.i18n.localize("TABLE.Roll"),
							callback: () => dcRollDice(actor)
						}
					}
				}, { top: event.clientY - 80 }).render(true);
			} else {
				$dialog.remove();
			}
		});
	}
});

/**
 * Helper function to roll dice formula and output to chat.
 * @param {object} actor The actor to use for rolls, if any.
 */
function dcRollDice(actor = null) {
	// Retrieve the formula.
	let formula = $(".dice-calculator textarea").val();
	// Replace shorthand.
	formula = formula.replace(/@abil\./g, "@abilities.").replace(/@attr\./g, "@attributes.");
	if (!formula) return;

	// Roll the dice!
	let data = actor ? actor.getRollData() : {};
	let roll = new Roll(formula, data);
	roll.toMessage();

	// Throw a warning to the user if they tried to use a stat without a token.
	// If there's no actor and the user tried to use a stat, warn them.
	if (!actor && formula.includes("@")) {
		ui.notifications.warn("A token attribute was specified in your roll, but no token was selected.");
	}

	// Store it for later.
	let formulaArray = game.settings.get("dice-calculator", "rolls");
	// Only update if this is a new formula.
	if ($.inArray(formula, formulaArray) === -1) {
		formulaArray.unshift(formula);
		formulaArray = formulaArray.slice(0, 10);
		game.settings.set("dice-calculator", "rolls", formulaArray);
	}
}
//# sourceMappingURL=dice-calculator.js.map
