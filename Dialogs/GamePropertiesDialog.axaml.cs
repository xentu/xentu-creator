using Avalonia.Controls;
using Avalonia.Interactivity;
using System.Threading.Tasks;
using XentuCreator.Helpers;
using XentuCreator.Models;

namespace XentuCreator.Dialogs
{
    public partial class GamePropertiesDialog : Window
    {
        bool? _dialogResult;
        XentuConfigGameContainer _config;
        CheckBox _cbWAV, _cbOGG, _cbFLAC, _cbMP3, _cbMIDI, _cbMOD;



        public GamePropertiesDialog()
        {
            InitializeComponent();
        }

        public GamePropertiesDialog(XentuConfigGameContainer config)
        {
            InitializeComponent();
            WindowExtensions.HideMinimizeAndMaximizeButtons(this);
            _cbWAV = this.FindControl<CheckBox>("cbWAV");
            _cbOGG = this.FindControl<CheckBox>("cbOGG");
            _cbFLAC = this.FindControl<CheckBox>("cbFLAC");
            _cbMP3 = this.FindControl<CheckBox>("cbMP3");
            _cbMIDI = this.FindControl<CheckBox>("cbMIDI");
            _cbMOD = this.FindControl<CheckBox>("cbMOD");

            _config = config;
            this.DataContext = config.Game;

            if (config.Game.audio.codecs.Contains("wav")) _cbWAV.IsChecked = true;
            if (config.Game.audio.codecs.Contains("ogg")) _cbOGG.IsChecked = true;
            if (config.Game.audio.codecs.Contains("flac")) _cbFLAC.IsChecked = true;
            if (config.Game.audio.codecs.Contains("mp3")) _cbMP3.IsChecked = true;
            if (config.Game.audio.codecs.Contains("midi")) _cbMIDI.IsChecked = true;
            if (config.Game.audio.codecs.Contains("mod")) _cbMOD.IsChecked = true;
        }


        public static new Task<bool?> Show(Window parent, XentuConfigGameContainer config)
        {
            var dlg = new GamePropertiesDialog(config);
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


        public void ButtonOK_Click(object? sender, RoutedEventArgs e)
        {
            _dialogResult = true;
            _config.Game.audio.codecs.Clear();
            if (_cbWAV.IsChecked == true) _config.Game.audio.codecs.Add("wav");
            if (_cbOGG.IsChecked == true) _config.Game.audio.codecs.Add("ogg");
            if (_cbFLAC.IsChecked == true) _config.Game.audio.codecs.Add("flac");
            if (_cbMP3.IsChecked == true) _config.Game.audio.codecs.Add("mp3");
            if (_cbMIDI.IsChecked == true) _config.Game.audio.codecs.Add("midi");
            if (_cbMOD.IsChecked == true) _config.Game.audio.codecs.Add("mod");
            Close();
        }


        public void ButtonCancel_Click(object? sender, RoutedEventArgs e)
        {
            _dialogResult = false;
            Close();
        }
    }
}