export default class TemplateDiceMap {
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
	 * List of additional settings to be registered during the i18nInit hook.
	 */
	get settings() {
		return {};
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

		if (html.is("aside")) return;
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
			if (html.is("aside")) $chat = this.popout.chatElement.find("#chat-form textarea");
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
		let $mod_input = html.find(".dice-tray__input");
		if (!$mod_input.length && this.popout?.rendered) {
			$mod_input = $(this.popout.element).find(".dice-tray__input");
		}
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
				qty: match.groups?.qty ?? (match[1] || "1"),
				die: match.groups?.dice ?? (match[2] || ""),
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
		let $flag_button = [html.find(`.dice-tray__flag--${dataset.formula}`)];
		if (this.popout?.rendered) {
			$flag_button.push($(this.popout.element).find(`.dice-tray__flag--${dataset.formula}`));
		}
		if (!qty) {
			qty = direction === "add" ? 1 : 0;
		}

		for (const button of $flag_button) {
			if (qty > 0) {
				button.text(qty);
				button.removeClass("hide");
			} else if (qty < 0) {
				button.text(qty);
			} else {
				button.text("");
				button.addClass("hide");
			}
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
