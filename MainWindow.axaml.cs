using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Generators;
using Avalonia.Controls.Presenters;
using Avalonia.Input;
using Avalonia.Interactivity;
using Avalonia.Media;
using Avalonia.Media.Imaging;
using Avalonia.Threading;
using AvaloniaEdit;
using AvaloniaEdit.CodeCompletion;
using AvaloniaEdit.Document;
using AvaloniaEdit.Editing;
using AvaloniaEdit.TextMate;
using HarfBuzzSharp;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Threading;
using TextMateSharp.Grammars;
using XentuCreator.Classes;
using XentuCreator.Dialogs;
using XentuCreator.Helpers;
using XentuCreator.UserControls;

namespace XentuCreator
{
    public partial class MainWindow : Window
    {
        // constants.
        readonly string[] _editable_extensions = { ".js", ".json", ".lua", ".py", ".xml", ".txt", ".shader", ".xsf" };
        readonly ElementGenerator _generator = new();
        readonly TextMate.Installation _textMateInstallation;
        readonly RegistryOptions _registryOptions;
        readonly Thread _uiTimerThread;
        readonly Grid _ssPaneGrid;

        private CustomCompletionWindow? _completionWindow;
        private CustomOverloadInsightWindow? _insightWindow;
        private int _currentTheme = (int)ThemeName.Monokai;
        private bool _closed = false;
        private bool _editorShown = false;
        private bool _trackingConsole = false; // set to true if the console should auto scroll.
        WindowState _prevWindowState = WindowState.Normal;

        // controls.
        readonly Grid _mainGrid, _mainPane;
        readonly TextEditor _textEditor;
        readonly TabControl _tabControl1;
        readonly WelcomeControl _welcomePane;
        readonly TreeView _folderView;
        readonly CreatorTab _welcomeTab;
        readonly TextBlock _statusTextCaps, _statusPosText, _rootLabel;
        readonly TerminalControl _textLog;

        // active state.
        internal MainViewModel _mainView;
        internal static MainWindow? _self;
        internal static XentuCodeCompletion? _codeCompletion;


        public MainWindow()
        {
            InitializeComponent();
            _self = this;
            _ssPaneGrid = this.FindControl<Grid>("SsPaneGrid");
            _textEditor = this.FindControl<TextEditor>("Editor");

            DataContext = _mainView = new(this, _textEditor);

            // cache fonts.
            CacheFontFromControl("FF_Consolas", "Consolas");
            CacheFontFromControl("FF_JetBrainsMonoRegular", "JetBrains Mono (Regular)");
            CacheFontFromControl("FF_JetBrainsMonoMedium", "JetBrains Mono (Medium)");
            CacheFontFromControl("FF_UbuntuMonoRegular", "Ubuntu Mono (Regular)");
            CacheFontFromControl("FF_UbuntuMonoBold", "Ubuntu Mono (Bold)");

            // main controls.
            _mainGrid = this.FindControl<Grid>("MainGrid");
            _mainPane = this.FindControl<Grid>("MainPane");
            _statusTextCaps = this.Find<TextBlock>("StatusCapsText");
            _statusPosText = this.Find<TextBlock>("StatusPosText");
            _rootLabel = this.Find<TextBlock>("RootLabel");
            _textLog = this.Find<TerminalControl>("TextLog");

            _textEditor.Background = Brushes.Black;
            _textEditor.ShowLineNumbers = true;
            _textEditor.Options.ShowBoxForControlCharacters = true;
            _textEditor.TextArea.IndentationStrategy = new AvaloniaEdit.Indentation.CSharp.CSharpIndentationStrategy(_textEditor.Options);
            _textEditor.TextArea.Caret.PositionChanged += Caret_PositionChanged;
            _textEditor.TextArea.RightClickMovesCaret = true;
            _textEditor.TextArea.TextView.ElementGenerators.Add(_generator);
            _textEditor.TextArea.TextEntering += CodeComplete_TextEntering;
            _textEditor.TextArea.TextEntered += CodeComplete_TextEntered;
            _textEditor.TextArea.TextInput += TextArea_TextInput;
            _textEditor.TextChanged += EditorTextChanged;
            _textEditor.PointerReleased += Editor_PointerReleased;
            _registryOptions = new RegistryOptions(App.Config == null ? ThemeName.DarkPlus : (ThemeName)App.Config.CodeTheme);
            _textMateInstallation = _textEditor.InstallTextMate(_registryOptions);

            // tabs control.
            _tabControl1 = this.FindControl<TabControl>("TabControl1");
            _tabControl1.DataContext = _mainView.OpenTabs;
            _tabControl1.SelectionChanged += TabSelectionChanged;

            // welcome pane/tab
            _welcomePane = this.FindControl<WelcomeControl>("WelcomePane");
            _welcomeTab = new(_mainView, CreatorTabType.Welcome, _registryOptions, "", "")
            {
                IsWelcomeTab = true,
                CloseButHidden = true
            };
            //_mainView.OpenTabs.Add(_welcomeTab);
            _welcomePane.NewClicked += delegate(object? s, RoutedEventArgs e) { MenuNewGame_Click(s, e); };
            _welcomePane.OpenClicked += delegate (object? s, RoutedEventArgs e) { MenuOpenGame_Click(s, e); };
            _welcomePane.OpenRecentClicked += delegate (object? s, OpenRecentEventArgs e)
            {
                CreatorProject? existingPrj = CreatorProject.Load(e.Data.Path);
                SetProject(existingPrj);
                if (App.Config != null && existingPrj != null)
                {
                    App.Config.AddRecent(existingPrj);
                }
            };

            

            _folderView = this.FindControl<TreeView>("FolderView");
            _folderView.SelectionChanged += FolderViewSelectionChanged;
            _folderView.DoubleTapped += FolderViewDoubleTapped;
            _folderView.PointerReleased += FolderView_PointerReleased;
            if (_folderView.ContextMenu != null)
            {
                _folderView.ContextMenu.DataContext = _mainView;
            }

            _mainView.PropertyChanged += delegate(object? sender, PropertyChangedEventArgs e) {
                if (e.PropertyName == "FileSystem")
                {
                    Dispatcher.UIThread.InvokeAsync(delegate {
                        _folderView.DataContext = null;
                        _folderView.DataContext = _mainView.FileSystem;
                    });
                }
                else if (e.PropertyName == "ShowSidebar")
                {
                    _mainGrid.ColumnDefinitions[0].MaxWidth = _mainView.ShowSidebar ? 9999 : 0;
                }
                else if (e.PropertyName == "ShowConsole")
                {
                    _mainPane.RowDefinitions[1].MaxHeight = _mainView.ShowConsole ? 9999 : 0;
                    _textLog.IsVisible = _mainView.ShowConsole;
                }
            };

            // default console visibility.
            _mainView.ShowConsole = false;

            SetLeftMarginPadding(10);

            _uiTimerThread = new Thread(CodeComplete_TimerCallback);
            _uiTimerThread.Start();

            this.AddHandler(PointerWheelChangedEvent, (o, i) =>
            {
                if (i.KeyModifiers != KeyModifiers.Control) return;
                if (i.Delta.Y > 0) _textEditor.FontSize++;
                else _textEditor.FontSize = _textEditor.FontSize > 1 ? _textEditor.FontSize - 1 : 1;
            }, RoutingStrategies.Bubble, true);


            // apply options from config.
            _codeCompletion = new();
            ApplyConfigChanges();

            // detect caps lock change.
            _self.KeyUp += delegate (object? sender, KeyEventArgs e)
            {
                if (e.Key == Key.CapsLock) _statusTextCaps.Opacity = _statusTextCaps.Opacity == 0 ? 1 : 0;
            };
        }

