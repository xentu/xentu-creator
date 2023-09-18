/**
 * This file is auto-loaded by webpack and run in the "renderer" context.
 * It's the main entrypoint for code on the renderer side.
 */

declare global {
	interface Window {
	  api?: any;
	}
}


//import '../../node_modules/bulma/css/bulma.min.css';
//import './Resources/css/app.css';
import './app';


const shortcutEquals = (a:Array<any>, b:Array<any>) => 
	a.length === b.length && a.every((v, i) => v === b[i]);

 
window.addEventListener('keypress', (e: KeyboardEvent) => {
	const pressed = [];
	if (e.ctrlKey == true) pressed.push('ctrl');
	if (e.shiftKey == true) pressed.push('shift');
	if (e.altKey == true) pressed.push('alt');
	//const key = e.key.toLowerCase();
	const code = e.code.toLowerCase();
	pressed.push(code);

	if (shortcutEquals(pressed, ['ctrl', 'keyn'])) window.api.newGame();
	if (shortcutEquals(pressed, ['ctrl', 'keyo'])) window.api.openFolder();
	if (shortcutEquals(pressed, ['ctrl', 'keys'])) window.api.menuSave();
	if (shortcutEquals(pressed, ['ctrl', 'shift', 'keya'])) window.api.menuSaveAs();
	if (shortcutEquals(pressed, ['ctrl', 'shift', 'keys'])) window.api.menuSaveAll();
	
	if (shortcutEquals(pressed, ['ctrl', 'keya'])) window.api.menuSelectAll();
	if (shortcutEquals(pressed, ['ctrl', 'keyb'])) window.api.menuSidebar();
	if (shortcutEquals(pressed, ['ctrl', 'shift', 'keyb'])) window.api.menuStatusBar();
	if (shortcutEquals(pressed, ['ctrl', 'shift', 'keyc'])) window.api.menuConsole();
	if (shortcutEquals(pressed, ['ctrl', 'shift', 'keyd'])) window.api.menuThemeEditor();
	//console.log(pressed, e);
}, true)


window.addEventListener('keyup', (e: KeyboardEvent) => {
	const pressed = [];
	if (e.ctrlKey == true) pressed.push('ctrl');
	if (e.shiftKey == true) pressed.push('shift');
	if (e.altKey == true) pressed.push('alt');
	//const key = e.key.toLowerCase();
	const code = e.code.toLowerCase();
	pressed.push(code);

	if (shortcutEquals(pressed, ['f1'])) window.api.menuHelp();
	if (shortcutEquals(pressed, ['f5'])) window.api.menuRun();
	if (shortcutEquals(pressed, ['f6'])) window.api.menuRunWithoutDebug();
	if (shortcutEquals(pressed, ['f8'])) window.api.menuOptions();
	if (shortcutEquals(pressed, ['f11'])) window.api.menuFullScreen();
}, true)