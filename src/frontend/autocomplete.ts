import * as monaco from 'monaco-editor';


// Remove un-needed auto-complete.
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ noLib: true, allowNonTsExtensions: true, noResolve:true });
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({ noLib: true, allowNonTsExtensions: true, noResolve:true });


// Define some definitions to use in js/ts.
const xentuLibContent = [
	`
	/**
	 * Use the virtual file system to load code from another JavaScript file, 
	 * and then executes it within the current context.
	 * @param path The virtual path to the JavaScript file to load.
	 */
	declare function include(path: string) :void

	/**
	 * Send a string message to the console.
	 * @param message The message to send.
	 */	
	declare function print(message: string) :void
	`,
	`/** The Xentu game object. */
	const game = {
		/**
		 * Exit the game
		 */
		exit() :void,

		/**
		 * Handle a Xentu game event.
		 * @param event The name of the event to handle.
		 * @param callback A callback function to execute.
		 */
		on(event:string, callback:Function) :void,

		/**
		 * Trigger a built-in or custom Xentu game event.
		 * @param event The name of the event to trigger.
		 * @param arg0 Pass an optional argument to the event.
		 */
		trigger(event:string, arg0?:any) :void
	}
	`,
	`/** The Xentu assets system. */
	const assets = { 
		/**
		 * Mount a virtual filesystem.
		 * @param point The mount point that becomes accessible.
		 * @param path The real location of the filesystem (relative/absolute path or zip file).
		 */
		mount(point:string, path:string) :void,

		/**
		 * Read the contents of a text file.
		 * @param path The virtual file path.
		 * @returns The contents of the file, or null.
		 */
		read_text_file(path:string) :string|null,

		/**
		 * Load a texture (jpg, png, gif, tga, tga etc...).
		 * @param path The virtual file path.
		 * @returns The loaded asset id.
		 */
		load_texture(path:string) :number,

		/**
		 * Load a true-type (.ttf, .fon) font at a specific font size.
		 * @param path The virtual file path.
		 * @param size The size of the font to load (in pt)
		 * @returns The loaded asset id.
		 */
		load_font(path:string, size:int) :number,

		/**
		 * Load a sound file (wav).
		 * @param path The virtual file path.
		 * @returns The loaded asset id.
		 */
		load_sound(path:string) :number,

		/**
		 * Load a music file (wav, mp3, ogg).
		 * @param path The virtual file path.
		 * @returns The loaded asset id.
		 */
		load_music(path:string) :number,

		/**
		 * Load a GLSL shader pair (version 330 or higher)
		 * @param vert The source code for the vertex shader.
		 * @param frag The source code for the fragment shader.
		 * @returns The loaded asset id.
		 */
		load_shader(vert:string, frag:string) :number,

		/**
		 * Load a Sprite Map into memory.
		 * @param path The virtual file path.
		 * @returns The loaded asset id.
		 */
		load_sprite_map(path:string) :number,

		/**
		 * Load a TMX tile map into memory.
		 * @param path The virtual file path.
		 * @param working_dir The virtual working directory from which to load tile-map assets.
		 * @returns The loaded asset id.
		 */
		load_tile_map_tmx(path:string, working_dir:string) :number,

		/**
		 * Create a textbox on which to draw text.
		 * @param w The width of the textbox.
		 * @param h The height of the textbox.
		 * @param wrap Whether or not to wrap text onto new lines.
		 * @returns The loaded asset id.
		 */
		create_textbox(w:number, h:number, wrap?:bool) :number,

		/**
		 * Unload a texture.
		 * @param asset_id The id of the asset to unload.
		 */
		unload_texture(asset_id:number) :void,

		/**
		 * Unload a font.
		 * @param asset_id The id of the asset to unload.
		 */
		unload_font(asset_id:number) :void,

		/**
		 * Unload a sound.
		 * @param asset_id The id of the asset to unload.
		 */
		unload_sound(asset_id:number) :void,

		/**
		 * Unload music.
		 * @param asset_id The id of the asset to unload.
		 */
		unload_music(asset_id:number) :void,

		/**
		 * Unload a shader program.
		 * @param asset_id The id of the asset to unload.
		 */
		unload_shader(asset_id:number) :void,

		/**
		 * Unload a sprite map.
		 * @param asset_id The id of the asset to unload.
		 */
		unload_sprite_map(asset_id:number) :void,

		/**
		 * Set wrap mode for textures when loading. Available modes are: 
		 * TEX_CLAMP_TO_EDGE, TEX_CLAMP_TO_BORDER, TEX_MIRRORED_REPEAT, TEX_REPEAT
		 * @param wrap_s The primary wrap option.
		 * @param wrap_t The optional second wrap option.
		 */
		set_wrap(wrap_s:number, wrap_t?:number) :void,

		/**
		 * Set interpolation mode for textures when loading. Available modes are:
		 * TEX_LINEAR, TEX_NEAREST
		 * @param min The primary interpolation option.
		 * @param mag The optional secondary interpolation option used for magnification.
		 */
		set_interpolation(min:number, mag?:number) :void
	}
	`,
	`/** The Xentu renderer. */
	const renderer = { 
		clear() :void,
		begin(reset?:boolean) :void,
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
	}
	`,
	`/** The Xentu sprite map system. */
	const sprite_map = {
		get_frame_info(sprite_map_id:number, group:string, frame:number) :object,
		get_frame_count(sprite_map_id:number, group:string) :number
	}
	`,
	`/** The Xentu tile map system. */
	const tile_map = {
		get_layer(tile_map_id:number, layer_id:number) :object,
		get_layer_tiles(tile_map_id:number, layer_id:number) :Array<any>,
		get_layer_objects(tile_map_id:number, layer_id:number) :Array<any>,
		get_tile(tile_map_id:number, layer_id:number, tile_id:number) :object,
		get_object(tile_map_id:number, layer_id:number, object_id:number) :object,
		change_layer(tile_map_id:number, layer_id:number, prop:string, value:string) :void,
		change_tile(tile_map_id:number, layer_id:number, tile_id:number, prop:string, value:string) :void,
		change_object(tile_map_id:number, layer_id:number, object_id:number, prop:string, value:string) :void
	}
	`,
	`/** The Xentu textbox system. */
	const textbox = {
		set_text(textbox_id:number, font_id:number, text:string) :void,
		set_color(textbox_id:number, hex:string) :void,
		measure_text(textbox_id:number, font_id:number, text:string) :object
	}
	`,
	`/** The Xentu audio system. */
	const audio = {
		play_sound() :void,
		play_music() :void,
		stop_sound() :void,
		stop_music() :void,
		set_sound_volume(sound_id:number, volume:number) :void,
		set_channel_volume(channel_id:number, volume:number) :void,
		set_music_volume(volume:number) :void,
		set_channel_panning(channel_id:number, left:number, left:number) :void
	}
	`,
	`/** The Xentu keyboard system. */
	const keyboard = {
		key_down(keycode:number) :boolean,
		key_clicked(keycode:number) :boolean
	}
	`,
	`/** The Xentu mouse system. */
	const mouse = {
		get_position() :object,
		button_down(button_index:number) :boolean,
		button_clicked(button_index:number) :boolean
	}
	`,
	`/** The Xentu gamepad system. */
	const gamepad = {
		get_axis(gamepad_index:number) :object,
		get_axis_raw(gamepad_index:number) :object,
		button_down(gamepad_index:number, button_index:number) :boolean,
		button_clicked(gamepad_index:number, button_index:number) :boolean
	}
	`,
	`/** The Xentu shader system. */
	const shaders = {
		get_location(variable_name:string) :number,
		set_bool(location:number, value:boolean) :void,
		set_int(location:number, value:number) :void,
		set_float(location:number, value:number) :void
	}
	`,
	`
	const KB_0, KB_RIGHT, KB_KP_3, KB_1, KB_BACKSLASH;
	const KB_F18, KB_2, KB_RIGHT_BRACKET, KB_F19, KB_3;
	const KB_GRAVE_ACCENT, KB_F20, KB_4, KB_ESCAPE, KB_F21;
	const KB_5, KB_ENTER, KB_F22, KB_6, KB_TAB, KB_F23;
	const KB_7, KB_BACKSPACE, KB_F24, KB_8, KB_INSERT;
	const KB_KP_1, KB_9, KB_DELETE, KB_KP_2, KB_A;
	const KB_UP, KB_KP_6, KB_APOSTROPHE, KB_W, KB_F13;
	const KB_B, KB_PAGE_UP, KB_KP_7, KB_C, KB_PAGE_DOWN;
	const KB_KP_8, KB_COMMA, KB_X, KB_F14, KB_D;
	const KB_HOME, KB_KP_9, KB_E, KB_END, KB_KP_0;
	const KB_EQUAL, KB_DOWN, KB_KP_5, KB_F, KB_CAPS_LOCK;
	const KB_KP_DECIMAL, KB_F12, KB_G, KB_SCROLL_LOCK;
	const KB_KP_DIVIDE, KB_H, KB_NUM_LOCK, KB_KP_MULTIPLY;
	const KB_I, KB_PRINT_SCREEN, KB_KP_SUBTRACT, KB_J;
	const KB_PAUSE, KB_KP_ADD, KB_K, KB_F1, KB_KP_ENTER;
	const KB_L, KB_F2, KB_KP_EQUAL, KB_M, KB_F3;
	const KB_LEFT_SHIFT, KB_MINUS, KB_Y, KB_F15, KB_N;
	const KB_F4, KB_LEFT_CONTROL, KB_O, KB_F5, KB_LEFT_ALT;
	const KB_P;	const KB_F6, KB_LEFT_SUPER, KB_PERIOD, KB_Z;
	const KB_F16, KB_Q, KB_F7, KB_RIGHT_SHIFT, KB_R;
	const KB_F8, KB_RIGHT_CONTROL, KB_S, KB_F9, KB_RIGHT_ALT;
	const KB_SEMICOLON, KB_LEFT, KB_KP_4, KB_SLASH; 
	const KB_LEFT_BRACKET, KB_F17, KB_SPACE, KB_T, KB_F10;
	const KB_RIGHT_SUPER, KB_U, KB_F11, KB_MENU, KB_V;

	const TEX_CLAMP_TO_EDGE, TEX_CLAMP_TO_BORDER, TEX_MIRRORED_REPEAT, TEX_REPEAT;

	`
].join('\n');


// Declare them as extra libs in monaco.
monaco.languages.typescript.javascriptDefaults.addExtraLib(xentuLibContent, 'xentu-lib');
monaco.languages.typescript.typescriptDefaults.addExtraLib(xentuLibContent, 'xentu-lib');