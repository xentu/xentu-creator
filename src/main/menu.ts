//const { app, Menu, MenuItemConstructorOptions, shell } = require('electron')
import { app, Menu, shell, globalShortcut, ipcMain } from "electron";

const isMac = process.platform === 'darwin';


class XentuCreatorMenu {
  private Owner: any;
  private TheMenu: Electron.Menu;

  constructor(owner: any) {
    this.Owner = owner;

    ipcMain.on('menu-close',          () => this.Owner.triggerAction('close-project'));
    ipcMain.on('menu-save',           () => this.Owner.triggerAction('save'));
    ipcMain.on('menu-save-copy',      () => this.Owner.triggerAction('save-as'));
    ipcMain.on('menu-save-all',       () => this.Owner.triggerAction('save-all'));
    ipcMain.on('menu-game-props',     () => this.Owner.triggerAction('show-game-properties'));
    ipcMain.on('menu-reveal',         () => this.Owner.triggerAction('reveal-in-explorer'));
    ipcMain.on('menu-export',         () => this.Owner.triggerAction('export-game'));
    ipcMain.on('menu-exit',           () => this.Owner.mainWindow.close());
    ipcMain.on('menu-undo',           () => this.Owner.mainWindow.webContents.undo());
    ipcMain.on('menu-redo',           () => this.Owner.mainWindow.webContents.redo());
    ipcMain.on('menu-cut',            () => this.Owner.mainWindow.webContents.cut());
    ipcMain.on('menu-copy',           () => this.Owner.mainWindow.webContents.copy());
    ipcMain.on('menu-paste',          () => this.Owner.mainWindow.webContents.paste());
    ipcMain.on('menu-delete',         () => this.Owner.mainWindow.webContents.delete());
    ipcMain.on('menu-select-all',     () => this.Owner.triggerAction('select-all'));
    ipcMain.on('menu-run',            () => this.Owner.beginDebugging());
    ipcMain.on('menu-stop',           () => this.Owner.stopDebugging());
    ipcMain.on('menu-run-wo-debug',   () => this.Owner.triggerAction('start-without-debug'));
    ipcMain.on('menu-sidebar',        () => this.Owner.triggerAction('toggle-sidebar'));
    ipcMain.on('menu-status-bar',     () => this.Owner.triggerAction('toggle-statusbar'));
    ipcMain.on('menu-console',        () => this.Owner.triggerAction('toggle-console'));
    ipcMain.on('menu-theme-editor',   () => this.Owner.triggerAction('toggle-theme-editor'));
    ipcMain.on('menu-actual-size',    () => this.Owner.mainWindow.webContents.zoomFactor = 1.0);
    ipcMain.on('menu-zoom-in',        () => this.Owner.mainWindow.webContents.zoomFactor = Math.min(this.Owner.mainWindow.webContents.getZoomFactor() + 0.05, 1.5));
    ipcMain.on('menu-zoom-out',       () => this.Owner.mainWindow.webContents.zoomFactor = Math.max(this.Owner.mainWindow.webContents.getZoomFactor() - 0.05, 0.8));
    ipcMain.on('menu-dev-tools',      () => this.Owner.mainWindow.webContents.openDevTools());
    ipcMain.on('menu-fullscreen',     () => this.Owner.mainWindow.setFullScreen(!this.Owner.mainWindow.isFullScreen()));
    ipcMain.on('menu-options',        () => this.Owner.triggerAction('show-settings'));
    ipcMain.on('menu-clear-console',  () => this.Owner.triggerAction('clear-console'));
    ipcMain.on('menu-help',     async () => await shell.openExternal('https://electronjs.org'));

    /* app.whenReady().then(() => {
      globalShortcut.register('Ctrl+N',       () => owner.newGame());
      globalShortcut.register('Ctrl+O',       () => owner.openFolder());
      globalShortcut.register('Ctrl+S',       () => owner.triggerAction('save'));
      globalShortcut.register('Ctrl+Shift+A', () => owner.triggerAction('save-as'));
      globalShortcut.register('Ctrl+Shift+S', () => owner.triggerAction('save-all'));
      globalShortcut.register('F1',     async () => await shell.openExternal('https://electronjs.org'));
      globalShortcut.register('F5',           () => owner.beginDebugging());
      globalShortcut.register('F6',           () => owner.triggerAction('start-without-debug'));
      globalShortcut.register('F8',           () => owner.triggerAction('show-settings'));
      globalShortcut.register('F11',          () => this.Owner.mainWindow.setFullScreen(!this.Owner.mainWindow.isFullScreen()));
      globalShortcut.register('Ctrl+B',       () => owner.triggerAction('toggle-sidebar'));
      globalShortcut.register('Ctrl+Shift+B', () => owner.triggerAction('toggle-statusbar'));
      globalShortcut.register('Ctrl+Shift+C', () => owner.triggerAction('toggle-console'));
    }); */

    Menu.setApplicationMenu(null); //this.TheMenu);
  }
}

export default XentuCreatorMenu;