using Avalonia;
using Avalonia.Controls;
using Avalonia.Data.Converters;
using Avalonia.Media;
using Avalonia.Media.Imaging;
using Avalonia.Platform;
using Avalonia.VisualTree;
using System;
using System.Globalization;
using System.Reflection;
using System.Runtime.InteropServices;

namespace XentuCreator.Helpers
{
    public class BitmapAssetValueConverter : IValueConverter
    {
        public static BitmapAssetValueConverter Instance = new BitmapAssetValueConverter();

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null)
                return null;

            if (value is string rawUri)
            {
                if (targetType.IsAssignableFrom(typeof(IImage)))
                {
                    return Convert(value, typeof(Bitmap), parameter, culture);
                }
                else if (targetType.IsAssignableFrom(typeof(Bitmap)))
                {
                    Uri uri;

                    // Allow for assembly overrides
                    if (rawUri.StartsWith("avares://"))
                    {
                        uri = new Uri(rawUri);
                    }
                    else
                    {
                        string assemblyName = Assembly.GetEntryAssembly().GetName().Name;
                        uri = new Uri($"avares://{assemblyName}{rawUri}");
                    }

                    var assets = AvaloniaLocator.Current.GetService<IAssetLoader>();
                    var asset = assets.Open(uri);
                    return new Bitmap(asset);
                }
            }

            throw new NotSupportedException();
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotSupportedException();
        }
    }


    internal static class WindowExtensions
    {
        // from winuser.h
        private const int GWL_STYLE = -16,
                          WS_MAXIMIZEBOX = 0x10000,
                          WS_MINIMIZEBOX = 0x20000;

        [DllImport("user32.dll")]
        extern private static int GetWindowLong(IntPtr hwnd, int index);

        [DllImport("user32.dll")]
        extern private static int SetWindowLong(IntPtr hwnd, int index, int value);

        internal static void HideMinimizeAndMaximizeButtons(this Window window)
        {
            Avalonia.Win32.WindowImpl? impl = ((TopLevel)window.GetVisualRoot()).PlatformImpl as Avalonia.Win32.WindowImpl;
            if (impl != null)
            {
                IntPtr hwnd = impl.Handle.Handle;
                var currentStyle = GetWindowLong(hwnd, GWL_STYLE);
                SetWindowLong(hwnd, GWL_STYLE, currentStyle & ~WS_MAXIMIZEBOX & ~WS_MINIMIZEBOX);
            }
        }
    }
}