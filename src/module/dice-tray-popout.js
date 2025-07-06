import { DiceRowSettings } from "./forms/DiceRowSettings.js";
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

	_configureRenderOptions(options) {
		super._configureRenderOptions(options);
		if ( options.isFirstRender && ui.nav ) {
			const position = game.settings.get("dice-calculator", "popoutPosition");
			const {right, top} = ui.nav.element.getBoundingClientRect();
			const uiScale = game.settings.get("core", "uiConfig").uiScale;
			options.position.left ??= position.left ?? right + (16 * uiScale);
			options.position.top ??= position.top ?? top;
		}
	}

	_onRender(context, options) {
		super._onRender(context, options);
		CONFIG.DICETRAY.applyLayout(this.element);
		CONFIG.DICETRAY.applyListeners(this.element);
	}

	async _prepareContext(_options) {
		return {
			dicerows: game.settings.get("dice-calculator", "diceRows"),
			settings: DiceRowSettings.settingsKeys.reduce((obj, key) => {
				obj[key] = game.settings.get("dice-calculator", key);
				return obj;
			}, {})
		};
	}

	setPosition(position) {
		const superPosition = super.setPosition(position);
		const { left, top } = superPosition;
		game.settings.set("dice-calculator", "popoutPosition", { left, top });
		return superPosition;
	}
}
