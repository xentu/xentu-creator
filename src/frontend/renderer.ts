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
//import './app.css';
import './app';


const shortcutEquals = (a:Array<any>, b:Array<any>) => 
	a.length === b.length && a.every((v, i) => v === b[i]);

 
window.addEventListener('keyup', (e: KeyboardEvent) => {
	const pressed = [];
	if (e.ctrlKey == true) pressed.push('ctrl');
	if (e.shiftKey == true) pressed.push('shift');
	if (e.altKey == true) pressed.push('alt');
	pressed.push(e.key.toLowerCase());

	if (shortcutEquals(pressed, ['ctrl', 'n'])) window.api.newGame();
	if (shortcutEquals(pressed, ['ctrl', 'o'])) window.api.openFolder();
	if (shortcutEquals(pressed, ['ctrl', 's'])) window.api.menuSave();
	if (shortcutEquals(pressed, ['ctrl', 'shift', 'a'])) window.api.menuSaveAs();
	if (shortcutEquals(pressed, ['ctrl', 'shift', 's'])) window.api.menuSaveAll();

	if (shortcutEquals(pressed, ['f1'])) window.api.menuHelp();
	if (shortcutEquals(pressed, ['f5'])) window.api.menuRun();
	if (shortcutEquals(pressed, ['f6'])) window.api.menuRunWithoutDebug();
	if (shortcutEquals(pressed, ['f8'])) window.api.menuOptions();
	if (shortcutEquals(pressed, ['f11'])) window.api.menuFullScreen();

	if (shortcutEquals(pressed, ['ctrl', 'a'])) window.api.menuSelectAll();
	if (shortcutEquals(pressed, ['ctrl', 'b'])) window.api.menuSidebar();
	if (shortcutEquals(pressed, ['ctrl', 'shift', 'b'])) window.api.menuStatusBar();
	if (shortcutEquals(pressed, ['ctrl', 'shift', 'c'])) window.api.menuConsole();
}, true)