        private void WindowClosing(object? sender, CancelEventArgs e) => _closed = true;


        #region Functions

        private void CacheFontFromControl(string controlName, string fallbackName)
        {
            ComboBoxItem ctl = this.FindControl<ComboBoxItem>(controlName);
            App.Fonts.Add(ctl.Content.ToString() ?? fallbackName, ctl.FontFamily);
        }

        private void ApplyConfigChanges()
        {
            _textMateInstallation.SetTheme(_registryOptions.LoadTheme((ThemeName)App.Config.CodeTheme));
            _textEditor.FontFamily = App.Fonts[App.Config.CodeFont];
            _textEditor.FontSize = App.Config.FontSize;
            _textEditor.ShowLineNumbers = App.Config.EnableLineNumbers;
            _textLog.FontFamily = App.Fonts[App.Config.CodeFont];
        }

        private void SetLeftMarginPadding(int margin)
        {
            var m = _textEditor.TextArea.LeftMargins;
            if (m.Count > 1)
            {
                var l = m[1] as Avalonia.Controls.Shapes.Line;
                if (l != null)
                {
                    l.Margin = new(5, 0, margin, 0);
                }
            }
        }

        /// <summary>
        /// Set the project to open. If null, then assumes we are closing not
        /// opening a project.
        /// </summary>
        /// <param name="project">The project object or null.</param>
        private void SetProject(CreatorProject? project)
        {
            if (_mainView == null || _welcomePane == null || _welcomePane.DataView == null) throw new NullReferenceException("WelcomePane is missing when calling SetProject");

            _mainView.Project = project;
            _mainView.Loaded = false;
            _mainView.FileSystem.Clear();
            _mainView.SetupWatcher(null);
            _folderView.DataContext = null;
            _mainView.OpenTabs.Clear();
            //_mainView.OpenTabs.Add(_welcomeTab);
            _welcomePane.IsVisible = true;
            _textEditor.IsVisible = false;
            _textEditor.Text = "";
            _ssPaneGrid.Children.Clear();
            this.Title = "Xentu Creator";
            _mainView.Events.AddLine("Ready");

            if (project != null)
            {
                string? dir = project.LoadedFileInfo?.DirectoryName;
                string? file = project.LoadedFileInfo?.FullName;
                if (dir != null && file != null)
                {
                    // todo: use system directory separator.
                    _folderView.DataContext = _mainView.FileSystem = CreatorNode.ListDirectory(dir, $"{dir}\\game.json");
                }
                _mainView.SetupWatcher(dir);
                _mainView.Loaded = true;
                _rootLabel.Text = project.Game.title;
                _welcomePane.DataView.ShowButtons = false;
                this.Title = $"{project.Game.title} - Xentu Creator";
                _welcomePane.IsVisible = false;
            }
            else
            {
                _welcomePane.DataView.ShowButtons = true;
                RootLabel.Text = "";
            }
        }

