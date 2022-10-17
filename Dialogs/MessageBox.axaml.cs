using Avalonia.Controls;
using Avalonia.Media;
using System.Threading.Tasks;
using XentuCreator.Helpers;

namespace XentuCreator.Dialogs
{
    public partial class MessageBox : Window
    {
        public MessageBox()
        {
            InitializeComponent();
            WindowExtensions.HideMinimizeAndMaximizeButtons(this);
        }


        public static Task<MessageBoxResult> Show(Window parent, string text, string title = "")
            => Show(parent, text, title, MessageBoxButtons.Ok);


        public static Task<MessageBoxResult> Show(Window parent, string text, string title, MessageBoxButtons buttons)
        {
            var msgbox = new MessageBox()
            {
                Title = title
            };
            msgbox.FindControl<TextBlock>("Text").Text = text;
            var buttonPanel = msgbox.FindControl<StackPanel>("Buttons");

            var res = MessageBoxResult.Ok;

            void AddButton(string caption, bool isDefault, MessageBoxResult r, bool def = false)
            {
                var btn = new Button { Content = caption, MinWidth = 80, HorizontalContentAlignment = Avalonia.Layout.HorizontalAlignment.Center };
                if (isDefault)
                {
                    btn.Background = Brushes.SteelBlue;
                    btn.IsDefault = true;
                }
                btn.Click += (_, __) => {
                    res = r;
                    msgbox.Close();
                };
                buttonPanel.Children.Add(btn);
                if (def)
                    res = r;
            }

            if (buttons == MessageBoxButtons.Ok || buttons == MessageBoxButtons.OkCancel)
                AddButton("Ok", true, MessageBoxResult.Ok, true);
            if (buttons == MessageBoxButtons.YesNo || buttons == MessageBoxButtons.YesNoCancel)
            {
                AddButton("Yes", true, MessageBoxResult.Yes);
                AddButton("No", false, MessageBoxResult.No, true);
            }

            if (buttons == MessageBoxButtons.OkCancel || buttons == MessageBoxButtons.YesNoCancel)
                AddButton("Cancel", false, MessageBoxResult.Cancel, true);


            var tcs = new TaskCompletionSource<MessageBoxResult>();
            msgbox.Closed += delegate { tcs.TrySetResult(res); };
            if (parent != null)
                msgbox.ShowDialog(parent);
            else msgbox.Show();
            return tcs.Task;
        }
    }


    public enum MessageBoxButtons
    {
        Ok,
        OkCancel,
        YesNo,
        YesNoCancel
    }


    public enum MessageBoxResult
    {
        Ok,
        Cancel,
        Yes,
        No
    }
}
