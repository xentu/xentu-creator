using System.ComponentModel;
using System.Linq;

namespace XentuCreator.Classes
{
    public class EventLog : INotifyPropertyChanged
    {
        string _log = "", _current_line = "";

        public event PropertyChangedEventHandler? PropertyChanged;

        public string Log
        {
            get => _log;
            set
            {
                _log = value;
                PropertyChanged?.Invoke(this, new(nameof(Log)));
            }
        }

        public string CurrentLine
        {
            get => _current_line;
            set
            {
                _current_line = value;
                PropertyChanged?.Invoke(this, new(nameof(CurrentLine)));
            }
        }


        public EventLog() { }


        internal void Clear() => CurrentLine = Log = "";


        internal void AddLine(string format, params object[] args)
        {
            string line = string.Format(format, args);
            Log += _log.Length > 0 ? $"\r\n{line}" : line;
            CurrentLine = line;
        }
    }
}