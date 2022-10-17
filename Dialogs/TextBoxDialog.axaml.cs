using Avalonia.Controls;
using Avalonia.Interactivity;
using System.Threading.Tasks;

namespace XentuCreator.Dialogs
{
    public partial class TextBoxDialog : Window
    {
        string? _dialogResult;
        TextBox _textInput;

        public TextBoxDialog()
        {
            InitializeComponent();
            _textInput = this.FindControl<TextBox>("TextInput");
        }

        public TextBoxDialog(string defaultValue) : this()
        {
            _textInput.Text = defaultValue;
        }


        private void NewFileDialog_Opened(object? sender, System.EventArgs e)
        {
            _textInput.SelectAll();
            _textInput.Focus();
        }


        public async void ButtonOK_Click(object? sender, RoutedEventArgs e)
        {
            if (string.IsNullOrWhiteSpace(_textInput.Text))
            {
                await MessageBox.Show(this, "Please enter a value before pressing ok.");
                return;
            }
            _dialogResult = _textInput.Text;
            Close();
        }


        public void ButtonCancel_Click(object? sender, RoutedEventArgs e) => Close();


        public static new Task<string?> Show(Window parent, string defaultValue)
        {
            var dlg = new TextBoxDialog(defaultValue);
            var tcs = new TaskCompletionSource<string?>();
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