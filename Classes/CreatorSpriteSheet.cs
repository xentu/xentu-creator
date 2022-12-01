using Newtonsoft.Json;
using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Threading.Tasks;

namespace XentuCreator.Classes
{
    public class CreatorSpriteSheet : INotifyPropertyChanged
    {
        [JsonProperty("image")]
        public string ImageFilename { get; set; } = "";

        [JsonProperty("animations")]
        public ObservableCollection<CreatorSpriteSheetAnimation> Animations { get; set; } = new();

        [field: NonSerialized]
        public event PropertyChangedEventHandler? PropertyChanged;

        public void Trigger(string name) => PropertyChanged?.Invoke(this, new(name));

        public static CreatorSpriteSheet? Load(string filename)
        {
            string? json = File.ReadAllText(filename);
            return JsonConvert.DeserializeObject<CreatorSpriteSheet>(json);
        }

        public async Task Save(string filename)
        {
            JsonSerializerSettings settings = new();
            settings.Formatting = Formatting.Indented;
            string json = JsonConvert.SerializeObject(this, settings);
            await File.WriteAllTextAsync(filename, json);
        }

        public CreatorSpriteSheet() { }
    }


    public class CreatorSpriteSheetAnimation : INotifyPropertyChanged
    {
        [JsonProperty("name")]
        public string Name { get; set; } = "Untitled";

        [JsonProperty("frames")]
        public ObservableCollection<CreatorSpriteSheetFrame> Frames { get; set; } = new();

        public CreatorSpriteSheetAnimation() { }

        public event PropertyChangedEventHandler? PropertyChanged;

        public void Trigger(string name) => PropertyChanged?.Invoke(this, new(name));

        public override string ToString() => Name;
    }


    public class CreatorSpriteSheetFrame
    {
        [JsonProperty("delay")]
        public int FrameTime { get; set; } = 100;

        [JsonProperty("coords")]
        public string Coords { get; set; } = "";

        [JsonProperty("flip_x")] 
        public bool FlipX { get; set; }

        [JsonProperty("flip_y")]
        public bool FlipY { get; set; }

        [JsonProperty("rot90")]
        public bool RotPos90 { get; set; }

        [JsonProperty("rot180")]
        public bool RotPos180 { get; set; }

        [JsonProperty("rot270")]
        public bool RotPos270 { get; set; }


        public CreatorSpriteSheetFrame() { }


        public bool ShouldSerializeFlipX() => FlipX == true;
        public bool ShouldSerializeFlipY() => FlipY == true;
        public bool ShouldSerializeRotPos90() => RotPos90 == true;
        public bool ShouldSerializeRotNeg90() => RotPos270 == true;
    }
}