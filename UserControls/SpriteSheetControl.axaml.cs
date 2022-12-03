using Avalonia.Controls;
using Avalonia.Controls.Presenters;
using Avalonia.Controls.Primitives;
using Avalonia.Controls.Shapes;
using Avalonia.Input;
using Avalonia.Interactivity;
using Avalonia.Media;
using Avalonia.Media.Imaging;
using Avalonia.Platform;
using AvaloniaEdit.Utils;
using SkiaSharp;
using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using XentuCreator.Classes;
using XentuCreator.Dialogs;
using SD = System.Drawing;
using SDI = System.Drawing.Imaging;

namespace XentuCreator.UserControls
{
    public partial class SpriteSheetControl : UserControl
    {
        ListBox listAnimations, listFrames;
        HeaderedContentControl frameGrid;
        Border previewControls;
        

        public SpriteSheetControlModel Model { get; private set; }

        public SpriteSheetControl()
        {
            InitializeComponent();
            DataContext = Model = new(this);
            listAnimations = this.FindControl<ListBox>("ListAnimations");
            ListAnimations.PointerReleased += ListAnimations_PointerReleased;
            listFrames = this.FindControl<ListBox>("ListFrames");
            ListFrames.PointerReleased += ListFrames_PointerReleased;
            frameGrid = this.FindControl<HeaderedContentControl>("FrameGrid");
            frameGrid.DataContext = new CreatorSpriteSheetFrame();
            frameGrid.GotFocus += FrameGrid_GotFocus;
            previewControls = this.FindControl<Border>("PreviewControls");
        }

        private void FrameGrid_GotFocus(object? sender, GotFocusEventArgs e)
        {
            Model?.TriggerChange();
        }

        public void Load(string basePath, string filename)
        {
            CreatorSpriteSheet? ss = CreatorSpriteSheet.Load(filename) ?? new();
            if (ss != null)
            {
                Model.SpriteSheet = ss;
                if (MainWindow._self == null) return;
                if (Model.SpriteSheet == null) return;

                string imagePath = Model.SpriteSheet.ImageFilename;
                string fullPath = $"{basePath}/{imagePath}";
                DataContext = null;
                DataContext = Model;
                if (File.Exists(fullPath))
                {
                    Model.SetImage(imagePath, fullPath);
                }
            }
        }


        public async Task Save(string filename)
        {
            if (Model.SpriteSheet != null)
            {
                await Model.SpriteSheet.Save(filename);
            }
        }


        private void ListAnimations_PointerReleased(object? sender, PointerReleasedEventArgs e)
        {
            if (sender is ListBox lv && e.Source is ScrollContentPresenter)
            {
                listAnimations.UnselectAll();
            }
        }


        private void ListFrames_PointerReleased(object? sender, PointerReleasedEventArgs e)
        {
            if (sender is ListBox lv && e.Source is ScrollContentPresenter)
            {
                listFrames.UnselectAll();
            }
        }


        private async void ButtonPlay_Clicked(object? sender, RoutedEventArgs e)
        {
            Model.AutoPlayEnabled = true;
            this.FindControl<Button>("ButtonPlay").IsEnabled = false;
            this.FindControl<Button>("ButtonStop").IsEnabled = true;
            await Model.DrawCurrentAnimationFrame();
        }


        private void ButtonStop_Clicked(object? sender, RoutedEventArgs e)
        {
            Model.AutoPlayEnabled = false;
            this.FindControl<Button>("ButtonPlay").IsEnabled = true;
            this.FindControl<Button>("ButtonStop").IsEnabled = false;
        }


        private void ListAnimations_SelectionChanged(object? sender, SelectionChangedEventArgs e)
        {
            Model.Frames.Clear();
            frameGrid.DataContext = new CreatorSpriteSheetFrame();
            frameGrid.Opacity = 0.5;
            frameGrid.IsEnabled = false;
            previewControls.IsEnabled = false;
            if (listAnimations.SelectedItem is CreatorSpriteSheetAnimation animation)
            {
                Model.Frames.AddRange(animation.Frames.Select(t => new SpriteFrameModel("", t)));
                Model.FocusSelectedAnimation(animation);
                Model.AdjustFrameTitles();
                previewControls.IsEnabled = true;
            }
            else
            {
                Model.AutoPlayEnabled = false;
                this.FindControl<Button>("ButtonPlay").IsEnabled = true;
                this.FindControl<Button>("ButtonStop").IsEnabled = false;
            }
            Model.TriggerAnimationSelected();
            Model.TriggerFrameSelected();
        }


