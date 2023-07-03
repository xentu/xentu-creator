export default class XentuDefaults {

	static DarkThemeJson = () => JSON.stringify(XentuDefaults.DarkTheme());
	static LightThemeJson = () => JSON.stringify(XentuDefaults.LightTheme());

	/**
	 * Get a copy of the default dark theme for the app.
	 * @returns 
	 */
	static DarkTheme() {
		return {
			mainBackground: "#3d3d3d",
			mainText: "#ffffff",
			sidebarBackground: "#2b2b2b",
			sidebarText: "#ffffff",
			sidebarItemBackground: "#000000",
			sidebarItemText: "#ffffff",
			editorBackground: "#212121",
			editorText: "#ffffff",
			footerBackground: "#171717",
			footerText: "#ffffff",
			hoverBackground: "#1672D4",
			hoverText: "#ffffff",
			activeBackground: "#7a3a98",
			terminalBackground: "#000000",
			terminalText: "#ffffff"
		};
	}


	/**
	 * Get a copy of the default light theme for the app.
	 * @returns 
	 */
	static LightTheme() {
		return {
			mainBackground: "#4d88fe",
			mainText: "#ffffff",
			sidebarBackground: "#d2e1fe",
			sidebarText: "#000000",
			sidebarItemBackground: "#8297bf",
			sidebarItemText: "#ffffff",
			editorBackground: "#ffffff",
			editorText: "#000000",
			footerBackground: "#d2e1fe",
			footerText: "#000000",
			hoverBackground: "#9ebeff",
			hoverText: "#3744a9",
			activeBackground: "#246dff",
			activeText: "#ffffff",
			terminalBackground: "#ffffff",
			terminalText: "#000000"
		};
	}

}