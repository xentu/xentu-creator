using Avalonia.Controls;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Threading.Tasks;
using XentuCreator.Classes;

namespace XentuCreator.Dialogs
{
    public partial class SelectImageDialog : Window
    {
        bool _dialogResult = false;

        public ObservableCollection<string> Images { get; private set; } = new();
        public ObservableCollection<string> ImagesFull { get; private set; } = new();
        public string? SelectedFile { get; private set; }
        public string? SelectedFileFull { get; private set; }

        public SelectImageDialog()
        {
            InitializeComponent();

            DataContext = this;

            if (MainWindow._self == null) return;
            MainWindow wnd = MainWindow._self;
            string? path = wnd._mainView.Project?.LoadedFileInfo?.DirectoryName;

            if (!string.IsNullOrWhiteSpace(path))
            {
                string[] files = Directory.GetFiles(path, "*.*", SearchOption.AllDirectories);
                if (files.Length > 500) return;
                foreach (string file in files)
                {
                    if (file.EndsWith(".jpg") || file.EndsWith(".png"))
                    {
                        string fpath = file.Replace(path, "").Replace('\\', '/');
                        Images.Add('/' + fpath.TrimStart('/'));
                        ImagesFull.Add(file);
                    }
                }
            }
        }


        public static new Task<(bool? success, string? path, string? full)> Show(Window parent)
        {
            var dlg = new SelectImageDialog();
            var tcs = new TaskCompletionSource<(bool?, string?, string?)>();
            dlg.Closed += delegate {
                if (dlg.SelectedFile == null) return;
                int index = dlg.Images.IndexOf(dlg.SelectedFile);
                string full = dlg.ImagesFull[index];
                tcs.TrySetResult((dlg._dialogResult, dlg.SelectedFile, full));
            };

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


        internal void DoOK()
        {
            _dialogResult = true;
            Close();
        }


        internal void DoCancel()
        {
            _dialogResult = false;
            Close();
        }
    }
}
