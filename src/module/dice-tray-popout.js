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

	async _onFirstRender(context, options) {
		await super._onFirstRender(context, options);
		const position = game.settings.get("dice-calculator", "popoutPosition");
		const left = position.left ?? ui.nav?.element.getBoundingClientRect().left;
		const top = position.top ?? ui.controls?.element.getBoundingClientRect().top;
		options.position = {...options.position, left, top};
	}

	_onRender(context, options) {
		super._onRender(context, options);
		CONFIG.DICETRAY.applyListeners(this.element);
		CONFIG.DICETRAY.applyLayout(this.element);
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
