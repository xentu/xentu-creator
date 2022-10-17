using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Generators;
using Avalonia.Controls.Presenters;
using Avalonia.Controls.Primitives.PopupPositioning;
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
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Threading;
using TextMateSharp.Grammars;
using XentuCreator.Dialogs;
using XentuCreator.Helpers;
using XentuCreator.Models;
using XentuCreator.UserControls;

namespace XentuCreator
{
    public partial class MainWindow : Window
    {
        // constants.
        readonly string[] _editable_extensions = { ".js", ".json", ".lua", ".py", ".xml", ".txt", ".shader" };
        readonly ElementGenerator _generator = new ElementGenerator();
        readonly TextMate.Installation _textMateInstallation;
        readonly RegistryOptions _registryOptions;
        private CustomCompletionWindow _completionWindow;
        private CustomOverloadInsightWindow _insightWindow;
        private Thread _uiTimerThread;
        private int _currentTheme = (int)ThemeName.Monokai;
        private bool _closed = false;

        // controls.
        readonly Grid _mainGrid;
        readonly TextEditor _textEditor;
        readonly TabControl _tabControl1;
        readonly WelcomeControl _welcomePane;
        readonly TreeView _folderView;
        readonly CreatorTab _welcomeTab;
        readonly TextBlock _statusTextBlock, _rootLabel;

        // active state.
        MainViewModel _mainView;
        


        public MainWindow()
        {
            InitializeComponent();
            DataContext = _mainView = new(this);

            // main controls.
            _mainGrid = this.FindControl<Grid>("MainGrid");
            _statusTextBlock = this.Find<TextBlock>("StatusText");
            _rootLabel = this.Find<TextBlock>("RootLabel");
            _textEditor = this.FindControl<TextEditor>("Editor");
            _textEditor.Background = Brushes.Black;
            _textEditor.ShowLineNumbers = true;
            _textEditor.Options.ShowBoxForControlCharacters = true;
            _textEditor.TextArea.IndentationStrategy = new AvaloniaEdit.Indentation.CSharp.CSharpIndentationStrategy(_textEditor.Options);
            _textEditor.TextArea.Caret.PositionChanged += Caret_PositionChanged;
            _textEditor.TextArea.RightClickMovesCaret = true;
            _textEditor.TextArea.TextView.ElementGenerators.Add(_generator);
            _textEditor.TextArea.TextEntering += textEditor_TextArea_TextEntering;
            _textEditor.TextArea.TextEntered += textEditor_TextArea_TextEntered;
            _textEditor.TextArea.TextInput += TextArea_TextInput;
            _textEditor.TextChanged += EditorTextChanged;
            _registryOptions = new RegistryOptions(ThemeName.DarkPlus);
            _textMateInstallation = _textEditor.InstallTextMate(_registryOptions);

            // tabs control.
            _tabControl1 = this.FindControl<TabControl>("TabControl1");
            _tabControl1.DataContext = _mainView.OpenTabs;
            _tabControl1.SelectionChanged += TabSelectionChanged;

            // welcome pane/tab
            _welcomePane = this.FindControl<WelcomeControl>("WelcomePane");
            _welcomeTab = new(_mainView, CreatorTabType.Welcome, _registryOptions, "");
            _welcomeTab.IsWelcomeTab = true;
            //"Welome!"SetValue(HeaderedContentControl.HeaderProperty, 

            _welcomeTab.CloseButHidden = true;
            _mainView.OpenTabs.Add(_welcomeTab);
            _welcomePane.NewClicked += delegate(object? s, RoutedEventArgs e) { MenuNewGame_Click(s, e); };
            _welcomePane.OpenClicked += delegate (object? s, RoutedEventArgs e) { MenuOpenGame_Click(s, e); };

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
            };

            SetLeftMarginPadding(10);

            _uiTimerThread = new Thread(TimerCallback);
            _uiTimerThread.Start();

            this.AddHandler(PointerWheelChangedEvent, (o, i) =>
            {
                if (i.KeyModifiers != KeyModifiers.Control) return;
                if (i.Delta.Y > 0) _textEditor.FontSize++;
                else _textEditor.FontSize = _textEditor.FontSize > 1 ? _textEditor.FontSize - 1 : 1;
            }, RoutingStrategies.Bubble, true);
        }


        private void WindowClosing(object? sender, CancelEventArgs e)
        {
            _closed = true;
        }


        private void TextArea_TextInput(object? sender, TextInputEventArgs e)
        {
            if (_completionWindow != null)
            {
                _completionWindow.FixPosition();
            }
        }


        void TimerCallback(object? o)
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

