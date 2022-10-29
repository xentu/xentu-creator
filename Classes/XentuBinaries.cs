using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace XentuCreator.Classes
{
    public class XentuBinaries
    {
        public string Version { get; set; } = "0.0.1";
        public string GitTag { get; set; } = "0.0.1-alpha";
        public DateTime? DatePublished { get; set; }
        public XentuBinariesBinary[]? Binaries { get; set; }


        internal static async Task<XentuBinaries?> Fetch(HttpClient client)
        {
            string? json = await client.GetStringAsync("https://xentu.net/binaries");
            return JsonConvert.DeserializeObject<XentuBinaries>(json);
        }
    }


    public class XentuBinariesBinary
    {
        public string Platform { get; set; } = "Windows";
        public string Architecture { get; set; } = "x86";
        public string Slug { get; set; } = string.Empty;
        public string File { get; set; } = string.Empty;
    }
}