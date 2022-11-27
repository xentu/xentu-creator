using System.Collections.ObjectModel;

namespace XentuCreator.Classes
{
    public class CreatorSpriteSheet
    {
        public string ImageFilename { get; set; } = "";
        public ObservableCollection<CreatorSpriteSheetAnimation> Animations { get; set; } = new();
        public CreatorSpriteSheet() { }
    }


    public class CreatorSpriteSheetAnimation
    {
        public string Name { get; set; } = "Untitled";
        public ObservableCollection<CreatorSpriteSheetFrame> Frames { get; set; } = new();
        public CreatorSpriteSheetAnimation() { }
    }


    public class CreatorSpriteSheetFrame
    {
        public int FrameTime { get; set; } = 100;
        public string Coords { get; set; } = "0,0,32,32";
        public bool? FlipX { get; set; }
        public bool? FlipY { get; set; }
        public bool? RotPos90 { get; set; }
        public bool? RotNeg90 { get; set; }
        public CreatorSpriteSheetFrame() { }
    }
}