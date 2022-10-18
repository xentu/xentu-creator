using Newtonsoft.Json;
using System.ComponentModel;
using System.IO;

namespace XentuCreator.Classes
{
    public class CreatorProject : INotifyPropertyChanged
    {
        private bool _disposed = false;

        [field: JsonIgnore]
        public event PropertyChangedEventHandler? PropertyChanged;

        [JsonIgnore]
        public FileInfo? LoadedFileInfo { get; set; }

        [JsonProperty("game")]
        public XentuConfigGame Game { get; set; } = new();

        public CreatorProject()
        {

        }


        public static CreatorProject? Load(string filename)
        {
            string json = File.ReadAllText(filename);
            CreatorProject? result = JsonConvert.DeserializeObject<CreatorProject>(json);
            if (result == null) result = new();
            result.LoadedFileInfo = new(filename);
            return result;
        }
    }
}