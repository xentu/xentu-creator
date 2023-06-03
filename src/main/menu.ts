//const { app, Menu, MenuItemConstructorOptions, shell } = require('electron')
import { app, BrowserWindow, Menu, MenuItemConstructorOptions, dialog, shell } from "electron";

const isMac = process.platform === 'darwin';


class XentuCreatorMenu {
  private Owner: any;
  private TheMenu: Electron.Menu;

  constructor(owner: any) {
    this.Owner = owner;
    this.TheMenu = Menu.buildFromTemplate(
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
        {
          label: '&File',
          submenu: [
            { label: 'New Game', accelerator: 'Ctrl+N', click: async () => this.triggerAction('new-game') },
            { label: 'Open Project...', accelerator: 'Ctrl+O', click: async () => {
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
            { label: 'Close Project', id: 'MenuFileClose', click: async () => this.triggerAction('close-project') },
            { type: 'separator' },
            { label: 'Save', id: 'MenuFileSave', accelerator: 'Ctrl+S', click: async () => this.triggerAction('save') },
            { label: 'Save As...', id: 'MenuFileSaveAs', accelerator: 'Ctrl+Shift+A', click: async () => this.triggerAction('save-as') },
            { label: 'Save All', id: 'MenuFileSaveAll', accelerator: 'Ctrl+Shift+S', click: async () => this.triggerAction('save-all') },
            { type: 'separator' },
            { label: 'Game Properties', id: 'MenuFileProperties', click: async () => this.triggerAction('game-properties') },
            { label: 'Reveal In Explorer', id: 'MenuFileReveal', click: async () => this.triggerAction('reveal-in-explorer') },
            { label: 'Export...', id: 'MenuFileExport', click: async () => this.triggerAction('export-game') },
            { type: 'separator' },
            isMac ? { role: 'close' } : { role: 'quit' }
          ] as MenuItemConstructorOptions[]
        },
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
              { label: 'Speech', submenu: [
                  { role: 'startSpeaking' },
                  { role: 'stopSpeaking' }
                ]
              }
            ] : [
              { role: 'delete' },
              { type: 'separator' },
              /* { role: 'selectAll' } */
              { label: 'Select All', accelerator: 'Ctrl+A', click: async() => this.triggerAction('select-all') }
            ]) as MenuItemConstructorOptions[]
          ]
        },
        {
          label: '&Run', id: 'MenuRun',
          submenu: [
            { label: 'Start Debugging', accelerator: 'F5', click: async () => this.triggerAction('start-debug') },
            { label: 'Run Without Debugging', accelerator: 'F6', click: async () => this.triggerAction('start-without-debug') }
          ]
        },
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
        {
          label: '&Tools', id: 'MenuTools',
          submenu: [
            { label: 'Options', accelerator: 'F8', click: async () => this.triggerAction('options') },
            { label: 'Clear Console', click: async () => this.triggerAction('clear-console') }
          ]
        },
        // { role: 'windowMenu' }
        {
          role: 'help',
          label: '&Help',
          submenu: [
            { label: 'Learn More', click: async () => await shell.openExternal('https://electronjs.org') }
          ]
        }
      ]
    )
  
    Menu.setApplicationMenu(this.TheMenu);
  }


  private triggerAction(action: string) {
    const window = BrowserWindow.getAllWindows()[0];
    window.webContents.send('triggerAction', action);
    //console.log('triggerAction' + action);
  }


  /**
	 * Set weather the main menu is in a disabled state (project not open).
	 */
	public setMenuDisabled(disabled: boolean): void {
		const ids = ['MenuFileClose', 'MenuFileSave', 'MenuFileSaveAs', 
						 'MenuFileSaveAll', 'MenuFileProperties', 'MenuFileReveal',
						 'MenuFileExport', 'MenuEdit', 'MenuRun'
						];
		const menu = Menu.getApplicationMenu();
		ids.forEach(id => {
			menu.getMenuItemById(id).enabled = !disabled;
		});
	}
}

export default XentuCreatorMenu;