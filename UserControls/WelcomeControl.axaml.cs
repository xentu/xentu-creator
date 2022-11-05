using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using System;
using System.ComponentModel;
using System.IO;
using XentuCreator.Classes;
using XentuCreator.Dialogs;

namespace XentuCreator.UserControls
{
    public partial class WelcomeControl : UserControl
    {
        
        Button? _buttonNew, _buttonOpen;
        public WelcomeControlView? DataView;

        public event EventHandler<RoutedEventArgs> NewClicked;
        public event EventHandler<RoutedEventArgs> OpenClicked;
        public event EventHandler<OpenRecentEventArgs> OpenRecentClicked;

        public WelcomeControl()
        {
            this.DataContext = DataView = new WelcomeControlView();
            InitializeComponent();

            _buttonNew = this.FindControl<Button>("ButtonNew");
            _buttonNew.Click += delegate (object? sender, RoutedEventArgs e)
            {
                NewClicked?.Invoke(sender, e);
            };

            _buttonOpen = this.FindControl<Button>("ButtonOpen");
            _buttonOpen.Click += delegate (object? sender, RoutedEventArgs e)
            {
                OpenClicked?.Invoke(sender, e);
            };


            ItemsControl? recentsControl = this.FindControl<ItemsControl>("ListRecents");
            recentsControl.DataContext = App.Config;

            //App.Config?.Recents.Add(new() { Nickname = "test" });
        }

        private async void RecentLink_Clicked(object? sender, PointerReleasedEventArgs e)
        {
            if (e.Source is TextBlock src && src.DataContext is CreatorConfigRecent recent)
            {
                if (!File.Exists(recent.Path))
                {
                    MessageBoxResult res = await MessageBox.Show(MainWindow._self, "The project you clicked on is missing, remove it from this list?", "Open Recent", MessageBoxButtons.YesNo);
                    if (res == MessageBoxResult.Yes && App.Config != null)
                    {
                        App.Config.Recents.Remove(recent);
                        App.Config.Save();
                    }
                }
                else
                {
                    OpenRecentClicked?.Invoke(sender, new(recent));
                }
            }
        }
    }

    public class WelcomeControlView : INotifyPropertyChanged
    {
        bool _showButtons = true;

        public event PropertyChangedEventHandler? PropertyChanged;

        public bool ShowButtons
        {
            get => _showButtons;
            set
            {
                _showButtons = value;
                PropertyChanged?.Invoke(this, new(nameof(ShowButtons)));
            }
        }
    }


    public class OpenRecentEventArgs : EventArgs
    {
        public CreatorConfigRecent Data { get; }

        public OpenRecentEventArgs(CreatorConfigRecent data)
        {
            Data = data;
        }
    }
}