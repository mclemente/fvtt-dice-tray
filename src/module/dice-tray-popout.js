const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class DiceTrayPopOut extends HandlebarsApplicationMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		id: "dice-tray-popout",
		tag: "aside",
		position: {
			width: ui?.sidebar?.options.width ?? 300
		},
		window: {
			title: "DICE_TRAY.DiceTray",
			icon: "fas fa-dice-d20",
			minimizable: true
		}
	};

	static PARTS = {
		list: {
			id: "list",
			template: "modules/dice-calculator/templates/tray.html",
		}
	};

	async _renderFrame(options) {
		const frame = await super._renderFrame(options);
		this.window.close.remove(); // Prevent closing
		return frame;
	}

	async close(options={}) {
		if ( !options.closeKey ) return super.close(options);
		return this;
	}

	get chatElement() {
		return ui.sidebar.popouts.chat?.element || ui.chat.element;
	}

	_onFirstRender(context, options) {
		super._onFirstRender(context, options);
		const position = game.settings.get("dice-calculator", "popoutPosition");
		const left = position.left ?? ui.nav?.element[0].getBoundingClientRect().left;
		const top = position.top ?? ui.controls?.element[0].getBoundingClientRect().top;
		options.position = {...options.position, left, top};
	}

	_onRender(context, options) {
		super._onRender(context, options);
		for (const section of this.element.querySelectorAll(".dice-tray__button")) {
			section.addEventListener("click", (event) => {
				event.preventDefault();
				let dataset = event.currentTarget.dataset;

				CONFIG.DICETRAY.updateChatDice(dataset, "add", this.chatElement);
			});
			section.addEventListener("contextmenu", (event) => {
				event.preventDefault();
				let dataset = event.currentTarget.dataset;

				CONFIG.DICETRAY.updateChatDice(dataset, "sub", this.chatElement);
			});
		}
		for (const section of this.element.querySelectorAll(".dice-tray__button, .dice-tray__ad")) {
			section.addEventListener("dragstart", (event) => {
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
		}
		for (const section of this.element.querySelectorAll(".dice-tray__input")) {
			section.addEventListener("input", (event) => {
				// event.preventDefault();
				let $self = $(event.currentTarget);
				let mod_val = $self.val();

				mod_val = Number(mod_val);
				mod_val = Number.isNaN(mod_val) ? 0 : mod_val;

				$self.val(mod_val);
				CONFIG.DICETRAY.applyModifier(this.chatElement);
			});
			section.addEventListener("wheel", (event) => {
				let $self = $(event.currentTarget);
				let diff = event.originalEvent.deltaY < 0 ? 1 : -1;
				let mod_val = $self.val();
				mod_val = Number.isNaN(mod_val) ? 0 : Number(mod_val);
				$self.val(mod_val + diff);
				CONFIG.DICETRAY.applyModifier(this.chatElement);
			});
		}
		for (const section of this.element.querySelectorAll("button.dice-tray__math")) {
			section.addEventListener("click", (event) => {
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
					default:
						break;
				}
				$('input[name="dice.tray.modifier"]').val(mod_val);
				CONFIG.DICETRAY.applyModifier(this.chatElement);
			});
		}
		CONFIG.DICETRAY.applyLayout($(this.element));
		this.element.querySelector(".dice-tray__roll").addEventListener("click", (event) => {
			event.preventDefault();
			let spoofed = CONFIG.DICETRAY.triggerRollClick();
			this.chatElement.find("#chat-message").trigger(spoofed);
			CONFIG.DICETRAY._resetTray($(this.element));
		});
		this.chatElement.find("#chat-message").keydown((e) => {
			if (e.code === "Enter" || e.key === "Enter" || e.keycode === "13") {
				CONFIG.DICETRAY._resetTray($(this.element));
			}
		});
	}

	async _prepareContext(_options) {
		return {
			dicerows: game.settings.get("dice-calculator", "diceRows"),
		};
	}

	setPosition(position) {
		const superPosition = super.setPosition(position);
		const { left, top } = superPosition;
		game.settings.set("dice-calculator", "popoutPosition", { left, top });
		return superPosition;
	}
}