        private void ListFrames_SelectionChanged(object? sender, SelectionChangedEventArgs e)
        {
            frameGrid.DataContext = new CreatorSpriteSheetFrame();
            frameGrid.Opacity = 0.5;
            frameGrid.IsEnabled = false;
            if (listFrames.SelectedItem is SpriteFrameModel model)
            {
                frameGrid.DataContext = model.Frame;
                frameGrid.IsEnabled = true;
                frameGrid.Opacity = 1;
            }
            Model.TriggerFrameSelected();
        }


        private void Rotation_Checked(object? sender, RoutedEventArgs e)
        {
            if (sender is RadioButton rb && int.TryParse(rb.Content?.ToString(), out int rotation))
            {
                if (frameGrid.DataContext is CreatorSpriteSheetFrame frame)
                {
                    frame.Rotation = rotation;
                }
            }
        }
    }


    public class SpriteSheetControlModel : INotifyPropertyChanged
    {
        readonly SpriteSheetControl _owner;
        readonly Canvas _regionCanvas;
        readonly Image _animationCanvas;
        string _image_file = "Untitled";
        string _image_file_path = "";
        CreatorSpriteSheetAnimation? _selectedAnimation;
        ComboBox _scaleCombo;
        SD.Bitmap _loadedRegionImage;
        IBrush _regionBrush;
        double _zoom = 1;
        int _currentFrame = 0;
        bool _autoPlayEnabled;

        public event PropertyChangedEventHandler? PropertyChanged;
        public event EventHandler? HasChanges;


        public CreatorSpriteSheet SpriteSheet { get; set; } = new();
        public ObservableCollection<SpriteFrameModel> Frames { get; set; } = new();
        public string ImageFile { get => _image_file; }
        public CreatorSpriteSheetAnimation? SelectedAnimation { get => _selectedAnimation; }
        public bool AutoPlayEnabled
        {
            get => _autoPlayEnabled;
            set
            {
                _autoPlayEnabled = value;
                PropertyChanged?.Invoke(this, new(nameof(AutoPlayEnabled)));
            }
        }


        public SpriteSheetControlModel(SpriteSheetControl owner)
        {
            this._owner = owner;
            this._regionCanvas = owner.FindControl<Canvas>("RegionCanvas");
            this._regionBrush = new SolidColorBrush(Colors.Gray, 0.5);
            this._image_file = "";
            this._animationCanvas = owner.FindControl<Image>("AnimationCanvas");
            //SpriteSheet.Animations.Add(new() { Name = "test" });
            //SpriteSheet.Animations[0].Frames.Add(new ());
            //SpriteSheet.Animations.Add(new() { Name = "test 2" });
            //SpriteSheet.Animations[1].Frames.Add(new());
            //SpriteSheet.Animations[1].Frames.Add(new());

            this._scaleCombo = owner.FindControl<ComboBox>("ScaleCombo");
            this._scaleCombo.SelectionChanged += delegate (object? sender, SelectionChangedEventArgs e)
            {
                if (_scaleCombo.SelectedItem is ComboBoxItem item)
                {
                    if (item.Tag != null && double.TryParse(item.Tag?.ToString(), out double zoom))
                    {
                        SetAnimationScale(zoom);
                    }
                }
            };
        }


        public async void BrowseImage()
        {
            if (MainWindow._self == null) return;
            var (success, rel_path, full_path) = await SelectImageDialog.Show(MainWindow._self);
            if (success == true && rel_path != null)
            {
                SpriteSheet.ImageFilename = rel_path;
                SetImage(rel_path, full_path);
                TriggerChange();
            }
        }


        public void SetImage(string relativePath, string fullPath)
        {
            try
            {
                _image_file = relativePath ?? "None Selected";
                _image_file_path = fullPath ?? "";
                PropertyChanged?.Invoke(this, new(nameof(ImageFile)));
                Image img = _owner.FindControl<Image>("ImagePreview");
                Bitmap bmp = new Bitmap(_image_file_path);
                img.Source = bmp;

                if (_loadedRegionImage != null)
                {
                    _loadedRegionImage.Dispose();
                    _loadedRegionImage = null;
                }

                _loadedRegionImage = new SD.Bitmap(_image_file_path);
            }
            catch (Exception ex)
            {
                _ = ex;
            }
        }


        internal void AdjustFrameTitles()
        {
            for (int i=0; i< Frames.Count; i++)
            {
                Frames[i].Name = $"Frame {i + 1}";
            }
            UpdateSelectedAnimation();
        }