        private static TreeViewItem? FindTvItem(ITreeItemContainerGenerator root, object item)
        {
            foreach (var entry in root.Containers)
            {
                if (entry.ContainerControl is TreeViewItem tvi)
                {
                    if (item == entry.Item) return tvi;
                    if (tvi.ItemContainerGenerator != null)
                    {
                        TreeViewItem? sTvi = FindTvItem(tvi.ItemContainerGenerator, item);
                        if (sTvi != null) return sTvi;
                    }
                }
            }
            return null;
        }

        private bool IsEditorOpen(string fullPath)
        {
            return _mainView.OpenTabs.Any(t => t.FilePath?.Contains(fullPath) ?? false);
        }

        internal static void SetLanguage(string languageCode) => SetLanguage(CultureInfo.GetCultureInfo(languageCode));

        internal static void SetLanguage(CultureInfo culture) => Thread.CurrentThread.CurrentUICulture = culture;


        Process? compiler;


        internal async void BeginDebugging()
        {
            if (App.Config != null && !string.IsNullOrWhiteSpace(_mainView.Project?.LoadedFileInfo?.DirectoryName))
            {
                if (string.IsNullOrWhiteSpace(App.Config.DebugBinary) || !File.Exists(App.Config.DebugBinary))
                {
                    await MessageBox.Show(this, "Error, in order to debug, you need to tell Xentu Creator " +
                                                "where the engine binary is. The next screen will allow you " +
                                                "to do so.");
                    MenuOptions_Click(this, new());
                    return;
                }

                compiler = new();
                string dir = _mainView.Project.LoadedFileInfo.DirectoryName + "\\";
                if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                {
                    dir = dir.Replace("\\", "/");
                }

                _mainView.ShowConsole = true;
                _trackingConsole = true;
                compiler.StartInfo.WorkingDirectory = dir;
                compiler.StartInfo.FileName = App.Config.DebugBinary;
                compiler.StartInfo.ErrorDialog = true;
                compiler.StartInfo.UseShellExecute = false;
                compiler.StartInfo.CreateNoWindow = true;
                compiler.StartInfo.RedirectStandardOutput = true;
                compiler.StartInfo.RedirectStandardError = true;
                compiler.EnableRaisingEvents = true;
                compiler.OutputDataReceived += Compiler_OutputDataReceived;
                compiler.ErrorDataReceived += Compiler_ErrorDataReceived;
                compiler.Exited += Compiler_Exited;
                compiler.Start();
                compiler.BeginOutputReadLine();
                compiler.BeginErrorReadLine();
            }
        }

        private void Compiler_Exited(object? sender, EventArgs e)
        {
            if (compiler != null)
            {
                compiler.OutputDataReceived -= Compiler_OutputDataReceived;
                compiler.ErrorDataReceived -= Compiler_ErrorDataReceived;
                compiler.Exited -= Compiler_Exited;
                compiler = null;
                _trackingConsole = false;
                Dispatcher.UIThread.InvokeAsync(delegate ()
                {
                    _textLog.ScrollToBottom(); //.ScrollIntoView(_textLog.ItemCount - 2);
                });
            }
        }

        private void Compiler_ErrorDataReceived(object sender, DataReceivedEventArgs e)
        {
            if (e.Data != null)
            {
                _mainView.Events.AddLine(e.Data);
                Dispatcher.UIThread.InvokeAsync(delegate()
                {
                    _textLog.ScrollToBottom(); //.ScrollIntoView(_textLog.ItemCount - 2);
                });
            }
        }

        private void Compiler_OutputDataReceived(object sender, DataReceivedEventArgs e)
        {
            if (e.Data != null)
            {
                _mainView.Events.AddLine(e.Data);
                Dispatcher.UIThread.InvokeAsync(delegate ()
                {
                    _textLog.ScrollToBottom(); //ScrollIntoView(_textLog.ItemCount - 2);
                });
            }
        }

        internal async void BeginDebuggingRelease()
        {
            if (App.Config != null && !string.IsNullOrWhiteSpace(_mainView.Project?.LoadedFileInfo?.DirectoryName))
            {
                if (string.IsNullOrWhiteSpace(App.Config.DebugBinary) || !File.Exists(App.Config.DebugBinary))
                {
                    await MessageBox.Show(this, "Error, in order to debug, you need to tell Xentu Creator " +
                                                "where the engine binary is. The next screen will allow you " +
                                                "to do so.");
                    MenuOptions_Click(this, new());
                    return;
                }

                _mainView.ShowConsole = true;
                using Process compiler = new();
                string dir = _mainView.Project.LoadedFileInfo.DirectoryName + "\\";
                compiler.StartInfo.WorkingDirectory = dir;
                compiler.StartInfo.FileName = App.Config.DebugBinary.Replace("_debug", "");
                compiler.StartInfo.ErrorDialog = true;
                compiler.StartInfo.UseShellExecute = true;
                compiler.Start();
                await compiler.WaitForExitAsync();
            }
        }

