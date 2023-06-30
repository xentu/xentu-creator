import { app, Menu, shell, globalShortcut, ipcMain } from "electron";


class XentuCreatorMenu {
  private Owner: any;

  constructor(owner: any) {
    this.Owner = owner;

    ipcMain.on('menu-close',          (e) => this.Owner.handleMenuClose(e));
    ipcMain.on('menu-save',           (e) => this.Owner.triggerAction('save'));
    ipcMain.on('menu-save-copy',      (e) => this.Owner.triggerAction('save-copy'));
    ipcMain.on('menu-save-all',       (e) => this.Owner.triggerAction('save-all'));
    ipcMain.on('menu-game-props',     (e) => this.Owner.triggerAction('show-game-properties'));
    ipcMain.on('menu-reveal',         (e) => this.Owner.revealInExplorer());
    ipcMain.on('menu-export',         (e) => this.Owner.triggerAction('export-game'));
    ipcMain.on('menu-exit',           (e) => this.Owner.mainWindow.close());
    ipcMain.on('menu-undo',           (e) => this.Owner.mainWindow.webContents.undo());
    ipcMain.on('menu-redo',           (e) => this.Owner.mainWindow.webContents.redo());
    ipcMain.on('menu-cut',            (e) => this.Owner.mainWindow.webContents.cut());
    ipcMain.on('menu-copy',           (e) => this.Owner.mainWindow.webContents.copy());
    ipcMain.on('menu-paste',          (e) => this.Owner.mainWindow.webContents.paste());
    ipcMain.on('menu-delete',         (e) => this.Owner.mainWindow.webContents.delete());
    ipcMain.on('menu-select-all',     (e) => this.Owner.triggerAction('select-all'));
    ipcMain.on('menu-run',            (e) => this.Owner.beginGame(true));
    ipcMain.on('menu-run-wo-debug',   (e) => this.Owner.beginGame(false));
    ipcMain.on('menu-stop',           (e) => this.Owner.stopGame());
    ipcMain.on('menu-run-wo-debug',   (e) => this.Owner.triggerAction('start-without-debug'));
    ipcMain.on('menu-sidebar',        (e) => this.Owner.triggerAction('toggle-sidebar'));
    ipcMain.on('menu-status-bar',     (e) => this.Owner.triggerAction('toggle-statusbar'));
    ipcMain.on('menu-console',        (e) => this.Owner.triggerAction('toggle-console'));
    ipcMain.on('menu-theme-editor',   (e) => this.Owner.triggerAction('toggle-theme-editor'));
    ipcMain.on('menu-actual-size',    (e) => this.Owner.mainWindow.webContents.zoomFactor = 1.0);
    ipcMain.on('menu-zoom-in',        (e) => this.Owner.mainWindow.webContents.zoomFactor = Math.min(this.Owner.mainWindow.webContents.getZoomFactor() + 0.05, 1.5));
    ipcMain.on('menu-zoom-out',       (e) => this.Owner.mainWindow.webContents.zoomFactor = Math.max(this.Owner.mainWindow.webContents.getZoomFactor() - 0.05, 0.8));
    ipcMain.on('menu-dev-tools',      (e) => this.Owner.mainWindow.webContents.openDevTools());
    ipcMain.on('menu-fullscreen',     (e) => this.Owner.mainWindow.setFullScreen(!this.Owner.mainWindow.isFullScreen()));
    ipcMain.on('menu-options',        (e) => this.Owner.triggerAction('show-settings'));
    ipcMain.on('menu-clear-console',  (e) => this.Owner.triggerAction('clear-console'));
    ipcMain.on('menu-help',     async (e) => await shell.openExternal('https://electronjs.org'));

    Menu.setApplicationMenu(null);
  }
}

export default XentuCreatorMenu;