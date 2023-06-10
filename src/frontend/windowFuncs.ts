import * as monaco from 'monaco-editor';


/**
 * 
 */
declare global {
	interface Window {
	  api?: any;
	  findEditor: Function
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