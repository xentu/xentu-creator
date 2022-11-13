using Avalonia.Controls;

namespace XentuCreator.UserControls
{
    public partial class TerminalControl : UserControl
    {
        ScrollViewer sv1;


        public TerminalControl()
        {
            InitializeComponent();
            sv1 = this.FindControl<ScrollViewer>("scrollViewer1");
        }



        public void ScrollToBottom()
        {
            sv1.ScrollToEnd();
        }
    }
}