        #endregion


        #region File Browser Events

        private void FolderViewSelectionChanged(object? sender, SelectionChangedEventArgs e)
        {
            if (e.AddedItems[0] is CreatorNode node && node.IsFile)
            {
                CreatorTab? existingTab = _mainView.OpenTabs.FirstOrDefault(t => t.FilePath == node.FullPath);
                if (existingTab != null)
                {
                    _tabControl1.SelectedItem = existingTab;
                }
            }
            _mainView.SelectedTreeItemChanged();
        }

        private void FolderViewDoubleTapped(object? sender, RoutedEventArgs e)
        {
            e.Handled = true;
            if (e.Source is TextBlock tb && tb.Classes.Contains("TvHeader"))
            {
                if (tb.DataContext is CreatorNode node)
                {
                    if (node.IsFile == false)
                    {
                        var item = FindTvItem(_folderView.ItemContainerGenerator, node);
                        if (item != null)
                        {
                            item.IsExpanded = !item.IsExpanded;
                        }
                    }
                    else
                    {
                        CreatorTab? existingTab = _mainView.OpenTabs.FirstOrDefault(t => t.FilePath == node.FullPath);
                        if (existingTab != null)
                        {
                            _tabControl1.SelectedItem = existingTab;
                        }
                        else
                        {
                            FileInfo info = new(node.FullPath);
                            if (_editable_extensions.Contains(info.Extension))
                            {
                                CreatorTab tab = CreatorTab.LoadFile(_mainView, _registryOptions, node.FullPath);
                                _mainView.OpenTabs.Add(tab);
                                _tabControl1.SelectedItem = tab;

                                if (!_editorShown)
                                {
                                    _editorShown = true;
                                    if (App.Config != null)
                                    {
                                        _textEditor.FontFamily = App.Fonts[App.Config.CodeFont];
                                        _textEditor.FontSize = App.Config.FontSize;
                                        _textEditor.ShowLineNumbers = App.Config.EnableLineNumbers;
                                    }
                                }
                            }
                            else
                            {
                                MessageBox.Show(this,
                                    "This file can not be edited by XentuCreator, however you can specify which editor " +
                                    "to use when double-clicking a file in the settings.", "Unspported File Type.",
                                    MessageBoxButtons.Ok);
                            }
                        }
                    }
                }
            }
        }

        private void FolderView_PointerReleased(object? sender, PointerReleasedEventArgs e)
        {
            if (sender is TreeView tv && e.Source is ScrollContentPresenter)
            {
                tv.UnselectAll();
                _mainView.SelectedTreeItemChanged();
            }
        }

        private void FolderView_CreateFile(object? sender, RoutedEventArgs e)
        {
            string? basePath = _mainView.Project?.LoadedFileInfo?.DirectoryName;
            string? path = basePath;
            if (FolderView.SelectedItem is CreatorNode node)
            {
                if (node.IsFile)
                {
                    CreatorNode? parent = _mainView.FileSystem.FindParent(node);
                    if (parent != null)
                    {
                        path = parent.FullPath;
                    }
                }
                else
                {
                    path = node.FullPath;
                }
            }

            if (path != null && basePath != null) {
                string relPath = path[basePath.Length..];
                NewFileDialog.Show(this, relPath, basePath);
            }            
        }

        private void FolderView_CreateFolder(object? sender, RoutedEventArgs e)
        {
            string? basePath = _mainView.Project?.LoadedFileInfo?.DirectoryName;
            string? path = basePath;
            if (FolderView.SelectedItem is CreatorNode node)
            {
                if (node.IsFile)
                {
                    CreatorNode? parent = _mainView.FileSystem.FindParent(node);
                    if (parent != null)
                    {
                        path = parent.FullPath;
                    }
                }
                else
                {
                    path = node.FullPath;
                }
            }

            if (path != null && basePath != null)
            {
                string relPath = path[basePath.Length..];
                NewFileDialog.Show(this, relPath, basePath, true);
            }
        }

        private async void FolderView_Rename(object? sender, RoutedEventArgs e)
        {
            if (FolderView.SelectedItem is CreatorNode node)
            {
                if (node.IsFile)
                {
                    FileInfo fileInfo = new(node.FullPath);
                renameFile:;
                    string? newFileName = await TextBoxDialog.Show(this, node.NodeText);
                    if (newFileName != null && fileInfo.DirectoryName != null)
                    {
                        string newFilePath = fileInfo.DirectoryName + Path.DirectorySeparatorChar + newFileName;
                        if (File.Exists(newFilePath))
                        {
                            await MessageBox.Show(this, "New name already exists, please choose another!", "Rename");
                            goto renameFile;
                        }
                        File.Move(node.FullPath, newFilePath);
                    }
                }
                else
                {
                    DirectoryInfo dirInfo = new(node.FullPath);
                renameDir:;
                    string? newFolderName = await TextBoxDialog.Show(this, node.NodeText);
                    if (newFolderName != null && dirInfo.Parent != null)
                    {
                        string newFolderPath = dirInfo.Parent.FullName + Path.DirectorySeparatorChar + newFolderName;
                        if (Directory.Exists(newFolderPath))
                        {
                            await MessageBox.Show(this, "New name already exists, please choose another!", "Rename");
                            goto renameDir;
                        }
                        Directory.Move(node.FullPath, newFolderPath);
                    }
                }
            }
        }

