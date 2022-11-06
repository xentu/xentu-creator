using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Linq;

namespace XentuCreator.Classes
{
    public class CreatorNodeCollection : ObservableCollection<CreatorNode>
    {
        public CreatorNode? FindNode(string path)
        {
            foreach (var node in this)
            {
                if (node.FullPath == path) return node;
                if (node.SubNodes != null && node.SubNodes.Count > 0)
                {
                    CreatorNode? subNode = node.SubNodes.FindNode(path);
                    if (subNode != null) return subNode;
                }
            }
            return null;
        }

        public void NaturalSort()
        {
            var dirs = this.Where(t => t.IsFile == false).OrderBy(t => t.NodeText);
            var files = this.Where(t => t.IsFile == true).OrderBy(t => t.NodeText);
            var joined = dirs.Concat(files).ToList();
            for (int i = 0; i < joined.Count; i++)
            {
                int old_i = this.IndexOf(joined[i]);
                Move(old_i, i);
            }
        }

        public CreatorNode? FindParent(CreatorNode find)
        {
            foreach (var node in this)
            {
                CreatorNode? parent = node.FindParent(find);
                if (parent != null)
                {
                    return parent;
                }
            }
            return null;
        }
    }

    public class CreatorNode : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler? PropertyChanged;


        public CreatorNodeCollection SubNodes { get; set; } = new();
        public string NodeText { get; set; }
        public string NodeIcon { get; set; }
        public string FullPath { get; set; }
        public bool IsFile { get; }


        internal CreatorNode(string text, string path, bool is_file)
        {
            NodeText = text;
            NodeIcon = is_file ? "/Assets/file-code.png" : "/Assets/folder-icon.png";
            FullPath = path;
            IsFile = is_file;
        }


        private CreatorNode(string full_path, bool is_file, int max_depth, int depth, string? icon = null, params string[] ignores)
        {
            FullPath = full_path;
            IsFile = is_file;
            NodeText = Path.GetFileName(full_path);
            NodeIcon = icon ?? "/Assets/folder-icon.png";
            if (depth == max_depth) return;
            foreach (string subdir in Directory.GetDirectories(full_path, "*", SearchOption.TopDirectoryOnly))
            {
                SubNodes.Add(new(subdir, false, max_depth, depth + 1, null, ignores));
            }
            foreach (string file in Directory.GetFiles(full_path, "*", SearchOption.TopDirectoryOnly))
            {
                if (ignores.Any(t => t == file)) continue;
                StringComparison sc = StringComparison.InvariantCultureIgnoreCase;

                string ficon = "/Assets/file-gray.png";
                if (file.Contains(".wav", sc) || file.Contains(".ogg", sc) || file.Contains(".mp3", sc) || file.Contains(".mid", sc) || file.Contains(".flac", sc))
                {
                    ficon = "/Assets/file-audio.png";
                }
                else if (file.Contains(".png", sc) || file.Contains(".jpg", sc) || file.Contains(".bmp", sc))
                {
                    ficon = "/Assets/file-image.png";
                }
                else if (file.EndsWith(".js", sc) || file.Contains(".lua", sc))
                {
                    ficon = "/Assets/file-green.png";
                }
                SubNodes.Add(new(file, true, 0, 0, ficon));
            }
        }


        public static CreatorNodeCollection ListDirectory(string directory_path, params string[] ignores)
        {
            CreatorNodeCollection result = new();
            foreach (string subdir in Directory.GetDirectories(directory_path, "*", SearchOption.TopDirectoryOnly))
            {
                result.Add(new(subdir, false, 3, 0, null, ignores));
            }
            foreach (string file in Directory.GetFiles(directory_path, "*", SearchOption.TopDirectoryOnly))
            {
                if (ignores.Any(t => t == file)) continue;
                StringComparison sc = StringComparison.InvariantCultureIgnoreCase;

                string ficon = "/Assets/file-gray.png";
                if (file.Contains(".wav", sc) || file.Contains(".ogg", sc) || file.Contains(".mp3", sc) || file.Contains(".mid", sc) || file.Contains(".flac", sc))
                {
                    ficon = "/Assets/file-audio.png";
                }
                else if (file.Contains(".png", sc) || file.Contains(".jpg", sc) || file.Contains(".bmp", sc))
                {
                    ficon = "/Assets/file-image.png";
                }
                else if (file.EndsWith(".js", sc) || file.Contains(".lua", sc))
                {
                    ficon = "/Assets/file-green.png";
                }
                result.Add(new(file, true, 0, 0, ficon));
            }
            return result;
        }
    

        public CreatorNode? FindParent(CreatorNode find)
        {
            if (this.SubNodes != null && this.SubNodes.Count > 0)
            {
                if (this.SubNodes.Contains(find)) return this;
                foreach (var node in this.SubNodes)
                {
                    CreatorNode? parent = node.FindParent(find);
                    if (parent != null)
                    {
                        return parent;
                    }
                }
            }
            return null;
        }


        public void TriggerRename()
        {
            PropertyChanged?.Invoke(this, new(nameof(NodeText)));
            PropertyChanged?.Invoke(this, new(nameof(FullPath)));
        }


        public override string ToString()
        {
            return NodeText;
        }
    }
}