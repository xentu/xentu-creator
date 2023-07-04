import * as monaco from 'monaco-editor';
const convert = require('color-convert');


/**
 * 
 */
declare global {
	interface Window {
	  api?: any;
	  findEditor: Function,
	  changeThemeColors: Function,
	  hexToHsl: Function,
	  hexToHs: Function,
	  xterm: any
	}
}


/**
 * Helper function for locating a Monaco editor by a guid we assigned.
 * @param guid The guid attached to an OpenTab instance.
 * @returns The Monaco editor instance
 */
window.findEditor = function(guid:string) {
	const editors = monaco.editor.getEditors();
	const found = editors.filter(editor => {
		const div = editor.getDomNode();
		return div.parentElement.classList.contains('monaco-' + guid);
	});
	return found.length > 0 ? found[0] : null;
};


window.changeThemeColors = function(isDark:boolean, color:string = '#2e3231') {
	monaco.editor.defineTheme('my-theme', {
		base: isDark ? 'vs-dark' : 'vs',
		inherit: true,
		rules: [],
		colors: {
			"editor.background": color
		},
	});
};


window.hexToHsl = function(hex:string) {
	return convert.hex.hsl(hex);
}

window.hexToHs = function(hex:string) {
	const hsl = convert.hex.hsl(hex);
	return `${hsl[0]}, ${hsl[1]}%`;
}