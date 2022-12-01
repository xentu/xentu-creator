using AvaloniaEdit.Document;
using System.ComponentModel;
using System.IO;
using System.Threading.Tasks;
using TextMateSharp.Grammars;
using XentuCreator.UserControls;

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

        /// <summary>If a tab is used for spritesheets, this holds the editor control.</summary>
        public SpriteSheetControl? SpriteSheetPane { get; set; }

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


        public CreatorTab(MainViewModel owner, CreatorTabType type, RegistryOptions registry, string name, string filePath, string content = "")
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
            else if (type == CreatorTabType.SpriteSheetEditor)
            {
                // TODO: setup spritesheet tab data here.
                SpriteSheetPane = new();
                SpriteSheetPane.Load(owner.Project?.LoadedFileInfo?.DirectoryName ?? "", filePath);
            }
        }


        public static CreatorTab LoadFile(MainViewModel owner, RegistryOptions registry, string filePath)
        {
            FileInfo info = new(filePath);

            if (info.Extension == ".xsf")
            {
                CreatorTab resultSS = new(owner, CreatorTabType.SpriteSheetEditor, registry, info.Name, filePath, File.ReadAllText(filePath));
                resultSS.FilePath = filePath;
                resultSS.ListenForSpriteSheetChanges();
                return resultSS;
            }

            CreatorTab result = new(owner, CreatorTabType.Editor, registry, info.Name, filePath, File.ReadAllText(filePath));
            result.FilePath = filePath;

            return result;
        }


        private void ListenForSpriteSheetChanges()
        {
            if (SpriteSheetPane != null) SpriteSheetPane.Model.HasChanges += Model_HasChanges;
        }


        /// <summary>
        /// When hosting a spritesheet editor, listens for changes to mark the tab as needing save.
        /// </summary>
        private void Model_HasChanges(object? sender, System.EventArgs e) => HasChanged = true;


        ~CreatorTab()
        {
            // unsubscribe from spritesheet pane changes on deconstruction.
            if (this.TabType == CreatorTabType.SpriteSheetEditor && SpriteSheetPane != null && SpriteSheetPane.Model != null)
            {
                SpriteSheetPane.Model.HasChanges -= Model_HasChanges;
            }
        }
    }


    public enum CreatorTabType
    {
        Welcome,
        Editor,
        SpriteEditor, /* reserved for future use */
        SpriteSheetEditor,
    }
}