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

	get textarea() {
		const chatElement = ui.sidebar.popouts.chat?.element || ui.chat.element;
		return chatElement.querySelector(".chat-form textarea");
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
		html.querySelector(".dice-tray__roll")?.addEventListener("click", async (event) => {
			event.preventDefault();
			// Taken from FoundryVTT V13's keyEvent function
			const newEvent = document.createEvent("Event");
			newEvent.initEvent("keydown", true, true);
			newEvent.keyCode = 13;
			newEvent.key = event.code = "Enter";
			this.textarea.dispatchEvent(newEvent);
		});
	}

	applyListeners(html) {
		const diceButtons = html.querySelectorAll(".dice-tray__button");
		diceButtons.forEach((button) => {
			// Avoids moving focus to the button
			button.addEventListener("pointerdown", (event) => {
				event.preventDefault();
			});
			button.addEventListener("click", (event) => {
				event.preventDefault();
				const dataset = event.currentTarget.dataset;
				CONFIG.DICETRAY.updateChatDice(dataset, "add", html);
			});

			button.addEventListener("contextmenu", (event) => {
				event.preventDefault();
				const dataset = event.currentTarget.dataset;
				CONFIG.DICETRAY.updateChatDice(dataset, "sub", html);
			});
		});

		// Handle correcting the modifier math if it's null.
		const diceTrayInput = html.querySelector(".dice-tray__input");
		diceTrayInput?.addEventListener("input", (event) => {
			let modVal = Number(event.target.value);
			modVal = Number.isNaN(modVal) ? 0 : modVal;
			event.target.value = modVal;
			CONFIG.DICETRAY.applyModifier(html);
		});
		diceTrayInput?.addEventListener("wheel", (event) => {
			const diff = event.deltaY < 0 ? 1 : -1;
			let modVal = event.currentTarget.value;
			modVal = Number.isNaN(modVal) ? 0 : Number(modVal);
			event.currentTarget.value = modVal + diff;
			CONFIG.DICETRAY.applyModifier(html);
		});

		// Handle +/- buttons near the modifier input.
		const mathButtons = html.querySelectorAll("button.dice-tray__math");
		mathButtons?.forEach((button) => {
			button.addEventListener("click", (event) => {
				event.preventDefault();
				let modVal = Number(html.querySelector('input[name="dice.tray.modifier"]').value);
				modVal = Number.isNaN(modVal) ? 0 : modVal;

				switch (event.currentTarget.dataset.formula) {
					case "+1":
						modVal += 1;
						break;
					case "-1":
						modVal -= 1;
						break;
					default:
						break;
				}

				html.querySelector('input[name="dice.tray.modifier"]').value = modVal;
				CONFIG.DICETRAY.applyModifier(html);
			});
		});
	}

	reset() {
		CONFIG.DICETRAY._resetTray(ui.chat.element);
		CONFIG.DICETRAY._resetTray(ui.sidebar.popouts.chat?.element);
		CONFIG.DICETRAY._resetTray(CONFIG.DICETRAY.popout?.element);
	}

	/**
	 * Creates the KH/KL buttons
	 * @param {HTMLElement} html
	 */
	_createExtraButtons(html) {
		const { kh, kl } = this.buttonFormulas;
		const math = html.querySelector("#dice-tray-math");
		math.removeAttribute("hidden");
		const div = document.createElement("div");
		div.classList.add("dice-tray__stacked", "flexcol");

		const buttonAdv = document.createElement("button");
		buttonAdv.classList.add("dice-tray__ad", "dice-tray__advantage");
		buttonAdv.setAttribute("data-formula", kh);
		buttonAdv.setAttribute("data-tooltip", game.i18n.localize(this.labels.advantage));
		buttonAdv.setAttribute("data-tooltip-direction", "UP");
		buttonAdv.textContent = game.i18n.localize(this.labels.adv);

		const buttonDis = document.createElement("button");
		buttonDis.classList.add("dice-tray__ad", "dice-tray__disadvantage");
		buttonDis.setAttribute("data-formula", kl);
		buttonDis.setAttribute("data-tooltip", game.i18n.localize(this.labels.disadvantage));
		buttonDis.setAttribute("data-tooltip-direction", "UP");
		buttonDis.textContent = game.i18n.localize(this.labels.dis);

		div.appendChild(buttonAdv);
		div.appendChild(buttonDis);

		math.append(div);
	}

	/**
	 * Sets the logic for using the KH/KL buttons.
	 * This version appends KH/KL to rolls. Check DCC or SWADE for other uses.
	 * @param {HTMLElement} html
	 */
	_extraButtonsLogic(html) {
		const buttons = html.querySelectorAll(".dice-tray__ad");
		for (const button of buttons) {
			button.addEventListener("click", (event) => {
				event.preventDefault();
				const dataset = event.currentTarget.dataset;
				const chat = this.textarea;
				let chatVal = String(chat.value);
				const matchString = /\d*d\d+[khl]*/;

				// If there's a d20, toggle the current if needed.
				if (matchString.test(chatVal)) {
					// If there was previously a kh or kl, update it.
					if (/d\d+k[hl]/g.test(chatVal)) {
						chatVal = chatVal.replace(/(\d*)(d\d+)(k[hl]\d*)/g, (match, p1, p2, p3, offset, string) => {
							let diceKeep = this.updateDiceKeep(p1, p2, p3, -1, dataset.formula);
							html.querySelector(`.dice-tray__flag--${p2}`).textContent = diceKeep.count;
							return diceKeep.content;
						});
					}
					// Otherwise, add it.
					else {
						chatVal = chatVal.replace(/(\d*)(d\d+)/g, (match, p1, p2, offset, string) => {
							let diceKeep = this.updateDiceKeep(p1, p2, "", 1, dataset.formula);
							html.querySelector(`.dice-tray__flag--${p2}`).textContent = diceKeep.count;
							return diceKeep.content;
						});
					}
				}
				// else {
				// 	let diceKeep = this.updateDiceKeep("1", "d20", "", 1, dataset.formula);
				// 	html.find(".dice-tray__flag--d20").text(diceKeep.count);
				// 	chatVal += diceKeep.content;
				// }

				// Handle toggle classes.
				const toggleClass = (selector, condition) => {
					html.querySelector(selector)?.classList.toggle("active", condition);
				};
				toggleClass(".dice-tray__advantage", chatVal.includes("kh"));
				toggleClass(".dice-tray__disadvantage", chatVal.includes("kl"));
				// Update the value.
				chat.value = chatVal;
			});
		}
	}

	_resetTray(html) {
		if (!html) return;
		html.querySelector(".dice-tray__input").value = 0;
		for (const flag of html.querySelectorAll(".dice-tray__flag")) {
			flag.textContent = "";
			flag.classList.add("hide");
		}
		if (this.removeAdvOnRoll) {
			html.querySelector(".dice-tray__ad").classList.remove("active");
		}
	}

	/**
	 * Logic to apply the number on the -/+ selector.
	 * @param {HTMLElement} html
	 */
	applyModifier(html) {
		const modInput = html.querySelector(".dice-tray__input");
		if (!modInput) return;
		const modVal = Number(modInput.value);

		if (modInput.length === 0 || isNaN(modVal)) return;

		let modString = "";
		if (modVal > 0) {
			modString = `+${modVal}`;
		} else if (modVal < 0) {
			modString = `${modVal}`;
		}

		const chat = this.textarea;
		const chatVal = String(chat.value);

		const matchString = /(\+|-)(\d+)$/;
		if (matchString.test(chatVal)) {
			chat.value = chatVal.replace(matchString, modString);
		} else if (chatVal !== "") {
			chat.value = chatVal + modString;
		} else {
			const rollPrefix = this._getRollMode(html);
			chat.value = `${rollPrefix} ${modString}`;
		}
		if (/(\/r|\/gmr|\/br|\/sr) $/g.test(chat.value)) {
			chat.value = "";
		}
		this.textarea.focus();
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
	 * Handles clicks on the dice buttons.
	 * @param {Object} dataset
	 * @param {String} direction
	 * @param {HTMLElement} html
	 * @returns
	 */
	updateChatDice(dataset, direction, html) {
		const chat = this.textarea;
		let currFormula = String(chat.value);
		if (direction === "sub" && currFormula === "") return;
		let rollPrefix = this._getRollMode(html);
		let qty = 0;
		let dice = "";

		let matchDice = dataset.formula;
		if (dataset.formula === "d10") {
			// Filter out d100s
			matchDice = "d10(?!0)";
		} else if (/^(\d+)(d.+)/.test(dataset.formula)) {
			const match = dataset.formula.match(/^(\d+)(d.+)/);
			qty = Number(match[1]);
			matchDice = match[2];
			dice = match[2];
		}
		// Catch KH/KL
		matchDice = `${matchDice}[khl]*`;

		const matchString = new RegExp(`${this.rawFormula("(\\d*)", `(${matchDice})`, html)}(?=\\+|\\-|$)`);
		if (matchString.test(currFormula)) {
			const match = currFormula.match(matchString);
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
				const newMatchString = new RegExp(`${this.rawFormula("(\\d*)", `(${matchDice})`, html)}(?=\\+|\\-|$)`);
				currFormula = currFormula.replace(newMatchString, "");
				if (new RegExp(`${rollPrefix}\\s+(?!.*d\\d+.*)`).test(currFormula)) {
					currFormula = "";
				}
			} else {
				const newFormula = this.rawFormula(qty, parts.die, html);
				currFormula = currFormula.replace(matchString, newFormula);
			}
			chat.value = currFormula;
		} else {
			if (!qty) {
				qty = 1;
			}
			if (currFormula === "") {
				chat.value = `${rollPrefix} ${this.rawFormula(qty, dice || dataset.formula, html)}`;
			} else {
				const signal = (/(\/r|\/gmr|\/br|\/sr) (?!-)/g.test(currFormula)) ? "+" : "";
				currFormula = currFormula.replace(/(\/r|\/gmr|\/br|\/sr) /g, `${rollPrefix} ${this.rawFormula(qty, dice || dataset.formula, html)}${signal}`);
				chat.value = currFormula;
			}
		}

		// TODO consider separate this into another method to make overriding simpler
		// TODO e.g. cases where a button adds 2+ dice

		// Add a flag indicator on the dice.
		qty = Number(qty);
		let flagButton = [html.querySelector(`.dice-tray__flag--${dataset.formula}`)];
		if (this.popout?.rendered) {
			flagButton.push(this.popout.element.querySelector(`.dice-tray__flag--${dataset.formula}`));
		}
		if (!qty) {
			qty = direction === "add" ? 1 : 0;
		}

		for (const button of flagButton) {
			if (qty > 0) {
				button.textContent = qty;
				button.classList.remove("hide");
			} else if (qty < 0) {
				button.textContent = qty;
			} else {
				button.textContent = "";
				button.classList.add("hide");
			}
		}

		currFormula = chat.value;
		currFormula = currFormula.replace(/(\/r|\/gmr|\/br|\/sr)(( \+)| )/g, `${rollPrefix} `).replace(/\+{2}/g, "+").replace(/-{2}/g, "-").replace(/\+$/g, "");
		chat.value = currFormula;
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
