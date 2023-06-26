import { createContext } from "react";


export type SettingsSchema = {
	counter: number;
	editor: {
		colorTheme?: string,
		fontFamily?: string,
		fontSize?: Number,
		enableCodeLens?: boolean,
		enableLineNumbers?: boolean,
		enableCodeCompletion?: boolean
	},
	debugging: {
		mainBinary?: string,
		binaryOptions?: []
	},
	recentProjects: []
}


export const SettingsContext : React.Context<any> = createContext({
	counter: 0,
	editor: {
		enableCodeLens: false
	},
	debugging: {
		mainBinary: ""
	},
	recentProjects: []
});