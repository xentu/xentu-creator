import * as monaco from 'monaco-editor';


function assetProposals(range:any) {
	// returning a static list of proposals, not even looking at the prefix (filtering is done by the Monaco editor),
	// here you could do a server side lookup
	return [
		{
			label: 'mount',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "Mount an archive or location for asset access.",
			insertText: 'mount(point, path)',
			range: range,
		},
		{ 
			label: 'read_text_file',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "Read a text file into memory.",
			insertText: "read_text_file(path)",
			range: range,
		},
		{ 
			label: 'load_texture',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "Load a texture for your game.",
			insertText: "load_texture(path)",
			range: range,
		},
		{ 
			label: 'load_font',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "",
			insertText: "load_font(path, size)",
			range: range,
		},
		{ 
			label: 'load_sound',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "",
			insertText: "load_sound(path)",
			range: range,
		},
		{ 
			label: 'load_music',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "",
			insertText: "load_music(path)",
			range: range,
		},
		{ 
			label: 'load_shader',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "",
			insertText: "load_shader(vert, frag)",
			range: range,
		},
		{ 
			label: 'load_sprite_map',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "",
			insertText: "load_sprite_map(path)",
			range: range,
		},
		{ 
			label: 'load_tile_map_tmx',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "",
			insertText: "load_tile_map_tmx(path, working_dir)",
			range: range,
		},
		{ 
			label: 'create_textbox',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "",
			insertText: "create_textbox(w, h, [wrap])",
			range: range,
		},
		{ 
			label: 'unload_texture',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "",
			insertText: "unload_texture(id)",
			range: range,
		},
		{ 
			label: 'unload_font',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "",
			insertText: "unload_font(id)",
			range: range,
		},
		{ 
			label: 'unload_sound',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "",
			insertText: "unload_sound(id)",
			range: range,
		},
		{ 
			label: 'unload_music',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "",
			insertText: "unload_music(id)",
			range: range,
		},
		{ 
			label: 'unload_shader',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "",
			insertText: "unload_shader(id)",
			range: range,
		},
		{ 
			label: 'unload_sprite_map',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "",
			insertText: "unload_sprite_map(id)",
			range: range,
		},
		{ 
			label: 'set_wrap',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "",
			insertText: "set_wrap(wrap_s, [wrap_t])",
			range: range,
		},
		{ 
			label: 'set_interpolation',
			kind: monaco.languages.CompletionItemKind.Function,
			documentation: "",
			insertText: "set_wrap(min, [max])",
			range: range,
		}
	];
}


// Register object that will return autocomplete items 
monaco.languages.registerCompletionItemProvider('javascript', {
	triggerCharacters: ['.', '('],

	provideCompletionItems: function(model, position, token) {
		var textUntilPosition = model.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column });
		var last_chars = model.getValueInRange({startLineNumber: position.lineNumber, startColumn: 0, endLineNumber: position.lineNumber, endColumn: position.column});
		var words = last_chars.replace("\t", "").split(" "); 
		var word = model.getWordUntilPosition(position);
		var range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };

		if (words[0] == 'assets.') {
			return {
				suggestions: assetProposals(range)
			};
		}
		
		// assets
		if (textUntilPosition.match(/(?:a|$)(?:s|$)(?:s|$)(?:e|$)(?:t|$)(?:s|$)/)) {
			return {
				suggestions: [
					{
						label: 'assets',
						kind: monaco.languages.CompletionItemKind.Class,
						documentation: "Manage Game Assets",
						insertText: "assets.",
						range: range
					}
				]
			}	
		}

		// renderer
		if (textUntilPosition.match(/(?:r|$)(?:e|$)(?:n|$)(?:d|$)(?:e|$)(?:r|$)(?:e|$)(?:r|$)/)) {
			return {
				suggestions: [
					{
						label: 'renderer',
						kind: monaco.languages.CompletionItemKind.Class,
						documentation: "Manage Rendering",
						insertText: "renderer.",
						range: range
					}
				]
			}	
		}

		// audio
		if (textUntilPosition.match(/(?:a|$)(?:u|$)(?:d|$)(?:i|$)(?:o|$)/)) {
			return {
				suggestions: [
					{
						label: 'renderer',
						kind: monaco.languages.CompletionItemKind.Class,
						documentation: "Manage Rendering",
						insertText: "renderer.",
						range: range
					}
				]
			}	
		}

		return {
			suggestions: []
	  	};
	}

});