using Newtonsoft.Json;
using System;
using System.IO;

namespace XentuCreator.Classes
{
    public class CreatorConfig
    {
        /// <summary>
        /// The absolute location to the binary used for debugging games.
        /// </summary>
        public string? DebugBinary { get; set; }


        public static string Separator { get => $"{Path.DirectorySeparatorChar}"; }


        public static string GetContentPath()
        {
            string basePath = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            return $"{basePath}{Separator}XentuCreator".Replace(Separator+Separator, Separator);
        }


        public static string GetContentFilePath(string filename)
        {
            string basePath = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            return $"{basePath}{Separator}XentuCreator{Separator}{filename}".Replace(Separator + Separator, Separator);
        }


        public static CreatorConfig? Load()
        {
            string path = GetContentFilePath("config.json");

            if (!File.Exists(path))
            {
                return new CreatorConfig();
            }

            string json = File.ReadAllText(path);
            return JsonConvert.DeserializeObject<CreatorConfig>(json);
        }


        public void Save()
        {
            string path = GetContentFilePath("config.json");
            FileInfo info = new(path);

            // make sure the directory exists.
            if (info.Directory != null && info.Directory.Exists == false)
            {
                info.Directory.Create();
            }

            JsonSerializer js = new();
            using (FileStream fs = File.Create(path))
            using (StreamWriter sw = new StreamWriter(fs))
            using (JsonTextWriter jw = new JsonTextWriter(sw))
            {
                jw.Formatting = Formatting.Indented;
                jw.IndentChar = '\t';
                jw.Indentation = 1;
                js.Serialize(jw, this);
            }
        }
    

        public CreatorConfig Duplicate()
        {
            string json = JsonConvert.SerializeObject(this);
            CreatorConfig? result = JsonConvert.DeserializeObject<CreatorConfig>(json);
            if (result == null) throw new Exception("Failed to duplicate CreatorConfig using JSON serialization.");
            return result;
        }
    }
}