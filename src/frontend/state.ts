function _handleStateReducerField(clone:any, action:any) {
	switch (action.type) {
		case 'toggle-console': clone.showConsole = !clone.showConsole;	return true;
		case 'toggle-sidebar': clone.showSidebar = !clone.showSidebar; return true;
		case 'toggle-statusbar': clone.showStatusBar = !clone.showStatusBar;	return true;
		case 'toggle-theme-editor': clone.showThemeEditor = !clone.showThemeEditor; return true;
		case 'is-tracking-mouse': clone.isTrackingMouse = action.value; return true;
		case 'is-welcome-visible': clone.isWelcomeVisible = action.value; return true;
		case 'is-debugging': clone.isDebugging = action.value; return true;
		case 'can-save': clone.canSave = action.value; return true;

		case 'console-height': clone.consoleHeight = action.value; return true;
		case 'sidebar-width': clone.sidebarWidth = action.value; return true;
		case 'dialog': clone.dialog = action.value; return true;
		case 'focus-path': clone.focusPath = action.value; return true;
		case 'project-path': clone.projectPath = action.value; return true;
	}
	return false;
}


export function appStateReducer(state:any, action:any) {
	const clone = JSON.parse(JSON.stringify(state));
	let changed = false;

	if (Array.isArray(action)) {
		for (var i=0; i<action.length; i++) {
			const r = _handleStateReducerField(clone, action[i]);
			if (r == true) changed = true;
		}
	}
	else {
		changed = _handleStateReducerField(clone, action);
	}
	return changed ? clone : state;
}


export const appStateDefault = {
	showConsole: true,
	showSidebar: true,
	showStatusBar: true,
	showThemeEditor: false,
	isTrackingMouse: '',
	isWelcomeVisible: true,
	isDebugging: false,
	canSave: false,
	consoleHeight: 150,
	sidebarWidth: 240,
	dialog: '',
	focusPath: '',
	projectPath: ''
};