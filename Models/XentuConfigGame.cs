using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;

namespace XentuCreator.Models
{
    public class XentuConfigGameContainer
    {
        [JsonProperty("game")]
        public XentuConfigGame Game { get; set; } = new();

        [JsonIgnore]
        public string Filename { get; set; }

        public static XentuConfigGameContainer? Load(string filename)
        {
            var r = JsonConvert.DeserializeObject<XentuConfigGameContainer>(File.ReadAllText(filename));
            r.Filename = filename;
            return r;
        }

        internal void Save(string fileName)
        {
            JsonSerializer js = new();
            using (FileStream fs = File.Create(fileName))
            using (StreamWriter sw = new StreamWriter(fs))
            using (JsonTextWriter jw = new JsonTextWriter(sw))
            {
                jw.Formatting = Formatting.Indented;
                jw.IndentChar = '\t';
                jw.Indentation = 1;
                js.Serialize(jw, this);
            }
        }
    }


    public class XentuConfigGame
    {
        public string title { get; set; } = "Untitled";
        public string entry_point { get; set; } = "game.lua";
        public string version { get; set; } = "0.0.0";
        public bool v_sync { get; set; } = true;
        public bool fullscreen { get; set; } = false;
        public int update_frequency { get; set; } = 30;
        public int draw_frequency { get; set; } = 30;
        public XentuConfigWindow window { get; set; } = new();
        public XentuConfigViewport viewport { get; set; } = new();
        public XentuConfigAudio audio { get; set; } = new();
        public XentuConfigGame() { }

        public static XentuConfigGame CreateDefault()
        {
            return new()
            {
                title = "Untitled",
                entry_point = "./game.lua",
                version = "0.0.0",
                update_frequency = 30,
                draw_frequency = 30,
                window = new(800, 600),
                viewport = new(800, 600, XentuConfigViewportMode.Centre),
                v_sync = true,
                fullscreen = false,
                audio = new(44100, 2, 16)
            };
        }
    }


    public class XentuConfigWindow
    {
        public int width { get; set; }
        public int height { get; set; }
        public XentuConfigWindow() { }
        public XentuConfigWindow(int w, int h)
        {
            this.width = w;
            this.height = h;
        }
    }


    public class XentuConfigViewport
    {
        public int width { get; set; }
        public int height { get; set; }
        public XentuConfigViewportMode mode { get; set; }
        public XentuConfigViewport() { }
        public XentuConfigViewport(int w, int h, XentuConfigViewportMode mode)
        {
            this.width = w;
            this.height = h;
            this.mode = mode;
        }
    }


    public enum XentuConfigViewportMode : int
    {
        None = 0,
        Centre = 1,
        Stretch = 2
    }


    public class XentuConfigAudio
    {
        public int frequency { get; set; } = 44100;
        public int channels { get; set; } = 2;
        public int depth { get; set; } = 16;
        public List<string> codecs { get; set; } = new();
        public XentuConfigAudio() { }
        public XentuConfigAudio(int freq, int channels, int depth)
        {
            this.frequency = freq;
            this.channels = channels;
            this.depth = depth;
        }
    }
}