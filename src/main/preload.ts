// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('api', {
    setTitle: (title: string) => ipcRenderer.send('set-title', title),
    listFiles: (scanPath: string) => ipcRenderer.invoke('list-files', scanPath),
    openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath),
    openFolder: () => ipcRenderer.invoke('open-folder'),
    saveFile: (filePath: string, data: string) => ipcRenderer.invoke('save-file', filePath, data),
    getAccentColor: () => ipcRenderer.invoke('get-accent-color'),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    setSettings: (settings: any) => ipcRenderer.send('set-settings', settings),

    onProjectPathChanged: (cb: (customData: string) => void) => {
        // Deliberately strip event as it includes `sender` (note: Not sure about that, I partly pasted it from somewhere)
        // Note: The first argument is always event, but you can have as many arguments as you like, one is enough for me.
        ipcRenderer.on('projectPathChanged', (event, customData) => cb(customData));
    },

    onProjectTitleChanged: (cb: (customData: string) => void) => {
        // Deliberately strip event as it includes `sender` (note: Not sure about that, I partly pasted it from somewhere)
        // Note: The first argument is always event, but you can have as many arguments as you like, one is enough for me.
        ipcRenderer.on('projectTitleChanged', (event, customData) => cb(customData));
    },

    onTriggerAction: (cb: (actionName: string, data:string) => void) => {
        ipcRenderer.on('triggerAction', (event, actionName, data) => cb(actionName, data));
    }
});