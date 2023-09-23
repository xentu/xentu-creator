/**
 * Config Monaco to handle Python files. Adds the Xentu API
 * to a custom hover provider, and some code completion.
 */


import * as monaco from 'monaco-editor';
import { monacoMatchToken } from './hinting';


monaco.languages.registerHoverProvider("python", {
	provideHover: function (model, position) {
		const line = model.getValueInRange({
			startLineNumber: position.lineNumber,
			startColumn: 1,
			endLineNumber: position.lineNumber,
			endColumn: model.getLineLength(position.lineNumber) + 1
		});

		const token = monacoMatchToken(line, position);

		if (token == null) return null;
		console.log("Match", token);

		return {
			range: new monaco.Range(
				position.lineNumber,
				token.start + 1,
				position.lineNumber,
				token.end + 1
			),
			contents: [
				{ value: "**PY SOURCE**" },
				{ value:	token.phrase + " is here" },
			],
		};
	},
});