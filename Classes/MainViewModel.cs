using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using AvaloniaEdit;
using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;

namespace XentuCreator.Classes
{
    public class MainViewModel : INotifyPropertyChanged
    {
        MainWindow _owner;
        TextEditor _editor;
        CreatorProject? _project;
        readonly EventLog _events = new();
        bool _loaded = false, _showSidebar = true, _showStatusBar = true, _showConsole = true;


        public event PropertyChangedEventHandler? PropertyChanged;


        #region Subscribable Properties

        public CreatorProject? Project
        {
            get => _project;
            set
            {
                _project = value;
                SetupWatcher(value?.LoadedFileInfo?.DirectoryName);
                PropertyChanged?.Invoke(this, new(nameof(Project)));
            }
        }

        public EventLog Events
        {
            get => _events;
        }

        public bool Loaded
        {
            get => _loaded;
            set
            {
                _loaded = value;
                PropertyChanged?.Invoke(this, new(nameof(Loaded)));
            }
        }

        public bool ShowSidebar
        {
            get => _showSidebar;
            set
            {
                _showSidebar = value;
                PropertyChanged?.Invoke(this, new(nameof(ShowSidebar)));
            }
        }

        public bool ShowStatusBar
        {
            get => _showStatusBar;
            set
            {
                _showStatusBar = value;
                PropertyChanged?.Invoke(this, new(nameof(ShowStatusBar)));
            }
        }

        public bool ShowConsole
        {
            get => _showConsole;
            set
            {
                _showConsole = value;
                PropertyChanged?.Invoke(this, new(nameof(ShowConsole)));
            }
        }

        public bool CanSave
        {
            get => Loaded && (SelectedTab?.HasChanged ?? false);
        }

        public bool CanSaveAll
        {
            get => Loaded && (OpenTabs?.Any(t => t.HasChanged) ?? false);
        }

        public bool CanRenameSelectedFile
        {
            get
            {
                TreeView tv = _owner.GetControl<TreeView>("FolderView");
                CreatorNode? node = tv.SelectedItem as CreatorNode;
                if (node == null) return false;
                CreatorTab? tab = FindTabFromNode(node);
                if (tab == null) return true;
                return tab.HasChanged == false;
            }
        }

        public bool CanCopy { get => _editor.SelectionLength > 0; }
        public bool CanCut { get => _editor?.SelectionLength > 0; }
        public bool CanPaste {
            get
            {
                var task = Application.Current?.Clipboard?.GetTextAsync();
                if (task == null)
                    return false;
                task.Wait();
                return !string.IsNullOrWhiteSpace(task.Result);
            }
        }

        #endregion


        #region Properties

        public CreatorTab? SelectedTab { get; set; } = null;

        public ObservableCollection<CreatorTab> OpenTabs { get; set; } = new();

        public CreatorNodeCollection FileSystem { get; set; } = new();

        public FileSystemWatcher? Watcher { get; private set; }

        #endregion


        public MainViewModel(MainWindow owner, TextEditor editor)
        {
            _owner = owner;
            _editor = editor;
        }


        public void TriggerSave() => _owner.MenuSave_Click(_owner, new());
        public void TriggerSaveAll() => _owner.MenuSaveAll_Click(_owner, new());
        public void TriggerNew() => _owner.MenuNewGame_Click(_owner, new());
        public void TriggerOpen() => _owner.MenuOpenGame_Click(_owner, new());
        public void TriggerClose() => _owner.MenuCloseGame_Click(_owner, new());
        public void TriggerGameProperties() => _owner.MenuGameProperties_Click(_owner, new());
        public void TriggerFileExplorer() => _owner.RvealInFileExplorer();
        public void TriggerPublish() { }
        public void TriggerExit() => _owner.MenuExit_Click(_owner, new());

        public void TriggerCut() => _owner.MenuEditCut_Click(_owner, new());
        public void TriggerCopy() => _owner.MenuEditCopy_Click(_owner, new());
        public void TriggerPaste() => _owner.MenuEditPaste_Click(_owner, new());
        public void TriggerDelete() => _owner.MenuEditDelete_Click(_owner, new());
        public void TriggerSelectAll() => _owner.MenuEditSelectAll_Click(_owner, new());

        public void TriggerToggleFullScreen() => _owner.MenuToggleFullScreen_Click(_owner, new());
        public void TriggerPlay() => _owner.MenuPlay_Click(_owner, new());
        public void TriggerPlayRelease() => _owner.MenuPlayRelease_Click(_owner, new());
        public void TriggerDebugSettings() => _owner.MenuOptions_Click(_owner, new ExRoutedEventArgs("debug"));
        public void TriggerOptions() => _owner.MenuOptions_Click(_owner, new());
        public void TriggerAbout() => _owner.MenuAbout_Click(_owner, new());
        public void TriggerClearConsole() => _events.Clear();


        public void ToggleShowSidebar() => ShowSidebar = !ShowSidebar;
        public void ToggleShowStatusBar() => ShowStatusBar = !ShowStatusBar;
        public void ToggleShowConsole() => ShowConsole = !ShowConsole;


