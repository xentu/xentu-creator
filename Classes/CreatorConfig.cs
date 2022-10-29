using Newtonsoft.Json;
using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

namespace XentuCreator.Classes
{
    public class CreatorConfig : INotifyPropertyChanged
    {
        string? _debugBinary = "", _lastBinaryVersionTag = "missing.";
        bool _autoCheckBinaryUpdates = false;


        [field:JsonIgnore]
        public event PropertyChangedEventHandler? PropertyChanged;


        /// <summary>
        /// The absolute location to the binary used for debugging games.
        /// </summary>
        public string? DebugBinary
        {
            get => _debugBinary;
            set
            {
                _debugBinary = value;
                PropertyChanged?.Invoke(this, new(nameof(DebugBinary)));
            }
        }


        public bool? AutoCheckBinaryUpdates
        {
            get => _autoCheckBinaryUpdates;
            set
            {
                _autoCheckBinaryUpdates = value == true;
                PropertyChanged?.Invoke(this, new(nameof(AutoCheckBinaryUpdates)));
            }
        }


        public CreatorConfigBinaryCollection Binaries { get; set; } = new();


        public string LastBinaryVersion { get; set; } = "0.0.1";


        public string LastBinaryVersionTag
        {
            get => _lastBinaryVersionTag;
            set
            {
                _lastBinaryVersionTag = value;
                PropertyChanged?.Invoke(this, new(nameof(LastBinaryVersionTag)));
            }
        }


        public static string Separator { get => $"{Path.DirectorySeparatorChar}"; }


        public static string GetContentPath()
        {
            string basePath = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            return $"{basePath}{Separator}XentuCreator".Replace(Separator+Separator, Separator);
        }


        public static string GetContentFilePath(string filename)
        {
            string basePath = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string result = $"{basePath}{Separator}XentuCreator{Separator}{filename}".Replace(Separator + Separator, Separator);

            // unify directory separators.
            if (basePath.Contains('/'))
            {
                result = result.Replace("\\", "/");
            }
            else
            {
                result = result.Replace("/", "\\");
            }

            return result;
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


        /// <summary>
        /// Check to see if a binary update is available.
        /// </summary>
        internal async Task<(bool should, string message)> CheckBinaryUpdate()
        {
            bool _should = false;
            string _message = "No update needed.";

            Version currentVer = Version.Parse(LastBinaryVersion);

            using (HttpClient client = new())
            {
                // 2. Download the update info.
                XentuBinaries? info = await XentuBinaries.Fetch(client);
                if (info != null)
                {
                    Version newVer = Version.Parse(info.Version);
                    if (newVer > currentVer)
                    {
                        _should = true;
                        _message = $"Version {newVer} of the engine binaries are available for download, update now?";
                    }
                }
                else
                {
                    _message = "Could not retrieve version info, please try again later.";
                }
            }

            return (_should, _message);
        }


        /// <summary>
        /// Update the binaries to the latest version without prompt.
        /// </summary>
        /// <exception cref="Exception"></exception>
        internal async Task<(bool success, string message)> UpdateBinaries()
        {
            bool _success = false;
            string _message = "No update needed.";

            Binaries ??= new();
            try
            {
                string[] enabledSlugs = Binaries.Where(t => t.Enabled).Select(t => t.Slug).ToArray();

                // 1. make sure binaries folder is available.
                DirectoryInfo binFolder = new(GetContentFilePath("binaries"));
                if (binFolder.Exists) binFolder.Create();

                using (HttpClient client = new())
                {
                    // 2. Download the update info.
                    XentuBinaries? info = await XentuBinaries.Fetch(client);
                    if (info == null) throw new Exception("Could not retrieve version info, please try again later.");
                    info.Binaries ??= new XentuBinariesBinary[0];

                    // 3. update the binary array.
                    Binaries.Clear();
                    foreach (var bin in info.Binaries)
                    {
                        CreatorConfigBinary cbin = CreatorConfigBinary.FromXenBinary(enabledSlugs.Contains(bin.Slug), info.Version, bin);
                        await cbin.Download(client, info.GitTag, bin);
                        Binaries.Add(cbin);
                    }

                    // 4. update the current binary version, and declare success.
                    LastBinaryVersion = info.Version;
                    LastBinaryVersionTag = info.GitTag;
                    _message = "Binary update success!";
                    _success = true;
                }
            }
            catch (Exception ex)
            {
                _success = false;
                _message = $"Failed to update for the following reason:\n\n{ex.Message}";
            }

            return (_success, _message);
        }
    }


    public class CreatorConfigBinaryCollection : ObservableCollection<CreatorConfigBinary> { }


    public class CreatorConfigBinary : INotifyPropertyChanged
    {
        bool _enabled = false;
        string _platform = "", _architecture = "", _version = "", _slug = "";

        [field:JsonIgnore]
        public event PropertyChangedEventHandler? PropertyChanged;

        public bool Enabled
        {
            get => _enabled;
            set
            {
                _enabled = value;
                PropertyChanged?.Invoke(this, new(nameof(Enabled)));
            }
        }

        public string Platform
        {
            get => _platform;
            set
            {
                _platform = value;
                PropertyChanged?.Invoke(this, new(nameof(Platform)));
            }
        }

        public string Slug
        {
            get => _slug;
            set
            {
                _slug = value;
                PropertyChanged?.Invoke(this, new(nameof(Slug)));
            }
        }

        public string Architecture
        {
            get => _architecture;
            set
            {
                _architecture = value;
                PropertyChanged?.Invoke(this, new(nameof(Architecture)));
            }
        }

        public string Version
        {
            get => _version;
            set
            {
                _version = value;
                PropertyChanged?.Invoke(this, new(nameof(Version)));
            }
        }
    
        public CreatorConfigBinary() { }
        public CreatorConfigBinary(bool enabled, string platform, string slug, string arch, string version)
        {
            _enabled = enabled;
            _platform = platform;
            _slug = slug;
            _architecture = arch;
            _version = version;
        }


        public static CreatorConfigBinary FromXenBinary(bool enabled, string version, XentuBinariesBinary b)
            => new(enabled, b.Platform, b.Slug, b.Architecture, version);


        internal async Task Download(HttpClient client, string gitTag, XentuBinariesBinary src)
        {
            if (!string.IsNullOrEmpty(src.File))
            {
                // describe url.
                string url = $"https://github.com/xentu/xentu-engine/releases/download/{gitTag}/{src.File}";

                // make sure destination exists, and is empty.
                DirectoryInfo dstPath = new(CreatorConfig.GetContentFilePath($"binaries/{src.Slug}"));
                if (dstPath.Exists) dstPath.Delete(true);
                dstPath.Create();

                // describe tmp download path.
                string zipPath = CreatorConfig.GetContentFilePath($"binaries/{src.Slug}/{src.File}");

                // download the payload.
                HttpResponseMessage response = await client.GetAsync(url);
                using (var fs = new FileStream(zipPath, FileMode.CreateNew))
                {
                    await response.Content.CopyToAsync(fs);
                }

                // extract payload into path.
                ZipFile.ExtractToDirectory(zipPath, dstPath.FullName);

                // clean up by removing the downloaded zip file.
                File.Delete(zipPath);
            }
        }


        [JsonIgnore]
        internal Architecture? CastedArchitecture
        {
            get => Enum.Parse<Architecture>(Architecture, true);
        }
    }
}