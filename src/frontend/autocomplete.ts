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


// Remove un-needed auto-complete.
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ noLib: true, allowNonTsExtensions: true });
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({ noLib: true, allowNonTsExtensions: true });



monaco.languages.typescript.typescriptDefaults.addExtraLib([
	'declare function print(message: string) :void',
	`const assets = { 
		mount(point:string, path:string) :void,
		read_text_file(path:string) :string,
		load_texture(path:string) :number,
		load_font(path:string, size:int) :number,
		load_sound(path:string) :number,
		load_music(path:string) :number,
		load_shader(vert:string, frag:string) :number,
		load_sprite_map(path:string) :number,
		load_tile_map_tmx(path:string, working_dir:string) :number,
		create_textbox(w:number, h:number, wrap?:bool) :number,
		unload_texture(asset_id:number) :void,
		unload_font(asset_id:number) :void,
		unload_sound(asset_id:number) :void,
		unload_music(asset_id:number) :void,
		unload_shader(asset_id:number) :void,
		unload_sprite_map(asset_id:number) :void,
		set_wrap(wrap_s:number, wrap_t?:number) :void,
		set_interpolation(min:number, mag?:number) :void
	}`,
	`const renderer = { 
		clear() :void,
		begin(reset:boolean) :void,
		present() :void,
		draw_texture(texture_id:number, x:number, y:number, width:number, height:number) :void,
		draw_sub_texture(texture_id:number, dx:number, dy:number, dw:number, dh:number, sx:number, sy:number, sw:number, sh:number) :void,
		draw_rectangle(float x:number, y:number, width:number, height:number) :void,
		draw_textbox(textbox_id:number) :void,
		draw_sprite(sprite_map_id:number, group:string, frame:number, x:number, y:number, w:number, h:number) :void,
		draw_tile_layer(tile_map_id:number, layer:number) :void,
		set_background(hex_color:string) :void,
		set_foreground(hex_color:string) :void,
		set_window_mode(mode:number) :void,
		set_position(x:number, y:number) :void,
		set_origin(x:number, y:number) :void,
		set_rotation(angle:number) :void,
		set_scale(x:number, y:number) :void,
		set_shader(shader_id:number) :void,
		set_alpha(alpha:number) :void,
		set_blend(blend:boolean) :void,
		set_blend_func(src_func:string, dest_func:string) :void,
		set_blend_preset(preset_name:string, with_alpha:bool) :void
	}`,
	'const someString: string ',
].join('\n'));