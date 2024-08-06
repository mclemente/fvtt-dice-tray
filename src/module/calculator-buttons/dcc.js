import DiceCalculator from "./templates/calculator";

export default class dccDiceCalculator extends DiceCalculator {
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
}