                Thread.Sleep(50);
            }
        }


        #region Functions

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
            _mainView.Project = project;
            _mainView.Loaded = false;
            _mainView.FileSystem.Clear();
            _mainView.SetupWatcher(null);
            _folderView.DataContext = null;
            _mainView.OpenTabs.Clear();
            _mainView.OpenTabs.Add(_welcomeTab);
            _mainGrid.ColumnDefinitions[0].MaxWidth = 0;
            this.Title = "XentuCreator";
            _statusTextBlock.Text = "Ready";

            if (project != null)
            {
                string? dir = project.LoadedFileInfo?.DirectoryName;
                string? file = project.LoadedFileInfo?.FullName;
                if (dir != null && file != null)
                {
                    _folderView.DataContext = _mainView.FileSystem = CreatorNode.ListDirectory(dir);
                    _mainGrid.ColumnDefinitions[0].MaxWidth = 9999;
                }
                _mainView.SetupWatcher(dir);
                _mainView.Loaded = true;
                _rootLabel.Text = project.Game.title;
                _welcomePane.DataView.ShowButtons = false;
                this.Title = $"{project.Game.title} - XentuCreator";
            }
            else
            {
                _welcomePane.DataView.ShowButtons = true;
            }
        }

        public static TreeViewItem? FindTvItem(ITreeItemContainerGenerator root, object item)
        {
            foreach (var entry in root.Containers)
            {
                TreeViewItem? tvi = entry.ContainerControl as TreeViewItem;
                if (tvi != null)
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

        #endregion


        #region File Browser Events

        private void FolderViewSelectionChanged(object? sender, SelectionChangedEventArgs e)
        {
            CreatorNode? node = e.AddedItems[0] as CreatorNode;
            if (node != null && node.IsFile)
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
            TextBlock? tb = e.Source as TextBlock;
            if (tb != null && tb.Classes.Contains("TvHeader"))
            {
                CreatorNode? node = tb.DataContext as CreatorNode;
                if (node != null)
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
            TreeView? tv = sender as TreeView;
            if (tv != null && e.Source is ScrollContentPresenter)
            {
                tv.UnselectAll();
                _mainView.SelectedTreeItemChanged();
            }
        }

        private void FolderView_CreateFile(object? sender, RoutedEventArgs e)
        {
            string? basePath = _mainView.Project?.LoadedFileInfo?.DirectoryName;
            string? path = basePath;
            CreatorNode? node = FolderView.SelectedItem as CreatorNode;
            if (node != null)
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
                string relPath = path.Substring(basePath.Length);
                NewFileDialog.Show(this, relPath, basePath);
            }            
        }

        private void FolderView_CreateFolder(object? sender, RoutedEventArgs e)
        {
            string? basePath = _mainView.Project?.LoadedFileInfo?.DirectoryName;
            string? path = basePath;
            CreatorNode? node = FolderView.SelectedItem as CreatorNode;
            if (node != null)
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
                string relPath = path.Substring(basePath.Length);
                NewFileDialog.Show(this, relPath, basePath, true);
            }
        }

        private async void FolderView_Rename(object? sender, RoutedEventArgs e)
        {
            CreatorNode? node = FolderView.SelectedItem as CreatorNode;
            if (node != null)
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
            CreatorNode? node = FolderView.SelectedItem as CreatorNode;
            if (node != null)
            {
                if (node.IsFile)
                {
                    MessageBoxResult confirm = await MessageBox.Show(this, "Are you sure?", "Delete File", MessageBoxButtons.OkCancel);
                    if (confirm == MessageBoxResult.Cancel) return;
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
                _textEditor.Document = null;
                if (tab.TabType == CreatorTabType.Editor)
                {
                    _textEditor.Document = tab.Document;
                    _textEditor.IsVisible = true;
                    _textMateInstallation.SetGrammar(tab.LanguageScope);
                    _welcomePane.IsVisible = false;
                }
                else
                {
                    _textEditor.IsVisible = false;
                    _welcomePane.IsVisible = true;
                }
            }
            _mainView.SelectedTab = tab;
        }

        private void TabCloseClicked(object? sender, PointerReleasedEventArgs e)
        {
            e.Handled = true;
            TextBlock? tb = e.Source as TextBlock;
            if (tb != null && tb.Classes.Contains("CloseBut"))
            {
                CreatorTab? tab = tb.DataContext as CreatorTab;
                if (tab != null && tab.TabType == CreatorTabType.Editor)
                {
                    _mainView.OpenTabs.Remove(tab);
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
                }
            }
        }

        private void Caret_PositionChanged(object sender, EventArgs e)
        {
            _statusTextBlock.Text = string.Format("Line {0} Column {1}",
                _textEditor.TextArea.Caret.Line,
                _textEditor.TextArea.Caret.Column);
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
                }
            }
        }

        internal void MenuCloseGame_Click(object? sender, RoutedEventArgs e) => SetProject(null);

        internal void MenuSave_Click(object? sender, RoutedEventArgs e)
        {
            CreatorTab? tab = _mainView?.SelectedTab;
            if (tab != null && tab.TabType == CreatorTabType.Editor)
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
        }

        internal void MenuSaveAll_Click(object? sender, RoutedEventArgs e)
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
                        bool? res = await GamePropertiesDialog.Show(this, config);
                        if (res != null & res == true)
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

        internal void MenuPublish_Click(object? sender, RoutedEventArgs e)
        {
            MessageBox.Show(this, "Not yet implemented");
        }

        internal void MenuExit_Click(object? sender, RoutedEventArgs e) => Close();

        internal void MenuEditCut_Click(object? sender, RoutedEventArgs e) => _textEditor?.Cut();

        internal void MenuEditCopy_Click(object? sender, RoutedEventArgs e) => _textEditor?.Copy();

        internal void MenuEditPaste_Click(object? sender, RoutedEventArgs e) => _textEditor?.Paste();

        internal void MenuEditDelete_Click(object? sender, RoutedEventArgs e) => _textEditor?.Delete();

        internal void MenuEditSelectAll_Click(object? sender, RoutedEventArgs e) => _textEditor?.SelectAll();

        internal void MenuToggleFullScreen_Click(object? sender, RoutedEventArgs e)
        {
            _ = 5;

            if (HasSystemDecorations)
            {
                HasSystemDecorations = false;
                WindowState = WindowState.FullScreen;
            }
            else
            {
                HasSystemDecorations = true;
                WindowState = WindowState.Normal;
            }
        }

        internal void MenuNextEditorTheme_Click(object? sender, RoutedEventArgs e)
        {
            _currentTheme = ((int)_currentTheme + 1) % Enum.GetNames(typeof(ThemeName)).Length;
            _textMateInstallation.SetTheme(_registryOptions.LoadTheme((ThemeName)_currentTheme));
        }

        internal void MenuAbout_Click(object? sender, RoutedEventArgs e)
        {
            BrowserHelper.OpenBrowser("https://xentu.net");
        }

        #endregion


        #region Code Complettion


        private void textEditor_TextArea_TextEntering(object sender, TextInputEventArgs e)
        {
            if (e.Text.Length > 0 && _completionWindow != null)
            {
                if (!char.IsLetterOrDigit(e.Text[0]))
                {
                    _completionWindow.CompletionList.RequestInsertion(e);
                }
            }

            _insightWindow?.Hide();
        }


        private void textEditor_TextArea_TextEntered(object sender, TextInputEventArgs e)
        {
            if (e.Text == ".")
            {
                _completionWindow = new CustomCompletionWindow(_textEditor.TextArea);
                _completionWindow.PlacementAnchor = PopupAnchor.TopLeft;
                ToolTip.SetShowDelay(_completionWindow, 1);
                _completionWindow.Closed += delegate (object? o, EventArgs args)
                {
                    _completionWindow = null;
                };

                var data = _completionWindow.CompletionList.CompletionData;
                data.Add(new MyCompletionData("Item1"));
                data.Add(new MyCompletionData("Item2"));
                data.Add(new MyCompletionData("Item3"));
                data.Add(new MyCompletionData("Item4"));
                data.Add(new MyCompletionData("Item5"));
                data.Add(new MyCompletionData("Item6"));
                data.Add(new MyCompletionData("Item7"));
                data.Add(new MyCompletionData("Item8"));
                data.Add(new MyCompletionData("Item9"));
                data.Add(new MyCompletionData("Item10"));
                data.Add(new MyCompletionData("Item11"));
                data.Add(new MyCompletionData("Item12"));
                data.Add(new MyCompletionData("Item13"));
                _completionWindow.Show();
            }
            else if (e.Text == "(")
            {
                _insightWindow = new CustomOverloadInsightWindow(_textEditor.TextArea);
                _insightWindow.Closed += (o, args) => _insightWindow = null;
                _insightWindow.Provider = new MyOverloadProvider(new[]
                {
                    ("Method1(int, string)", "Method1 description"),
                    ("Method2(int)", "Method2 description"),
                    ("Method3(string)", "Method3 description"),
                });
                _insightWindow.Show();
            }
        }


        private class MyOverloadProvider : IOverloadProvider
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
            public string CurrentIndexText => null;
            public object CurrentHeader => _items[SelectedIndex].header;
            public object CurrentContent => _items[SelectedIndex].content;

            public event PropertyChangedEventHandler PropertyChanged;

            private void OnPropertyChanged([CallerMemberName] string propertyName = null)
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

            public IBitmap Image => null;

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
            private static readonly System.Reflection.PropertyInfo LogicalChildrenProperty = typeof(StyledElement).GetProperty("LogicalChildren", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);

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

            private void CompletionListOnSelectionChanged(object sender, SelectionChangedEventArgs args)
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