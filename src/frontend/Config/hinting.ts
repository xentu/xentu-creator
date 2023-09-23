import { Position } from "monaco-editor";


export type WordInfo = {
	word:string,
	phrase?:string,
	start:number,
	end:number
}


export function monacoMatchToken(line:string, position: Position) :WordInfo|null {
	const x = position.column;
		const regex = /\w+(?=(?:[^"]*"[^"]*")*[^"]*$)/g;
		var match:RegExpExecArray;
		const tokens = [];

		while ((match = regex.exec(line)) != null) {
			const word = match[0];
			tokens.push({
				word: word,
				start: match.index,
				end: match.index + word.length
			} as WordInfo)
		}

		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			if (x >= token.start && x < token.end) {
				// if not the first token, and no space is before, then
				// treat the previous token as a connected word.
				if (i > 0 && line[token.start - 1] !== ' ' && line[token.start - 1] !== '(') {
					const sep = line[token.start - 1];
					token.phrase = tokens[i-1].word + sep + token.word;
				}
				else {
					token.phrase = token.word;
				}
				return token;
			}
		}

		return null;
};