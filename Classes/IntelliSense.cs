using Avalonia.Controls;
using Avalonia.Rendering;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace XentuCreator.Classes
{
    public class IntelliSense
    {
        public List<IntelliGlobal> Globals { get; set; }
        public Dictionary<string, IntelliMethod> Methods { get; set; }


        public IntelliSense()
        {
            Globals = new List<IntelliGlobal>
            {
                new("print"),
                new("game"),
                new("assets"),
                new("audio"),
                new("renderer"),
                new("sprite_map"),
                new("shader"),
                new("config"),
                new("textbox"),
                new("keyboard"),
                new("mouse"),
                new("data")
            };

            Methods = new();
            
            AddMethod("print", "text", "Print text to the screen.");

            #region Game
            {
                AddMethod("game.create_window", "string event, method callback", "Hook an event");
                AddMethod("game.trigger", "string event", "Trigger an event");
                AddMethod("game.run", "", "begin running the game.");
                AddMethod("game.exit", "", "Exit the game.");
            }
            #endregion

            #region Assets
            {
                AddMethod("assets.mount", "string virtual_path, string real_path", "Mount a virtual path.");
                AddMethod("assets.read_text_file", "string path", "");
                AddMethod("assets.load_texture", "string path", "");
                AddMethod("assets.load_font", "string path, int font_size", "");
                AddMethod("assets.load_sound", "string path", "");
                AddMethod("assets.load_music", "string path", "");
                AddMethod("assets.load_shader", "string path_vs, string path_fs", "");
                AddMethod("assets.load_sprite_map", "string path", "");
                AddMethod("assets.create_textbox", "x, y, w, h", "");
                AddMethod("assets.include", "string path", "");
            }
            #endregion

            #region Audio
            {
                AddMethod("audio_play_sound", "sound_id, channel, loops");
                AddMethod("audio_play_music", "music_id, loops");
                AddMethod("audio_stop_music", "");
                AddMethod("audio_stop_sounds", "channel");
                AddMethod("audio_set_sound_volume", "id, volume");
                AddMethod("audio_set_channel_volume", "channel, volume");
                AddMethod("audio_set_music_volume", "volume");
                AddMethod("audio_set_channel_panning", "channel, left, right");
            }
            #endregion

            #region Renderer
            {
                AddMethod("renderer_begin", "");
                AddMethod("renderer_clear", "");
                AddMethod("renderer_present", "");
                AddMethod("renderer_draw_texture", "texture_id, x, y, width, height");
                AddMethod("renderer_draw_sub_texture", "texture_id, x, y, w, h, sx, sy, sw, sh");
                AddMethod("renderer_draw_rectangle", "x, y, w, h");
                AddMethod("renderer_draw_textbox", "textbox_id");
                AddMethod("renderer_draw_sprite", "sprite_map_id, region_name, x, y, w, h");
                AddMethod("renderer_set_background", "color");
                AddMethod("renderer_set_foreground", "color");
                AddMethod("renderer_set_window_mode", "int mode");
                AddMethod("renderer_set_position", "x, y");
                AddMethod("renderer_set_origin", "x, y");
                AddMethod("renderer_set_rotation", "angle");
                AddMethod("renderer_set_scale", "int x, int y");
                AddMethod("renderer_set_shader", "int shader_id");
                AddMethod("renderer_set_alpha", "float alpha");
                AddMethod("renderer_set_blend", "bool blend");
                AddMethod("renderer_set_blend_func", "src_mode, dest_mode");
            }
            #endregion

            #region SpriteMap
            {
                AddMethod("sprite_map.set_region", "sprite_map_id, region_name, x, y, w, h");
                AddMethod("sprite_map.set_texture", "texture_id");
                AddMethod("sprite_map.reset", "sprite_map_id");
            }
            #endregion

            #region Shader
            {
                AddMethod("shader.get_uniform", "name");
                AddMethod("shader.set_uniforms_bool", "uniform_id, args uniforms");
                AddMethod("shader.set_uniforms_int", "uniform_id, args uniforms");
                AddMethod("shader.set_uniforms_float", "uniform_id, args uniforms");
                AddMethod("shader.set_uniform_matrix", "uniform_id, args uniforms");
            }
            #endregion

            #region Config
            {
                AddMethod("config.get_str", "string key");
                AddMethod("config.get_str2", "string key, string sub_key");
                AddMethod("config.get_bool", "string key");
                AddMethod("config.get_bool2", "string key, string sub_key");
                AddMethod("config.get_int", "string key");
                AddMethod("config.get_int2", "string key, string sub_key");
            }
            #endregion

            #region TextBox
            {
                AddMethod("textbox.set_text", "textbox_id, text");
                AddMethod("textbox.set_color", "color");
                AddMethod("textbox.measure_text", "textbox_id, text");
            }
            #endregion

            #region Keyboard
            {
                AddMethod("keyboard.key_down", "key");
                AddMethod("keyboard.key_clicked", "key");
            }
            #endregion

            #region Mouse
            {
                AddMethod("mouse.get_position", "");
                AddMethod("mouse.button_down", "button");
                AddMethod("mouse.button_click", "button");
            }
            #endregion

            _ = Methods;
        }


        public IntelliMethod AddMethod(string methodSignature, string argSignature, string desc = "")
        {
            IntelliMethod method = new(methodSignature, argSignature, desc);
            Methods.Add(methodSignature, method);
            return method;
        }
    }


    public class IntelliMethod
    {
        public string MethodSignature { get; set; }
        public string ArgsSignature { get; set; }
        public List<IntelliArg> Arguments { get; set; }
        public string Description { get; set; }
        public IntelliMethod(string methodSignature, string argsSignature, string desc = "")
        {
            this.MethodSignature = methodSignature;
            this.ArgsSignature = argsSignature;
            this.Arguments = new();
            this.Description = desc;

            var sso = StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries;
            argsSignature = argsSignature.Replace("(", "").Replace(")", "").Trim();
            foreach (string arg in argsSignature.Split(",", sso))
            {
                string[] argp = arg.Trim().Split(" ", sso);
                Array.Reverse(argp);
                if (argp.Length > 0)
                {
                    Arguments.Add(new(argp[0], argp.Length > 1 ? argp[1] : null));
                }
            }
        }
    }


    public class IntelliArg
    {
        public string Name { get; set; }
        public string? Type { get; set; }
        public string Description { get; set; }
        public IntelliArg(string name, string? type = null, string description = "")
        {
            this.Name = name;
            this.Type = type;
            this.Description = description;
        }
    }


    public class IntelliGlobal
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public IntelliGlobal(string name, string desc = "")
        {
            Name = name;
            Description = desc;
        }
    }
}
