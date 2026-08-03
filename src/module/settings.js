import { DiceRowSettings } from "./forms/DiceRowSettings";

const {
	ArrayField, BooleanField, ColorField, FilePathField, SchemaField, StringField, TypedObjectField
} = foundry.data.fields;
export function registerSettings() {
	game.settings.registerMenu("dice-calculator", "DiceRowSettings", {
		name: "DICE_TRAY.SETTINGS.DiceRowSettings",
		label: "DICE_TRAY.SETTINGS.DiceRowSettings",
		icon: "fas fa-cogs",
		type: DiceRowSettings,
		restricted: true,
	});

	game.settings.register("dice-calculator", "enableDiceTray", {
		name: game.i18n.localize("DICE_TRAY.SETTINGS.enableDiceTray.name"),
		hint: game.i18n.localize("DICE_TRAY.SETTINGS.enableDiceTray.hint"),
		scope: "user",
		config: true,
		default: true,
		type: Boolean,
		requiresReload: true
	});

	game.settings.register("dice-calculator", "hideAdv", {
		name: game.i18n.localize("DICE_TRAY.SETTINGS.hideAdv.name"),
		hint: game.i18n.localize("DICE_TRAY.SETTINGS.hideAdv.hint"),
		scope: "world",
		config: false,
		default: false,
		type: Boolean
	});

	// Menu Settings
	const diceRows = CONFIG.DICETRAY.rows;
	game.settings.register("dice-calculator", "dice", {
		scope: "world",
		config: false,
		default: !diceRows.length ? CONFIG.DICETRAY.dice : Object.fromEntries(
			Object.entries(CONFIG.DICETRAY.dice)
				.filter(([key]) =>
					!diceRows.some((r) => r[key] && Object.values(r).some((d) => d.drawer?.[key]))
				)
		),
		type: new TypedObjectField(new BaseDiceField()),
	});
	game.settings.register("dice-calculator", "diceRows", {
		scope: "world",
		config: false,
		default: CONFIG.DICETRAY.rows,
		type: new ArrayField(
			new TypedObjectField(new DiceField())),
	});

	const { compactMode, hideNumberInput, hideNumberButtons, hideRollButton } = CONFIG.DICETRAY;
	game.settings.register("dice-calculator", "compactMode", {
		scope: "world",
		config: false,
		default: compactMode,
		type: Boolean,
	});
	game.settings.register("dice-calculator", "hideNumberInput", {
		scope: "world",
		config: false,
		default: hideNumberInput,
		type: Boolean,
	});
	game.settings.register("dice-calculator", "hideNumberButtons", {
		scope: "world",
		config: false,
		default: hideNumberButtons,
		type: Boolean
	});
	game.settings.register("dice-calculator", "hideRollButton", {
		scope: "world",
		config: false,
		default: hideRollButton,
		type: Boolean,
	});

	game.settings.register("dice-calculator", "popout", {
		name: "DICE_TRAY.SETTINGS.popout.name",
		hint: "DICE_TRAY.SETTINGS.popout.hint",
		scope: "user",
		config: true,
		default: "none",
		choices: {
			none: "",
			tokens: game.i18n.localize("CONTROLS.GroupToken"),
			all: game.i18n.localize("DICE_TRAY.SETTINGS.popout.options.all"),
		},
		type: String,
		onChange: async () => await ui.controls.render({ reset: true })
	});

	game.settings.register("dice-calculator", "autoOpenPopout", {
		name: "DICE_TRAY.SETTINGS.autoOpenPopout.name",
		hint: "DICE_TRAY.SETTINGS.autoOpenPopout.hint",
		scope: "user",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register("dice-calculator", "popoutPosition", {
		scope: "user",
		config: false,
		default: {},
		type: Object
	});

	game.settings.register("dice-calculator", "rightClickCommand", {
		name: "DICE_TRAY.SETTINGS.rightClickCommand.name",
		hint: "DICE_TRAY.SETTINGS.rightClickCommand.hint",
		scope: "world",
		config: true,
		type: new foundry.data.fields.StringField({
			required: true,
			blank: false,
			choices: {
				decrease: "DICE_TRAY.SETTINGS.rightClickCommand.options.decrease",
				roll: "DICE_TRAY.SETTINGS.rightClickCommand.options.roll"
			},
			initial: "decrease"
		}),
		onChange: (v) => { CONFIG.DICETRAY._rightClickCommand = v; }
	});

	for (const [key, data] of Object.entries(CONFIG.DICETRAY.settings)) {
		game.settings.register("dice-calculator", key, foundry.utils.mergeObject(
			{
				scope: "world",
				config: true
			},
			data
		));
	}
}

class BaseDiceField extends SchemaField {
	constructor(options={}, context={}) {
		super({
			key: new StringField(),
			img: new FilePathField({categories: ["IMAGE"]}),
			alternative: new BooleanField(),
			label: new StringField(),
			tooltip: new StringField(),
			color: new ColorField(),
		}, options, context);
	}
}

class DiceField extends BaseDiceField {
	constructor(options={}, context={}) {
		super(options, context);
		this.fields.drawer = new TypedObjectField(new BaseDiceField(), { nullable: true });
	}
}