        internal void FocusSelectedAnimation(CreatorSpriteSheetAnimation? animation)
        {
            _selectedAnimation = animation;
            _currentFrame = 0;
            UpdateSelectedAnimation();
        }


        internal void UpdateSelectedAnimation()
        {
            if (_selectedAnimation != null)
            {
                _selectedAnimation.Frames.Clear();
                _selectedAnimation.Frames.AddRange(Frames.Select(t => t.Frame));
            }
        }


        public void Command_NewAnimation()
        {
            string newName = $"Animation {SpriteSheet.Animations.Count + 1}";
            SpriteSheet.Animations.Add(new() { Name = newName});
            TriggerChange();
        }


        public void Command_CopyAnimation()
        {
            if (MainWindow._self == null) return;
            MainWindow wnd = MainWindow._self;
            if (_owner.FindControl<ListBox>("ListAnimations") is ListBox lb && lb.SelectedItem is CreatorSpriteSheetAnimation ani)
            {
                CreatorSpriteSheetAnimation clone = new();
                clone.Name = ani.Name + " copy";
                foreach (var frame in ani.Frames)
                {
                    clone.Frames.Add(frame.Clone());
                }
                SpriteSheet.Animations.Add(clone);
            }
        }


        public async void Command_RenameAnimation()
        {
            if (MainWindow._self == null) return;
            MainWindow wnd = MainWindow._self;
            if (_owner.FindControl<ListBox>("ListAnimations") is ListBox lb && lb.SelectedItem is CreatorSpriteSheetAnimation ani)
            {
                var res = await TextBoxDialog.Show(wnd, ani.Name);
                if (res != null)
                {
                    ani.Name = res;
                    ani.Trigger("Name");
                    SpriteSheet.Trigger("Animations");
                    PropertyChanged?.Invoke(this, new(nameof(SpriteSheet)));
                    TriggerChange();
                }
            }
        }


        public async void Command_RemoveAnimation()
        {
            if (MainWindow._self == null) return;
            MainWindow wnd = MainWindow._self;
            if (_owner.FindControl<ListBox>("ListAnimations") is ListBox lb && lb.SelectedItem is CreatorSpriteSheetAnimation ani)
            {
                MessageBoxResult res = await MessageBox.Show(wnd, "Are you sure?", "Remove Animation", MessageBoxButtons.OkCancel);
                if (res == MessageBoxResult.Ok)
                {
                    SpriteSheet.Animations.Remove(ani);
                    TriggerChange();
                }
            }

        }


        public void Command_NewFrame()
        {
            if (IsAnimationSelected)
            {
                Frames.Add(new SpriteFrameModel("Untitled", new()));
                AdjustFrameTitles();
                TriggerChange();
            }
        }


        public void Command_RemoveFrame()
        {
            if (_owner.FindControl<ListBox>("ListFrames") is ListBox lb && lb.SelectedItem is SpriteFrameModel model)
            {
                if (_selectedAnimation!= null)
                {
                    Frames.Remove(model);
                    _selectedAnimation.Frames.Remove(model.Frame);
                    AdjustFrameTitles();
                    TriggerChange();
                }
            }
        }


        public bool IsAnimationSelected { get => _owner.FindControl<ListBox>("ListAnimations").SelectedItems.Count > 0; }
        public bool IsFrameSelected { get => IsAnimationSelected && _owner.FindControl<ListBox>("ListFrames").SelectedItems.Count > 0; }

        public void TriggerAnimationSelected()
        {
            PropertyChanged?.Invoke(this, new(nameof(IsAnimationSelected)));
            UpdateRegionSelections();
        }

        public void TriggerFrameSelected()
        {
            PropertyChanged?.Invoke(this, new(nameof(IsFrameSelected)));
            UpdateRegionSelections();
        }

        internal void TriggerChange()
        {
            HasChanges?.Invoke(this, new());
            UpdateRegionSelections();
        }