        public void SaveStateChanged()
        {
            PropertyChanged?.Invoke(this, new(nameof(CanSave)));
            PropertyChanged?.Invoke(this, new(nameof(CanSaveAll)));
        }
        public void SelectedTreeItemChanged()
        {
            PropertyChanged?.Invoke(this, new(nameof(CanRenameSelectedFile)));
        }
        

        #region Functions


        CreatorTab? FindTabFromNode(CreatorNode node) => OpenTabs.FirstOrDefault(t => t.FilePath == node.FullPath);


        public void SetupWatcher(string? directoryPath)
        {
            if (Watcher != null)
            {
                Watcher.Changed -= OnChanged;
                Watcher.Created -= OnCreated;
                Watcher.Deleted -= OnDeleted;
                Watcher.Renamed -= OnReanmed;
                Watcher.Error -= OnError;
                Watcher.Dispose();
            }
            if (directoryPath != null)
            {
                Watcher = new(directoryPath);
                Watcher.NotifyFilter = NotifyFilters.Attributes | NotifyFilters.CreationTime
                                     | NotifyFilters.DirectoryName | NotifyFilters.FileName
                                     | NotifyFilters.LastWrite | NotifyFilters.Security
                                     | NotifyFilters.Size;
                Watcher.Changed += OnChanged;
                Watcher.Created += OnCreated;
                Watcher.Deleted += OnDeleted;
                Watcher.Renamed += OnReanmed;
                Watcher.Error += OnError;
                Watcher.Filter = "*.*";
                Watcher.IncludeSubdirectories = true;
                Watcher.EnableRaisingEvents = true;
            }
        }


        private void OnChanged(object sender, FileSystemEventArgs e)
        {
            if (e.ChangeType != WatcherChangeTypes.Changed) return;
            Debug.WriteLine($"Changed: {e.FullPath}");
        }
        private void OnCreated(object sender, FileSystemEventArgs e)
        {
            if (e.ChangeType != WatcherChangeTypes.Created) return;

            FileInfo info = new(e.FullPath);
            FileAttributes attr = File.GetAttributes(e.FullPath);
            bool isDir = (attr & FileAttributes.Directory) == FileAttributes.Directory;

            if (info.DirectoryName != null && Project?.LoadedFileInfo?.DirectoryName != null)
            {
                if (info.DirectoryName == Project.LoadedFileInfo.DirectoryName)
                {
                    // base dir.
                    FileSystem.Add(new CreatorNode(info.Name, e.FullPath, !isDir));
                    FileSystem.NaturalSort();
                    PropertyChanged?.Invoke(this, new(nameof(FileSystem)));
                }
                else
                {
                    CreatorNode? dirNode = FileSystem.FindNode(info.DirectoryName);
                    if (dirNode != null)
                    {
                        dirNode.SubNodes.Add(new CreatorNode(info.Name, e.FullPath, !isDir));
                        dirNode.SubNodes.NaturalSort();
                    }
                }
            }
            
            Debug.WriteLine($"Created: {e.FullPath}");
        }
        private void OnDeleted(object sender, FileSystemEventArgs e)
        {
            if (e.ChangeType != WatcherChangeTypes.Deleted) return;
            CreatorNode? node = FileSystem.FindNode(e.FullPath);
            if (node != null)
            {
                if (FileSystem.Contains(node))
                {
                    FileSystem.Remove(node);
                    PropertyChanged?.Invoke(this, new(nameof(FileSystem)));
                }
                else
                {
                    CreatorNode? oldParent = FileSystem.FindParent(node);
                    if (oldParent != null)
                    {
                        oldParent.SubNodes.Remove(node);
                        return;
                    }
                }
            }
        }
        private void OnReanmed(object sender, RenamedEventArgs e)
        {
            if (e.ChangeType != WatcherChangeTypes.Renamed) return;
            CreatorNode? node = FileSystem.FindNode(e.OldFullPath);
            if (node != null)
            {
                FileInfo info = new FileInfo(e.FullPath);
                node.FullPath = e.FullPath;
                node.NodeText = info.Name;
                node.TriggerRename();

                CreatorNode? oldParent = FileSystem.FindParent(node);
                if (oldParent != null)
                {
                    oldParent.SubNodes.NaturalSort();
                }
                else
                {
                    FileSystem.NaturalSort();
                }
                PropertyChanged?.Invoke(this, new(nameof(FileSystem)));
                // TODO: sort 
            }

        }
        private void OnError(object sender, ErrorEventArgs e)
        {
            PrintException(e.GetException());
        }


        private static void PrintException(Exception? ex)
        {
            if (ex != null)
            {
                Debug.WriteLine($"Message: {ex.Message}");
                Debug.WriteLine("Stacktrace:");
                Debug.WriteLine(ex.StackTrace);
                Debug.WriteLine("");
                PrintException(ex.InnerException);
            }
        }


        public void Trigger(string prop_name)
        {
            PropertyChanged?.Invoke(this, new(prop_name));
        }


        public void TriggerEditorEventCheck()
        {
            this.Trigger("CanCut");
            this.Trigger("CanCopy");
            this.Trigger("CanPaste");
        }


        #endregion
    }


    public class ExRoutedEventArgs : RoutedEventArgs
    {
        public string Extra { get; set; }

        public ExRoutedEventArgs(string extra) : base()
        {
            Extra = extra;
        }
    }
}
