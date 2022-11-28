using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Markup.Xaml;
using Avalonia.Media;
using System.Collections.Generic;
using XentuCreator.Classes;

namespace XentuCreator
{
    public partial class App : Application
    {
        public static CreatorConfig Config { get; set; } = new();
        public static Dictionary<string, FontFamily> Fonts { get; set; } = new();

        public override void Initialize()
        {
            AvaloniaXamlLoader.Load(this);
        }

        public override void OnFrameworkInitializationCompleted()
        {
            Config = CreatorConfig.Load();

            if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
            {
                desktop.MainWindow = new MainWindow();
            }
            base.OnFrameworkInitializationCompleted();
        }
    }
}