        private async void FolderView_Delete(object? sender, RoutedEventArgs e)
        {
            if (FolderView.SelectedItem is CreatorNode node)
            {
                MessageBoxResult res = await MessageBox.Show(this, "Are you sure?", "Delete", MessageBoxButtons.OkCancel);
                if (res == MessageBoxResult.Cancel) return;

                if (node.IsFile)
                {
                    File.Delete(node.FullPath);
                }
                else
                {
                    string[] files = Directory.GetFiles(node.FullPath, "*.*", SearchOption.AllDirectories);
                    if (files != null && files.Length > 0)
                    {
                        await MessageBox.Show(this, "This folder is not empty, please empty it before attempting to remove.");
                        return;
                    }
                    Directory.Delete(node.FullPath);
                }

            }
        }

        #endregion


        #region Tab Events

        private void TabSelectionChanged(object? sender, SelectionChangedEventArgs e)
        {
            CreatorTab? tab = e.AddedItems.Count > 0 ? e.AddedItems[0] as CreatorTab : null;
            if (tab != null)
            {
                _textMateInstallation.SetGrammar(null);
                _ssPaneGrid.Children.Clear();
                //_textEditor.Document = null;
                if (tab.TabType == CreatorTabType.Editor)
                {
                    _textEditor.Document = tab.Document;
                    _textEditor.IsVisible = true;
                    _textMateInstallation.SetGrammar(tab.LanguageScope);
                    _welcomePane.IsVisible = false;
                    //_spriteSheetPane.IsVisible = false;
                }
                else if (tab.TabType == CreatorTabType.SpriteSheetEditor)
                {
                    _textEditor.IsVisible = false;
                    _welcomePane.IsVisible = false;
                    _ssPaneGrid.Children.Add(tab.SpriteSheetPane);
                    //_spriteSheetPane.IsVisible = true;
                }
                else if (tab.TabType == CreatorTabType.Welcome)
                {
                    _textEditor.IsVisible = false;
                    _welcomePane.IsVisible = true;
                    //_spriteSheetPane.IsVisible = false;
                }
            }
            _mainView.SelectedTab = tab;
            _mainView.Trigger("CanSave");
            _mainView.Trigger("CanSaveAll");

            if (_mainView.OpenTabs.Count == 0)
            {
                _textEditor.IsVisible = false;
                _textEditor.Text = "";
                _ssPaneGrid.Children.Clear();
            }
        }

        private async void TabCloseClicked(object? sender, PointerReleasedEventArgs e)
        {
            e.Handled = true;
            if (e.Source is TextBlock tb && tb.Classes.Contains("CloseBut"))
            {
                if (tb.DataContext is CreatorTab tab)
                {
                    if (tab.TabType == CreatorTabType.Editor)
                    {
                        if (tab.HasChanged)
                        {
                            MessageBoxResult confirm = await MessageBox.Show(this, "Save changes before you close?", "Close Editor", MessageBoxButtons.YesNoCancel);
                            if (confirm == MessageBoxResult.Yes)
                            {
                                string? file = tab.FilePath;
                                if (file != null)
                                {
                                    using FileStream fs = File.Create(file);
                                    {
                                        Editor.Save(fs);
                                    }
                                    tab.HasChanged = false;
                                }
                            }
                            else if (confirm == MessageBoxResult.Cancel)
                            {
                                return;
                            }
                        }
                        _mainView.OpenTabs.Remove(tab);
                    }
                    else if (tab.TabType == CreatorTabType.SpriteSheetEditor)
                    {
                        if (tab.HasChanged && tab.SpriteSheetPane != null)
                        {
                            string? file = tab.FilePath;
                            if (file != null)
                            {
                                await tab.SpriteSheetPane.Save(file);
                                tab.HasChanged = false;
                            }
                        }
                        _mainView.OpenTabs.Remove(tab);
                    }
                }
            }
        }

        #endregion


        #region Editor Events

        private void EditorTextChanged(object? sender, EventArgs e)
        {
            if (_mainView.SelectedTab != null && _mainView.SelectedTab.TabType == CreatorTabType.Editor)
            {
                if (!_mainView.SelectedTab.HasChanged && _mainView.SelectedTab.Document?.IsInUpdate == true)
                {
                    _mainView.SelectedTab.HasChanged = true;
                    _mainView.TriggerEditorEventCheck();
                }
            }
        }

        private void Editor_PointerReleased(object? sender, PointerReleasedEventArgs e)
        {
            _mainView?.TriggerEditorEventCheck();
        }

        private void Caret_PositionChanged(object? sender, EventArgs e)
        {
            _statusPosText.Text = string.Format("Line {0}, {1}",
                _textEditor.TextArea.Caret.Line,
                _textEditor.TextArea.Caret.Column);
            _mainView.TriggerEditorEventCheck();
            
        }

