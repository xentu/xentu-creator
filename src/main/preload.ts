// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


const { contextBridge, ipcRenderer } = require('electron');


var dynamicCallback:Function = null;


contextBridge.exposeInMainWorld('api', {
    setTitle: (title: string) => ipcRenderer.send('set-title', title),
    listFiles: (scanPath: string) => ipcRenderer.invoke('list-files', scanPath),
    listImages: () => ipcRenderer.invoke('list-images'),
    openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath),
    createGame: (jsonConfig: string) => ipcRenderer.invoke('create-game', jsonConfig),
    createFile: (filePath: string, extension?:string) => ipcRenderer.invoke('create-file', filePath, extension),
    renameFile: (oldFile:string, newFile:string) => ipcRenderer.invoke('rename-file', oldFile, newFile),
    createFolder: (folderPath: string) => ipcRenderer.invoke('create-folder', folderPath),
    deleteFileOrFolder: (filePath: string) => ipcRenderer.invoke('delete', filePath),
    openImage: (filePath: string, relative: boolean = false) => ipcRenderer.invoke('open-image', filePath, relative),
    newGame: () => ipcRenderer.invoke('new-game'),
    openFolder: () => ipcRenderer.invoke('open-folder'),
    openFolderAt: (path:string) => ipcRenderer.invoke('open-folder-at', path),
    saveFile: (filePath: string, data: string) => ipcRenderer.invoke('save-file', filePath, data),
    saveCopy: (originalPath: string, data: string) => ipcRenderer.invoke('save-copy', originalPath, data),
    getAccentColor: () => ipcRenderer.invoke('get-accent-color'),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    setSettings: (settings: any) => ipcRenderer.send('set-settings', settings),
    setProject: (project: any) => ipcRenderer.send('set-project', project),
    setBuild: (build: any) => ipcRenderer.send('set-build', build),
    refreshBinaries: (overwrite:boolean) => ipcRenderer.invoke('refresh-binaries', overwrite),
    listBinaries: () => ipcRenderer.invoke('list-binaries'),
    showAlert: (message:string) => ipcRenderer.send('show-alert', message),
    getDefaultThemeDark: () => ipcRenderer.invoke('get-default-theme-dark'),
    getDefaultThemeLight: () => ipcRenderer.invoke('get-default-theme-light'),
    navigateTo: (url:string) => ipcRenderer.invoke('navigate-to', url),
    exportTheme: () => ipcRenderer.invoke('export-theme'),
    importTheme: () => ipcRenderer.invoke('import-theme'),
    execCmd: (cmd:string) => ipcRenderer.invoke('exec-cmd', cmd),
    exportGame: (platform:string, openFolder:boolean) => ipcRenderer.invoke('export-game', platform, openFolder),


    /* menu ipc */
    /* these are dip methods. A dip method sends a signal through the IPC
     * meant to be bounced back top the app.tsx. For example menu-save-copy
     * makes the ipc trigger an action called save-copy. This allows various
     * parts of the react app to communicate via the IPC. It's crude but works.
     */
    menuCloseProject:    () => ipcRenderer.send('menu-close'),
    menuSave:            () => ipcRenderer.send('menu-save'),
    menuSaveCopy:        () => ipcRenderer.send('menu-save-copy'),
    menuSaveAll:         () => ipcRenderer.send('menu-save-all'),
    menuGameProperties:  () => ipcRenderer.send('menu-game-props'),
    menuReveal:          () => ipcRenderer.send('menu-reveal'),
    menuExport:          () => ipcRenderer.send('menu-export'),
    menuExit:            () => ipcRenderer.send('menu-exit'),
    menuUndo:            () => ipcRenderer.send('menu-undo'),
    menuRedo:            () => ipcRenderer.send('menu-redo'),
    menuCut:             () => ipcRenderer.send('menu-cut'),
    menuCopy:            () => ipcRenderer.send('menu-copy'),
    menuPaste:           () => ipcRenderer.send('menu-paste'),
    menuDelete:          () => ipcRenderer.send('menu-delete'),
    menuSelectAll:       () => ipcRenderer.send('menu-select-all'),
    menuRun:             () => ipcRenderer.send('menu-run'),
    menuRunWithoutDebug: () => ipcRenderer.send('menu-run-wo-debug'),
    menuStop:            () => ipcRenderer.send('menu-stop'),
    menuSidebar:         () => ipcRenderer.send('menu-sidebar'),
    menuStatusBar:       () => ipcRenderer.send('menu-status-bar'),
    menuConsole:         () => ipcRenderer.send('menu-console'),
    menuActualSize:      () => ipcRenderer.send('menu-actual-size'),
    menuZoomIn:          () => ipcRenderer.send('menu-zoom-in'),
    menuZoomOut:         () => ipcRenderer.send('menu-zoom-out'),
    menuDevTools:        () => ipcRenderer.send('menu-dev-tools'),
    menuThemeEditor:     () => ipcRenderer.send('menu-theme-editor'),
    menuFullScreen:      () => ipcRenderer.send('menu-fullscreen'),
    menuNewFile:         () => ipcRenderer.send('menu-new-file'),
    menuNewFolder:       () => ipcRenderer.send('menu-new-folder'),
    menuOptions:         () => ipcRenderer.send('menu-options'),
    menuClearConsole:    () => ipcRenderer.send('menu-clear-console'),
    menuHelp:            () => ipcRenderer.send('menu-help'),
    menuDocs:            () => ipcRenderer.send('menu-docs'),
    /* menu ipc */
    

    onProjectPathChanged: (cb: (customData: string) => void) => {
        // Deliberately strip event as it includes `sender` (note: Not sure about that, I partly pasted it from somewhere)
        // Note: The first argument is always event, but you can have as many arguments as you like, one is enough for me.
        ipcRenderer.on('projectPathChanged', (event, customData) => cb(customData));
    },

    onProjectChanged: (cb: (customData: string) => void) => {
        ipcRenderer.on('projectChanged', (event, customData) => cb(JSON.parse(customData)));
    },

    onBuildChanged: (cb: (customData: string) => void) => {
        ipcRenderer.on('buildChanged', (event, customData) => cb(JSON.parse(customData)));
    },

    onTriggerAction: (cb: (actionName: string, data:string) => void) => {
        ipcRenderer.on('triggerAction', (event, actionName, data) => cb(actionName, data));
    },

    onConsoleData: (cb: (data:string) => void) => {
        ipcRenderer.on('consoleData', (event, data) => cb(data));
    },


    /* -- pick image functionality ----------------------------------------- */


    pickImage: (cb:Function) => {
        dynamicCallback = cb;
        ipcRenderer.invoke('pick-image');
    },


    finishPickImage: (result:string) => {
        if (dynamicCallback != null) {
            dynamicCallback(result);
            dynamicCallback = null;
        }
    },


    /* -- confirm functionality -------------------------------------------- */


    showConfirm: (message:string, cb:Function) => {
        dynamicCallback = cb;
        ipcRenderer.invoke('show-confirm', message);
    },

    finishConfirm: (result:boolean) => {
        if (dynamicCallback != null) {
            dynamicCallback(result);
            dynamicCallback = null;
        }
    },


    /* -- prompt functionality --------------------------------------------- */

    showPrompt: (message:string, defaultValue:string, cb:Function) => {
        dynamicCallback = cb;
        ipcRenderer.invoke('show-prompt', message, defaultValue);
    },

    finishPrompt: (result:string) => {
        if (dynamicCallback != null) {
            dynamicCallback(result);
            dynamicCallback = null;
        }
    },
    
});