        public void UpdateRegionSelections()
        {
            _regionCanvas.Children.Clear();
            if (Frames != null)
            {
                SpriteFrameModel? selectedFrame = _owner.FindControl<ListBox>("ListFrames").SelectedItem as SpriteFrameModel;
                foreach (SpriteFrameModel frame in Frames)
                {
                    bool selected = selectedFrame == frame;
                    if (frame.Frame.GetCoords(out int x, out int y, out int w, out int h))
                    {
                        //string[] cp = frame.Frame.Coords.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.RemoveEmptyEntries);
                        //if (cp.Length > 3 && int.TryParse(cp[0], out int x) && int.TryParse(cp[1], out int y) && int.TryParse(cp[2], out int w) && int.TryParse(cp[3], out int h))
                        Rectangle r = new()
                        {
                            Width = w, Height = h,
                            Stroke = selected ? Brushes.Green : _regionBrush,
                            StrokeThickness = 1
                        };
                        _regionCanvas.Children.Add(r);
                        Canvas.SetLeft(r, x);
                        Canvas.SetTop(r, y);
                    }
                }
            }
        }
    

        public async Task DrawCurrentAnimationFrame(bool allowAnimate = true)
        {
            if (_selectedAnimation == null) return;
            _currentFrame++;
            if (_currentFrame >= _selectedAnimation.Frames.Count) _currentFrame = 0;

            if (SelectedAnimation == null)
            {
                _animationCanvas.Source = null;
                return;
            }

            var frame = SelectedAnimation.Frames[_currentFrame];
            if (frame.GetCoords(out int x, out int y, out int w, out int h))
            {
                int dest_w = (int)(w * _zoom);
                int dest_h = (int)(h * _zoom);
                SD.Bitmap sd_bmp = new SD.Bitmap(dest_w, dest_h);

                using (SD.Graphics sd_canvas = SD.Graphics.FromImage(sd_bmp))
                {
                    sd_canvas.InterpolationMode = SD.Drawing2D.InterpolationMode.NearestNeighbor;
                    SD.Rectangle sd_src = new(x, y, w, h);
                    SD.Rectangle sd_dest = new(0, 0, dest_w, dest_h);

                    int t_x = frame.FlipX ? dest_w : 0;
                    int t_y = frame.FlipY ? dest_h : 0;
                    int s_x = frame.FlipX ? -1 : 1;
                    int s_y = frame.FlipY ? -1 : 1;

                    sd_canvas.TranslateTransform(t_x, t_y);
                    sd_canvas.ScaleTransform(s_x, s_y);
                    sd_canvas.DrawImage(_loadedRegionImage, sd_dest, sd_src, SD.GraphicsUnit.Pixel);
                }

                if (frame.Rotation == 90) sd_bmp.RotateFlip(SD.RotateFlipType.Rotate90FlipNone);
                if (frame.Rotation == 180) sd_bmp.RotateFlip(SD.RotateFlipType.Rotate180FlipNone);
                if (frame.Rotation == 270) sd_bmp.RotateFlip(SD.RotateFlipType.Rotate270FlipNone);

                var sd_data = sd_bmp.LockBits(new SD.Rectangle(0, 0, dest_w, dest_h), SDI.ImageLockMode.ReadWrite, SDI.PixelFormat.Format32bppArgb);
                Bitmap bitmap = new Bitmap(Avalonia.Platform.PixelFormat.Bgra8888, Avalonia.Platform.AlphaFormat.Premul,
                    sd_data.Scan0,
                    new Avalonia.PixelSize(sd_data.Width, sd_data.Height),
                    new Avalonia.Vector(96, 96),
                    sd_data.Stride);
                sd_bmp.UnlockBits(sd_data);

                _animationCanvas.Source = bitmap;
                _animationCanvas.Width = dest_w;
                _animationCanvas.Height = dest_h;
            }


            if (AutoPlayEnabled && allowAnimate)
            {
                await Task.Delay(frame.FrameTime);
                await DrawCurrentAnimationFrame();
            }
        }
    

        public void SetAnimationScale(double scale)
        {
            _zoom = scale;
            DrawCurrentAnimationFrame(false);
        }
    }


    public class SpriteFrameModel : INotifyPropertyChanged
    {
        string _Name;
        CreatorSpriteSheetFrame _Frame;

        public event PropertyChangedEventHandler? PropertyChanged;

        public string Name
        {
            get => _Name;
            set
            {
                _Name = value;
                PropertyChanged?.Invoke(this, new(nameof(Name)));
            }
        }
        public CreatorSpriteSheetFrame Frame
        {
            get => _Frame;
            set
            {
                _Frame = value;
                PropertyChanged?.Invoke(this, new(nameof(Frame)));
            }
        }

        public SpriteFrameModel(string name, CreatorSpriteSheetFrame frame)
        {
            _Name = name;
            _Frame = frame;
        }

        public override string ToString()
        {
            return _Name;
        }
    }
}