        #endregion


        #region Menu

        internal async void MenuNewGame_Click(object? sender, RoutedEventArgs e)
        {
            string? gamePath = await NewGameDialog.Show(this);
            if (gamePath != null)
            {
                CreatorProject? existingPrj = CreatorProject.Load(gamePath);
                SetProject(existingPrj);
            }
        }

        internal async void MenuOpenGame_Click(object? sender, RoutedEventArgs e)
        {
            OpenFileDialog dlg = new()
            {
                InitialFileName = "game.json",
                AllowMultiple = false,
                Filters = new()
            };
            dlg.Filters.Add(new() { Name = "Game Project", Extensions = { "json" } });
            string[]? result = await dlg.ShowAsync(this);

            if (result != null && result.Length > 0)
            {
                string gamePath = result[0];
                if (!File.Exists(gamePath))
                {
                    string msg = "Error, the folder you selected does not contain a game.json file. If you continue, Xentu Creator will prompt you to creat one.";
                    if (await MessageBox.Show(this, msg, "Open Project...", MessageBoxButtons.OkCancel) == MessageBoxResult.Cancel) return;


                    // TODO: create game.json and set project.
                }
                else
                {
                    CreatorProject? existingPrj = CreatorProject.Load(gamePath);
                    SetProject(existingPrj);
                    if (App.Config != null && existingPrj != null)
                    {
                        App.Config.AddRecent(existingPrj);
                    }
                }
            }
        }

        internal async void MenuCloseGame_Click(object? sender, RoutedEventArgs e)
        {
            if (_mainView.OpenTabs.Any(t => t.HasChanged))
            {
                MessageBoxResult confirm = await MessageBox.Show(this, "You have unsaved work, save before closing?", "Close", MessageBoxButtons.YesNoCancel);
                if (confirm == MessageBoxResult.Yes)
                {
                    MenuSaveAll_Click(sender, e);
                }
                else if (confirm == MessageBoxResult.Cancel)
                {
                    return;
                }
            }
            SetProject(null);
        }

        internal async void MenuSave_Click(object? sender, RoutedEventArgs e)
        {
            CreatorTab? tab = _mainView?.SelectedTab;
            if (tab != null)
            {
                if (tab.TabType == CreatorTabType.Editor)
                {
                    string? file = tab.FilePath;
                    if (file != null)
                    {
                        using FileStream fs = File.Create(file);
                        {
                            Editor.Save(fs);
                        }
                        tab.HasChanged = false;
                    }
                }
                else if (tab.TabType == CreatorTabType.SpriteSheetEditor)
                {
                    string? file = tab.FilePath;
                    if (file != null && tab.SpriteSheetPane != null)
                    {
                        await tab.SpriteSheetPane.Save(file);
                        tab.HasChanged = false;
                    }
                }
            }
                
                
        }

        internal async void MenuSaveAll_Click(object? sender, RoutedEventArgs e)
        {
            foreach (CreatorTab tab in _mainView.OpenTabs)
            {
                if (tab.TabType == CreatorTabType.Editor && tab.HasChanged)
                {
                    string? file = tab.FilePath;
                    if (file != null)
                    {
                        using FileStream fs = File.Create(file);
                        {
                            Editor.Save(fs);
                        }
                        tab.HasChanged = false;
                    }
                }
                else if (tab.TabType == CreatorTabType.SpriteSheetEditor && tab.HasChanged)
                {
                    string? file = tab.FilePath;
                    if (file != null && tab.SpriteSheetPane != null)
                    {
                        await tab.SpriteSheetPane.Save(file);
                        tab.HasChanged = false;
                    }
                }
            }
        }

        internal async void MenuGameProperties_Click(object? sender, RoutedEventArgs e)
        {
            XentuConfigGameContainer? config;

            if (_mainView.Project?.LoadedFileInfo?.DirectoryName != null)
            {
                string dirName = _mainView.Project.LoadedFileInfo.DirectoryName;
                string fileName = $"{dirName}\\game.json";

                if (IsEditorOpen(fileName))
                {
                    await MessageBox.Show(this, "game.json is open, please close it before you launch the game properties dialog.");
                    return;
                }

                if (!File.Exists(fileName))
                {
                    var promptRes = await MessageBox.Show(this, "The game.json file appears to be missing, create a new one?", "Game Properties.", MessageBoxButtons.OkCancel);
                    if (promptRes == MessageBoxResult.Cancel) return;
                    try
                    {
                        config = new XentuConfigGameContainer()
                        {
                            Game = XentuConfigGame.CreateDefault()
                        };

                        bool? res = await GamePropertiesDialog.Show(this, config);
                        if (res != null & res == true)
                        {
                            config.Save(fileName);
                            RootLabel.Text = config.Game.title;
                        }
                    }
                    catch (Exception ex)
                    {
                        await MessageBox.Show(this, $"Error, something went wrong when creating a new game.json file:\n\n{ex.Message}\n\n{ex.StackTrace}", "Game Properties");
                    }
                }
                else
                {
                    try
                    {
                        config = XentuConfigGameContainer.Load(fileName);
                        bool? res = await GamePropertiesDialog.Show(this, config ?? new());
                        if (res != null & res == true && config != null)
                        {
                            config.Save(fileName);
                            RootLabel.Text = config.Game.title;
                        }
                    }
                    catch (Exception ex)
                    {
                        await MessageBox.Show(this, $"Error, something went wrong when working with an existing game.json file:\n\n{ex.Message}\n\n{ex.StackTrace}", "Game Properties");
                    }

                }
            }
        }

