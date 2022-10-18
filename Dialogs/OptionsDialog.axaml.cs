using Avalonia.Controls;
using Avalonia.Interactivity;
using System.Threading.Tasks;
using XentuCreator.Classes;

namespace XentuCreator.Dialogs
{
    public partial class OptionsDialog : Window
    {
        bool? _dialogResult = null;
        CreatorConfig _creatorConfig = new();


        public OptionsDialog()
        {
            InitializeComponent();

            if (App.Config == null)
            {
                _dialogResult = false;
                Close();
                return;
            }

            _dialogResult = null;
            _creatorConfig = App.Config.Duplicate();
            this.DataContext = _creatorConfig;
        }


        public static new Task<bool?> Show(Window parent)
        {
            var dlg = new OptionsDialog();
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
            App.Config = _creatorConfig;
            App.Config.Save();
            _dialogResult = true;
            Close();
        }

        public void ButtonCancel_Click(object? sender, RoutedEventArgs e)
        {
            _dialogResult = false;
            Close();
        }
    }
}