using Avalonia.Controls;
using Avalonia.Interactivity;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.InteropServices;
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
            //_creatorConfig.Binaries.Clear();
            //_creatorConfig.Binaries.Add(new(false, "Windows", "x86", "0.0.2"));
            //_creatorConfig.Binaries.Add(new(false, "Linux/FreeBSD", "x86", "0.0.2"));
            //_creatorConfig.Binaries.Add(new(false, "Mac OS", "x86", "0.0.2"));

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


        public async void ButtonDefaultPath_Click(object? sender, RoutedEventArgs e)
        {
            Architecture current = Architecture.X86;
            Architecture realCurrent = RuntimeInformation.ProcessArchitecture;
            if (realCurrent == Architecture.Arm) current = realCurrent;
            if (realCurrent == Architecture.Arm64) current = realCurrent;
            if (realCurrent == Architecture.S390x) current = realCurrent;
            if (realCurrent == Architecture.Wasm) current = realCurrent;

            var candidates = _creatorConfig.Binaries.Where(t => t.CastedArchitecture == current);
            var bin_name = "xentu_debug";
            CreatorConfigBinary? candidate = null;

            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                candidate = candidates.FirstOrDefault(t => t.Slug.StartsWith("win_"));
                bin_name = "xentu_debug.exe";
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux) || RuntimeInformation.IsOSPlatform(OSPlatform.FreeBSD))
            {
                candidate = candidates.FirstOrDefault(t => t.Slug.StartsWith("linux_"));
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                candidate = candidates.FirstOrDefault(t => t.Slug.StartsWith("mac_"));
            }

            if (candidate == null)
            {
                await MessageBox.Show(this, "Error no candidates are available yet. Use the engine tab to make sure you have them installed.");
                return;
            }

            _creatorConfig.DebugBinary = CreatorConfig.GetContentFilePath($"binaries\\{candidate.Slug}\\{bin_name}");
        }


        public async void ButtonCheckUpdate_Click(object? sender, RoutedEventArgs e)
        {
            this.IsEnabled = false;

            try
            {
                var resShould = await _creatorConfig.CheckBinaryUpdate();

                if (resShould.should == false)
                {
                    await MessageBox.Show(this, resShould.message, "Binary Update");
                }
                else
                {
                    MessageBoxResult resConfirm = await MessageBox.Show(this, resShould.message, "Binary Update", MessageBoxButtons.OkCancel);
                    if (resConfirm == MessageBoxResult.Ok)
                    {
                        var resUpdate = await _creatorConfig.UpdateBinaries();
                        if (resUpdate.success)
                        {
                            /**
                             * little complicated. If success, then we should save the
                             * config change regardless of weather other config changes
                             * are made.
                             */
                            if (App.Config != null)
                            {
                                App.Config.Binaries.Clear();
                                foreach (var b in _creatorConfig.Binaries)
                                {
                                    App.Config.Binaries.Add(b);
                                }
                                App.Config.LastBinaryVersion = _creatorConfig.LastBinaryVersion;
                                App.Config.LastBinaryVersionTag = _creatorConfig.LastBinaryVersionTag;
                                App.Config.Save();
                            }
                        }
                        await MessageBox.Show(this, resUpdate.message, "Binary Update");
                    }
                }
            }
            catch { }

            this.IsEnabled = true;
        }
    

        public void ButtonEnableAll_Click(object? sender, RoutedEventArgs e)
        {
            foreach (var bin in _creatorConfig.Binaries)
            {
                bin.Enabled = true;
            }
        }


        public void ButtonDisableAll_Click(object? sender, RoutedEventArgs e)
        {
            foreach (var bin in _creatorConfig.Binaries)
            {
                bin.Enabled = false;
            }
        }
    }
}