        internal void RvealInFileExplorer()
        {
            if (_mainView.Project.LoadedFileInfo.DirectoryName == null) return;
            Process.Start("explorer.exe", @_mainView.Project.LoadedFileInfo.DirectoryName);
        }

        internal async void MenuPublish_Click(object? sender, RoutedEventArgs e)
        {
            await MessageBox.Show(this, "Not yet implemented");
        }

        internal void MenuExit_Click(object? sender, RoutedEventArgs e) => Close();

        internal void MenuEditCut_Click(object? sender, RoutedEventArgs e)
        {
            _textEditor?.Cut();
            _mainView.TriggerEditorEventCheck();
        }

        internal void MenuEditCopy_Click(object? sender, RoutedEventArgs e)
        {
            _textEditor?.Copy();
            _mainView.TriggerEditorEventCheck();
        }

        internal void MenuEditPaste_Click(object? sender, RoutedEventArgs e)
        {
            _textEditor?.Paste();
            _mainView.TriggerEditorEventCheck();
        }

        internal void MenuEditDelete_Click(object? sender, RoutedEventArgs e)
        {
            _textEditor?.Delete();
            _mainView.TriggerEditorEventCheck();
        }

        internal void MenuEditSelectAll_Click(object? sender, RoutedEventArgs e)
        {
            _textEditor?.SelectAll();
            _mainView.TriggerEditorEventCheck();
        }

        internal void MenuPlay_Click(object? sender, RoutedEventArgs e) => BeginDebugging();

        internal void MenuPlayRelease_Click(object? sender, RoutedEventArgs e) => BeginDebuggingRelease();

        internal void MenuToggleFullScreen_Click(object? sender, RoutedEventArgs e)
        {
            #pragma warning disable CS0618 // Type or member is obsolete
            if (HasSystemDecorations)
            {
                HasSystemDecorations = false;
                _prevWindowState = WindowState;
                WindowState = WindowState.FullScreen;
            }
            else
            {
                HasSystemDecorations = true;
                WindowState = _prevWindowState;
            }
            #pragma warning restore CS0618 // Type or member is obsolete
        }

        internal async void MenuOptions_Click(object? sender, RoutedEventArgs e)
        {
            if (e is ExRoutedEventArgs eEx)
            {
                await OptionsDialog.Show(this, eEx.Extra);
                if (App.Config != null) ApplyConfigChanges();
            }
            else
            {
                await OptionsDialog.Show(this);
                if (App.Config != null) ApplyConfigChanges();
            }
        }

        internal void MenuAbout_Click(object? sender, RoutedEventArgs e) => BrowserHelper.OpenBrowser("https://xentu.net");

        #endregion


        #region Code Complettion

        private void TextArea_TextInput(object? sender, TextInputEventArgs e)
        {
            if (_completionWindow != null)
            {
                _completionWindow.FixPosition();
            }
        }

        private void CodeComplete_TimerCallback(object? o)
        {
            while (_closed == false)
            {
                if (_completionWindow != null)
                {
                    Dispatcher.UIThread.InvokeAsync((Action)delegate
                    {
                        _completionWindow?.FixPosition();
                    });
                }
                if (_insightWindow != null)
                {
                    Dispatcher.UIThread.InvokeAsync((Action)delegate
                    {
                        _insightWindow?.FixPosition();
                    });
                }

                if (_trackingConsole)
                {
                    Dispatcher.UIThread.InvokeAsync((Action)delegate
                    {
                        if (_textLog != null)
                        {
                            _textLog.ScrollToBottom(); //.ScrollIntoView(_textLog.ItemCount - 2);
                            //int pos = _textLog.Text.LastIndexOf("\n");
                            //if (pos > 0) _textLog.CaretIndex = pos + 1;
                        }
                    });
                }

                Thread.Sleep(50);
            }
        }

        private void CodeComplete_TextEntering(object? sender, TextInputEventArgs e)
        {
            if (e.Text?.Length > 0 && _completionWindow != null)
            {
                if (!char.IsLetterOrDigit(e.Text[0]))
                {
                    _completionWindow.CompletionList.RequestInsertion(e);
                }
            }

            _insightWindow?.Hide();
        }

        private void CodeComplete_TextEntered(object? sender, TextInputEventArgs e)
        {
            if (!App.Config.EnableCodeCompletion || _codeCompletion == null) return;

            if (e.Text == ".")
            {
                /* _completionWindow = new(_textEditor.TextArea) { PlacementAnchor = PopupAnchor.TopLeft };
                _completionWindow.Closed += delegate { _completionWindow = null; };
                ToolTip.SetShowDelay(_completionWindow, 1);
                _codeCompletion.SetupCompletion(CodeComplete_GetTextBeforeCursor(), _completionWindow);
                _completionWindow.Show(); */
            }
            else if (e.Text == "(")
            {
                _insightWindow = new CustomOverloadInsightWindow(_textEditor.TextArea);
                _insightWindow.Closed += (o, args) => _insightWindow = null;
                _codeCompletion.SetupInsight(CodeComplete_GetTextBeforeCursor(), _insightWindow);
                _insightWindow.Show();
            }
        }

