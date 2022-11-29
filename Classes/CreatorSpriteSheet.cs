using System.Collections.ObjectModel;
using System.ComponentModel;

namespace XentuCreator.Classes
{
    public class CreatorSpriteSheet : INotifyPropertyChanged
    {
        public string ImageFilename { get; set; } = "";
        public ObservableCollection<CreatorSpriteSheetAnimation> Animations { get; set; } = new();

        public event PropertyChangedEventHandler? PropertyChanged;

        public void Trigger(string name) => PropertyChanged?.Invoke(this, new(name));

        public CreatorSpriteSheet() { }
    }


    public class CreatorSpriteSheetAnimation : INotifyPropertyChanged
    {
        public string Name { get; set; } = "Untitled";
        public ObservableCollection<CreatorSpriteSheetFrame> Frames { get; set; } = new();
        public CreatorSpriteSheetAnimation() { }

        public event PropertyChangedEventHandler? PropertyChanged;

        public void Trigger(string name) => PropertyChanged?.Invoke(this, new(name));

        public override string ToString()
        {
            return Name;
        }
    }


    public class CreatorSpriteSheetFrame
    {
        public int FrameTime { get; set; } = 100;
        public string Coords { get; set; } = "";
        public bool FlipX { get; set; }
        public bool FlipY { get; set; }
        public bool RotPos90 { get; set; }
        public bool RotNeg90 { get; set; }
        public CreatorSpriteSheetFrame() { }
    }
}