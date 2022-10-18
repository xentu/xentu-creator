using Avalonia.Controls;
using AvaloniaEdit.Document;
using System.ComponentModel;
using System.IO;
using TextMateSharp.Grammars;

namespace XentuCreator.Classes
{
    /// <summary>
    /// Tracks a file open with an editor in XentuCreator.
    /// </summary>
    public class CreatorTab : INotifyPropertyChanged
    {
        MainViewModel _owner;
        bool _HasChanged = false;

        public event PropertyChangedEventHandler? PropertyChanged;

        /// <summary>The type of tab.</summary>
        public CreatorTabType TabType { get; set; }

        /// <summary>The name part of the file (including extension) eg: myfile.lua</summary>
        public string Name { get; set; }

        public string NameComposite { get => HasChanged ? $"{Name}*" : Name; }

        /// <summary>The full path to the file, including name and extension.</summary>
        public string? FilePath { get; set; }

        /// <summary>The open document.</summary>
        public TextDocument? Document { get; set; }

        /// <summary>The language associated with the editor.</summary>
        public Language? Language { get; set; }
        public string? LanguageScope { get; set; }


        public bool CloseButHidden { get; set; } = false;
        public bool IsWelcomeTab { get; set; } = false;

        public bool HasChanged
        {
            get => _HasChanged;
            set
            {
                _HasChanged = value;
                PropertyChanged?.Invoke(this, new(nameof(HasChanged)));
                PropertyChanged?.Invoke(this, new(nameof(NameComposite)));
                _owner.SaveStateChanged();
            }
        }


        public CreatorTab(MainViewModel owner, CreatorTabType type, RegistryOptions registry, string name, string content = "")
        {
            _owner = owner;
            Name = name;
            TabType = type;
            if (type == CreatorTabType.Editor)
            {
                FileInfo info = new(name);
                Language = registry.GetLanguageByExtension(info.Extension);
                if (Language == null) Language = registry.GetLanguageByExtension(".md");
                LanguageScope = registry.GetScopeByLanguageId(Language.Id);
                Document = new TextDocument(content);
            }
        }


        public static CreatorTab LoadFile(MainViewModel owner, RegistryOptions registry, string filePath)
        {
            FileInfo info = new(filePath);
            CreatorTab result = new(owner, CreatorTabType.Editor, registry, info.Name, File.ReadAllText(filePath));
            result.FilePath = filePath;
            return result;
        }
    }


    public enum CreatorTabType
    {
        Welcome,
        Editor
    }
}