        /// <summary>
        /// Based on the selection cursor, returns all text before the first encountered space, or the beginning of the buffer.
        /// </summary>
        private string CodeComplete_GetTextBeforeCursor()
        {
            if (_textEditor.TextArea == null || _textEditor.TextArea.Caret == null || _textEditor.TextArea.Document == null) return "";
            int row = _textEditor.TextArea.Caret.Line;
            int col = _textEditor.TextArea.Caret.Offset - 1;

            if (col <= 1) return "";
            string line;
            if (row == 0)
            {
                line = _textEditor.Text[..col];
            }
            else
            {
                DocumentLine prevLineInfo = _textEditor.TextArea.Document.Lines[row - 1];

                int prevLineEnd = prevLineInfo.Offset;
                line = _textEditor.Text[prevLineEnd..col];
            }

            int lastSpace = line.LastIndexOf(' ');
            return (lastSpace >= 0) ? line[(lastSpace + 1)..] : line;
        }

        public class MyOverloadProvider : IOverloadProvider
        {
            private readonly IList<(string header, string content)> _items;
            private int _selectedIndex;

            public MyOverloadProvider(IList<(string header, string content)> items)
            {
                _items = items;
                SelectedIndex = 0;
            }

            public int SelectedIndex
            {
                get => _selectedIndex;
                set
                {
                    _selectedIndex = value;
                    OnPropertyChanged();
                    // ReSharper disable ExplicitCallerInfoArgument
                    OnPropertyChanged(nameof(CurrentHeader));
                    OnPropertyChanged(nameof(CurrentContent));
                    // ReSharper restore ExplicitCallerInfoArgument
                }
            }

            public int Count => _items.Count;
            public string? CurrentIndexText => null;
            public object CurrentHeader => _items[SelectedIndex].header;
            public object CurrentContent => _items[SelectedIndex].content;

            public event PropertyChangedEventHandler? PropertyChanged;

            private void OnPropertyChanged([CallerMemberName] string? propertyName = null)
            {
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
            }
        }

        public class MyCompletionData : ICompletionData
        {
            public MyCompletionData(string text)
            {
                Text = text;
                Content = text;
            }

            public IBitmap? Image => null;

            public string Text { get; }

            // Use this property if you want to show a fancy UIElement in the list.
            public object Content { get; }

            public object Description => "Description for " + Text;

            public double Priority { get; } = 0;

            public void Complete(TextArea textArea, ISegment completionSegment, EventArgs insertionRequestEventArgs)
            {
                textArea.Document.Replace(completionSegment, Text);
            }
        }

        public class CustomCompletionWindow : CompletionWindow
        {
            private bool _isSoftSelectionActive;
            private KeyEventArgs? _keyDownArgs;

            public CustomCompletionWindow(TextArea textArea) : base(textArea)
            {
                _isSoftSelectionActive = true;
                CompletionList.SelectionChanged += CompletionListOnSelectionChanged;
                this.GotFocus += CustomCompletionWindow_GotFocus;

                Initialize();
            }

            private void CustomCompletionWindow_GotFocus(object? sender, GotFocusEventArgs e)
            {
                FixPosition();
                IsVisible = true;
            }

            void Initialize()
            {
                CompletionList.ListBox.BorderThickness = new Thickness(1);
                CompletionList.ListBox.PointerPressed += (o, e) => _isSoftSelectionActive = false;
            }

            private void CompletionListOnSelectionChanged(object? sender, SelectionChangedEventArgs args)
            {
                if (!UseHardSelection &&
                    _isSoftSelectionActive && _keyDownArgs?.Handled != true
                    && args.AddedItems?.Count > 0)
                {
                    CompletionList.SelectedItem = null;
                }
            }

            protected override void OnKeyDown(KeyEventArgs e)
            {
                if (e.Key == Key.Home || e.Key == Key.End) return;

                _keyDownArgs = e;

                base.OnKeyDown(e);

                SetSoftSelection(e);
                FixPosition();
            }

            private void SetSoftSelection(RoutedEventArgs e)
            {
                if (e.Handled)
                {
                    _isSoftSelectionActive = false;
                }
            }

            public void FixPosition()
            {
                UpdatePosition();
            }

            protected override void DetachEvents()
            {
                // TODO: temporary workaround until SetParent(null) is removed
                var selected = CompletionList.SelectedItem;
                base.DetachEvents();
                CompletionList.SelectedItem = selected;
            }

            public bool UseHardSelection { get; set; }
        }

        public class CustomOverloadInsightWindow : OverloadInsightWindow
        {
            public CustomOverloadInsightWindow(TextArea textArea) : base(textArea) { }

            public void FixPosition()
            {
                UpdatePosition();
            }
        }

        #endregion
    }
}