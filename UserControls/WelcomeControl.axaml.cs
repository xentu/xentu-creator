using Avalonia.Controls;
using Avalonia.Interactivity;
using System;
using System.ComponentModel;

namespace XentuCreator.UserControls
{
    public partial class WelcomeControl : UserControl
    {
        
        Button _buttonNew, _buttonOpen;
        public WelcomeControlView DataView;

        public event EventHandler<RoutedEventArgs> NewClicked;
        public event EventHandler<RoutedEventArgs> OpenClicked;

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
}