using System.IO;
using System.Reflection;

namespace XentuCreator.Helpers
{
    internal static class ResourceLoader
    {
        internal static string? LoadTextFile(string relPath)
        {
            string prefix = "XentuCreator.Assets.";
            string path = prefix + relPath.Replace("/", ".");
            string? result = null;
            Stream? stream = typeof(ResourceLoader).GetTypeInfo().Assembly.GetManifestResourceStream(path);
            if (stream != null)
            {
                using (stream)
                using (StreamReader reader = new(stream))
                {
                    result = reader.ReadToEnd();
                }
            }
            return result;
        }
    }
}