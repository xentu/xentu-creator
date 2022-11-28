using Avalonia.Controls;
using Avalonia.Media.Imaging;
using System.ComponentModel;
using XentuCreator.Classes;
using XentuCreator.Dialogs;

namespace XentuCreator.UserControls
{
    public partial class SpriteSheetControl : UserControl
    {
        public SpriteSheetControlModel Model { get; private set; }

        public SpriteSheetControl()
        {
            InitializeComponent();
            DataContext = Model = new(this);
        }
    }


    public class SpriteSheetControlModel : INotifyPropertyChanged
    {
        readonly SpriteSheetControl _owner;
        string _image_file = "Untitled";
        string _image_file_path = "";


        public event PropertyChangedEventHandler? PropertyChanged;


        public CreatorSpriteSheet SpriteSheet { get; set; } = new();
        public string ImageFile { get => _image_file; }


        public SpriteSheetControlModel(SpriteSheetControl owner)
        {
            this._owner = owner;
            this._image_file = "";
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
    }
}