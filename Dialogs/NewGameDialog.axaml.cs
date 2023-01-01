using Avalonia.Controls;
using Avalonia.Interactivity;
using Newtonsoft.Json;
using System.IO;
using System.Threading.Tasks;
using XentuCreator.Classes;
using XentuCreator.Helpers;

namespace XentuCreator.Dialogs
{
    public partial class NewGameDialog : Window
    {
        NewGameModel _data = new();

        public string? SavedFilename { get; private set; }


        public NewGameDialog()
        {
            InitializeComponent();
            WindowExtensions.HideMinimizeAndMaximizeButtons(this);
            this.DataContext = _data;
        }


        public static new Task<string?> Show(Window parent)
        {
            var dlg = new NewGameDialog();
            var tcs = new TaskCompletionSource<string?>();
            dlg.Closed += delegate { tcs.TrySetResult(dlg.SavedFilename); };

            if (parent != null)
            {
                dlg.ShowDialog(parent);
            }
            else
            {
                dlg.Show();
            }

            return tcs.Task;
        }


        public async void ButtonOK_Click(object? sender, RoutedEventArgs e)
        {
            XentuConfigGame config = new();
            config.title = _data.Title;

            string ext = "js";
            if (_data.Language == GameCodeLanguage.Lua) ext = "lua";
            if (_data.Language == GameCodeLanguage.Python) ext = "py";
            config.entry_point = $"/main.{ext}";
            config.viewport.width = _data.ViewportWidth;
            config.viewport.height = _data.ViewportHeight;
            config.viewport.mode = _data.ViewportMode;
            config.window.width = _data.ViewportWidth;
            config.window.height = _data.ViewportHeight;
            config.draw_frequency = config.update_frequency = _data.TargetFPS;
            config.v_sync = _data.VSync;
            config.fullscreen = _data.Fullscreen;

            XentuConfigGameContainer c = new() { Game = config };

            SaveFileDialog dlg = new()
            {
                InitialFileName = "game.json",
                Filters = new()
            };
            dlg.Filters.Add(new() { Name = "Game Project", Extensions = { "json" } });
            string? filename = await dlg.ShowAsync(this);

            if (filename != null)
            {
                
                JsonSerializer js = new();
                using (FileStream fs = File.Create(filename))
                using (StreamWriter sw = new StreamWriter(fs))
                using (JsonTextWriter jw = new JsonTextWriter(sw))
                {
                    jw.Formatting = Formatting.Indented;
                    jw.IndentChar = '\t';
                    jw.Indentation = 1;
                    js.Serialize(jw, c);
                }
                //await File.WriteAllTextAsync(filename, json);

                FileInfo info = new(filename);
                if (info.DirectoryName != null)
                {
                    Directory.CreateDirectory(info.DirectoryName + "/audio");
                    Directory.CreateDirectory(info.DirectoryName + "/textures");
                    string epfile = Path.Combine(info.DirectoryName + config.entry_point);
                    switch (_data.Language)
                    {
                        case GameCodeLanguage.JavaScript:
                            string? js_template = ResourceLoader.LoadTextFile("template_js.txt");
                            await File.WriteAllTextAsync(epfile, js_template);
                            break;
                        case GameCodeLanguage.Lua:
                            string? lua_template = ResourceLoader.LoadTextFile("template_lua.txt");
                            await File.WriteAllTextAsync(epfile, lua_template);
                            break;
                        case GameCodeLanguage.Python:
                            await File.WriteAllTextAsync(epfile, "# your game code goes here.");
                            break;
                    }
                }

                SavedFilename = filename;
                Close();
            }
        }


        public void ButtonCancel_Click(object? sender, RoutedEventArgs e) => Close();
    }


    public class NewGameModel
    {
        public string Title { get; set; } = "Untitled";
        public GameCodeLanguage Language { get; set; } = GameCodeLanguage.JavaScript;
        public string Template { get; set; }
        public int ViewportWidth { get; set; } = 800;
        public int ViewportHeight { get; set; } = 600;
        public XentuConfigViewportMode ViewportMode { get; set; } = XentuConfigViewportMode.Centre;
        public int TargetFPS { get; set; } = 30;
        public bool VSync { get; set; } = true;
        public bool Fullscreen { get; set; } = false;
    }


    public struct FileTypePair
    {
        public string Name;
        public string Extension;
        public bool IsFolder;
        public FileTypePair(string name, string ext, bool folder = false)
        {
            Name = name;
            Extension = ext;
            IsFolder = folder;
        }
        public override string ToString()
        {
            if (IsFolder)
            {
                return "File Folder";
            }
            return !string.IsNullOrWhiteSpace(Extension) ? $"{Name} ({Extension})" : Name;
        }
    }
}