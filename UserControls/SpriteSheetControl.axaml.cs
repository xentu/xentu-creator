using Avalonia.Controls;
using Avalonia.Controls.Presenters;
using Avalonia.Controls.Primitives;
using Avalonia.Input;
using Avalonia.Media.Imaging;
using AvaloniaEdit.Utils;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using XentuCreator.Classes;
using XentuCreator.Dialogs;

namespace XentuCreator.UserControls
{
    public partial class SpriteSheetControl : UserControl
    {
        ListBox listAnimations, listFrames;
        HeaderedContentControl frameGrid;

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

        void ListAnimations_SelectionChanged(object? sender, SelectionChangedEventArgs e)
        {
            Model.Frames.Clear();
            frameGrid.DataContext = new CreatorSpriteSheetFrame();
            frameGrid.Opacity = 0.5;
            frameGrid.IsEnabled = false;
            if (listAnimations.SelectedItem is CreatorSpriteSheetAnimation animation)
            {
                Model.Frames.AddRange(animation.Frames.Select(t => new SpriteFrameModel("", t)));
                Model.FocusSelectedAnimation(animation);
                Model.AdjustFrameTitles();
            }
            Model.TriggerAnimationSelected();
            Model.TriggerFrameSelected();
        }

        void ListFrames_SelectionChanged(object? sender, SelectionChangedEventArgs e)
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
    }


    public class SpriteSheetControlModel : INotifyPropertyChanged
    {
        readonly SpriteSheetControl _owner;
        string _image_file = "Untitled";
        string _image_file_path = "";
        CreatorSpriteSheetAnimation? _selectedAnimation;

        public event PropertyChangedEventHandler? PropertyChanged;


        public CreatorSpriteSheet SpriteSheet { get; set; } = new();
        public ObservableCollection<SpriteFrameModel> Frames { get; set; } = new();
        public string ImageFile { get => _image_file; }


        public SpriteSheetControlModel(SpriteSheetControl owner)
        {
            this._owner = owner;
            this._image_file = "";

            SpriteSheet.Animations.Add(new() { Name = "test" });
            SpriteSheet.Animations[0].Frames.Add(new ());
            SpriteSheet.Animations.Add(new() { Name = "test 2" });
            SpriteSheet.Animations[1].Frames.Add(new());
            SpriteSheet.Animations[1].Frames.Add(new());
        }


        public async void BrowseImage()
        {
            if (MainWindow._self == null) return;
            var (success, path, full) = await SelectImageDialog.Show(MainWindow._self);
            if (success == true)
            {
                _image_file = path ?? "None Selected";
                _image_file_path = full ?? "";
                PropertyChanged?.Invoke(this, new(nameof(ImageFile)));

                Image img = _owner.FindControl<Image>("ImagePreview");
                img.Source = new Bitmap(_image_file_path);
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
                }
            }

        }


        public void Command_NewFrame()
        {
            if (IsAnimationSelected)
            {
                Frames.Add(new SpriteFrameModel("Untitled", new()));
                AdjustFrameTitles();
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
                }
            }
        }


        public bool IsAnimationSelected { get => _owner.FindControl<ListBox>("ListAnimations").SelectedItems.Count > 0; }
        public bool IsFrameSelected { get => IsAnimationSelected && _owner.FindControl<ListBox>("ListFrames").SelectedItems.Count > 0; }

        public void TriggerAnimationSelected() => PropertyChanged?.Invoke(this, new(nameof(IsAnimationSelected)));
        public void TriggerFrameSelected() => PropertyChanged?.Invoke(this, new(nameof(IsFrameSelected)));
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