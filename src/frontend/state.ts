import { getFileNameInfo } from './helpers';

type DialogContextType = {
	callback?: Function
};


function _handleStateReducerField(clone:any, action:any) {
	switch (action.type) {
		case 'show-console': clone.showConsole = action.value; return true;
		case 'toggle-console': clone.showConsole = !clone.showConsole;	return true;
		case 'toggle-sidebar': clone.showSidebar = !clone.showSidebar; return true;
		case 'toggle-statusbar': clone.showStatusBar = !clone.showStatusBar;	return true;
		case 'toggle-theme-editor': clone.showThemeEditor = !clone.showThemeEditor; return true;
		case 'is-tracking-mouse': clone.isTrackingMouse = action.value; return true;
		case 'is-welcome-visible': clone.isWelcomeVisible = action.value; return true;
		case 'is-debugging': clone.isDebugging = action.value; return true;
		case 'can-save': clone.canSave = action.value; return true;

		case 'console-height': 
			clone.consoleHeight = action.value;
			clone.terminalRows = Math.round(action.value / 15) - 2;
			window.xterm.resize(window.xterm.cols, clone.terminalRows);
			return true;
		case 'sidebar-width': clone.sidebarWidth = action.value; return true;
		case 'dialog': clone.dialog = action.value; return true;
		case 'focus-path': clone.focusPath = action.value; return true;
		case 'selected-path': clone.selectedPath = action.value; return true;
		case 'project-path': clone.projectPath = action.value; return true;
		case 'file-changed': clone.eventPath = action.value; return true;
		case 'event-path': clone.eventPath = action.value; return true;

		case 'pick-image': 
			clone.dialog = 'pick-image';
			//dialogContext.callback = action.value;
			return true;
		case 'pick-image-finished':
			clone.dialog = '';
			window.api.finishPickImage(action.value);
			//dialogContext.callback(action.value);
			//dialogContext.callback = null;
			return true;
		
		case 'rename-finished':
			const file = getFileNameInfo(clone.selectedPath);
			const target = file.path + action.value;

			if (file.full != target) {
				window.api.renameFile(file.full, target);
				console.log("file renamed", {
					'from': file.full,
					'to': target
				});
			}
			else {
				console.log('no need to rename file');
			}

			clone.dialog = '';
			return true;

		case 'dialog2':
			clone.dialog2 = action.value;
			clone.dialog2message = action?.data;
			return true;

		case 'prompt':
			clone.dialog2 = 'prompt';
			clone.dialog2message = action?.message;
			clone.dialog2default = action?.defaultValue;
			return true;
			
		case 'alert-finished':
		case 'confirm-finished':
		case 'prompt-finished':
			clone.dialog2 = '';
			window.api.finishConfirm(action.value);
			return true;
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
	showConsole: true,		// true to show the terminal.
	showSidebar: true,		// true to show the sidebar.
	showStatusBar: true,		// true to show the status bar.
	showThemeEditor: false,	// true to show the theme editor widget.
	isTrackingMouse: '',		// true when the program is tracking the mouse.
	isWelcomeVisible: true,	// true when the welcome page is visible.
	isDebugging: false,		// true when the game is running.
	canSave: false,			// weather or not a file can be saved.
	consoleHeight: 150,		// the height of the terminal.
	terminalRows: 8,        // the height of the terminal in rows (usually height / 20)
	sidebarWidth: 240,		// the width of the left sidebar.
	dialog: '',					// the key of the dialog to show.
	dialog2: '',				// the key of the 2nd level dialog to show.
	dialog2message: '',		// an argument passed to the 2nd level dialog.
	dialog2default: '',		// default prompt value for 2nd level dialog.
	focusPath: '',    		// the path highlighted when a context menu appears.
	selectedPath: '',			// the path of the selected file or directory.
	projectPath: '',			// the project path.
	eventPath: '' 				// changes when a file changes in the project directory.
};