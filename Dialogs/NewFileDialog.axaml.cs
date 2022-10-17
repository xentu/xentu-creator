using Avalonia.Controls;
using Avalonia.Interactivity;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using XentuCreator.Helpers;

namespace XentuCreator.Dialogs
{
    public partial class NewFileDialog : Window
    {
        bool? _dialogResult = null;
        string _basePath = "", _relPath = "";
        FileTypePair[] _fileTypes =
        {
            new("Code File", ".js"),
            new("Code File", ".lua"),
            new("Sprite Sheet", ".xsf"),
            new("Sprite Font", ".xff"),
            new("Tiled TileMap", ".tmx"),
            new("JSON File", ".json"),
            new("XML File", ".xml"),
            new("MarkDown File", ".md"),
            new("Text File", ".txt"),
            new("Vertex Shader", ".vert"),
            new("Fragment Shader", ".frag"),
            new("Folder", "", true)
        };


        public NewFileDialog()
        {
            InitializeComponent();
        }


        public NewFileDialog(string relPath, string basePath, bool defaultFolder) : this()
        {
            WindowExtensions.HideMinimizeAndMaximizeButtons(this);
            ComboBox comboBox = this.FindControl<ComboBox>("ComboFileType");
            comboBox.Items = _fileTypes;
            comboBox.SelectedIndex = 0;
            _relPath = relPath;
            _basePath = basePath;

            if (defaultFolder)
            {
                comboBox.SelectedItem = _fileTypes.Last();
            }

            TextBlock textFolder = this.FindControl<TextBlock>("TextFolder");
            textFolder.Text = relPath.Replace("\\", "/");
        }


        private void NewFileDialog_Opened(object? sender, System.EventArgs e)
        {
            TextBox textBox = this.FindControl<TextBox>("TextName");
            textBox.SelectAll();
            textBox.Focus();
        }


        public async void ButtonOK_Click(object? sender, RoutedEventArgs e)
        {
            TextBox tbName = this.FindControl<TextBox>("TextName");
            ComboBox comboFileType = this.FindControl<ComboBox>("ComboFileType");
            FileTypePair ext = _fileTypes[comboFileType.SelectedIndex];
            string name = tbName.Text;

            if (ext.IsFolder)
            {
                string directory = $"{_basePath}\\{_relPath}\\{name}".Replace(@"\\", @"\");
                if (Directory.Exists(directory))
                {
                    await MessageBox.Show(this, "Error this directory name is taken, please choose another!", "Invalid Name", MessageBoxButtons.Ok);
                    return;
                }
                Directory.CreateDirectory(directory);
            }
            else
            {
                string filename = $"{_basePath}\\{_relPath}\\{name}{ext.Extension}".Replace(@"\\", @"\");
                if (File.Exists(filename))
                {
                    await MessageBox.Show(this, "Error this filename is taken, please choose another!", "Invalid Name", MessageBoxButtons.Ok);
                    return;
                }
                await File.WriteAllTextAsync(filename, "");
            }
            
            _dialogResult = true;
            Close();
        }


        public void ButtonCancel_Click(object? sender, RoutedEventArgs e) => Close();


        public static new Task<bool?> Show(Window parent, string relPath, string basePath, bool defaultFolder = false)
        {
            var dlg = new NewFileDialog(relPath, basePath, defaultFolder);
            var tcs = new TaskCompletionSource<bool?>();
            dlg.Closed += delegate { tcs.TrySetResult(dlg._dialogResult); };

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

    }
}
