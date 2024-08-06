export async function preloadTemplates() {
	const templatePaths = [
		"modules/dice-calculator/templates/partials/settings.hbs",
		"modules/dice-calculator/templates/DiceCreator.hbs",
		"modules/dice-calculator/templates/DiceRowSettings.hbs",
		"modules/dice-calculator/templates/GeneralSettings.hbs",
		"modules/dice-calculator/templates/calculator.html",
		"modules/dice-calculator/templates/tray.html",
		"modules/dice-calculator/templates/OperationRow.hbs"
	];

	return loadTemplates(templatePaths);
}
