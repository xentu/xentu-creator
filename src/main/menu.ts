//const { app, Menu, MenuItemConstructorOptions, shell } = require('electron')
import { app, BrowserWindow, Menu, MenuItemConstructorOptions, dialog, shell } from "electron";

const isMac = process.platform === 'darwin';

const menu = Menu.buildFromTemplate(
  [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []) as MenuItemConstructorOptions[],
    // { role: 'fileMenu' }
    {
      label: '&File',
      submenu: [
        {
          label: 'New Game',
          accelerator: 'Ctrl+N',
          click: async () => {
            console.log('debug settings clicked');
          }
        },
        {
          label: 'Open Project...',
          accelerator: 'Ctrl+O',
          click: async () => {
            const window = BrowserWindow.getAllWindows()[0];
            dialog.showOpenDialog(window, { properties: ['openDirectory'] }).then(result => {
              if (result.canceled == false) {
                const selectedPath = result.filePaths[0];
                window.webContents.send('pathChanged', selectedPath);
              }
            }).catch(err => { console.log(err) });
          }
        },
        { type: 'separator' },
        { label: 'Close Project', id: 'MenuFileClose', click: async () => {
            console.log('close project clicked');
          }
        },
        { type: 'separator' },
        { label: 'Save', id: 'MenuFileSave', accelerator: 'Ctrl+S', click: async () => {
            const window = BrowserWindow.getAllWindows()[0];
            window.webContents.send('triggerSave');
          }
        },
        { label: 'Save As...', id: 'MenuFileSaveAs', accelerator: 'Ctrl+Shift+A', click: async () => {
            console.log('save as clicked');
          }
        },
        { label: 'Save All', id: 'MenuFileSaveAll', accelerator: 'Ctrl+Shift+S', click: async () => {
            console.log('save all clicked');
          }
        },
        { type: 'separator' },
        { label: 'Game Properties', id: 'MenuFileProperties', click: async () => {
            console.log('game properties clicked');
          }
        },
        { label: 'Reveal In Explorer', id: 'MenuFileReveal', click: async () => {
            console.log('reveal in explorer clicked');
          }
        },
        { label: 'Export...', id: 'MenuFileExport', click: async () => {
            console.log('export clicked');
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ] as MenuItemConstructorOptions[]
    },
    // { role: 'editMenu' }
    {
      label: '&Edit', id: 'MenuEdit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ]) as MenuItemConstructorOptions[]
      ]
    },
    // { role: 'runMenu' }
    {
      label: '&Run', id: 'MenuRun',
      submenu: [
        {
          label: 'Start Debugging',
          accelerator: 'F5',
          click: async () => {
            console.log('start debugging clicked');
          }
        },
        {
          label: 'Run Without Debugging',
          accelerator: 'F6',
          click: async () => {
            console.log('run without debugging clicked');
          }
        },
        /* { type: 'separator' },
        {
          label: 'Debug Settings...',
          accelerator: 'F7',
          click: async () => {
            console.log('debug settings clicked');
          }
        } */
      ]
    },
    // { role: 'viewMenu' }
    {
      label: '&View',
      submenu: [
        //{ role: 'reload' },
        //{ role: 'forceReload' },
        { type: 'checkbox', label: 'Sidebar', checked: true, accelerator: 'Ctrl+B' },
        { type: 'checkbox', label: 'Status Bar', checked: true, accelerator: 'Ctrl+Shift+B' },
        { type: 'checkbox', label: 'Console', checked: true, accelerator: 'Ctrl+Shift+C' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { role: 'togglefullscreen' }
      ]
    },
    // { role: 'toolsMenu' }
    {
      label: '&Tools', id: 'MenuTools',
      submenu: [
        {
          label: 'Options',
          accelerator: 'F8',
          click: async () => {
            console.log('options clicked');
          }
        },
        {
          label: 'Clear Console',
          click: async () => {
            console.log('clear console clicked');
          }
        }
      ]
    },
    // { role: 'windowMenu' }
    {
      role: 'help',
      label: '&Help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://electronjs.org')
          }
        }
      ]
    }
  ]
)

Menu.setApplicationMenu(menu);