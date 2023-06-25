import { app, BrowserWindow, Menu, dialog, ipcMain, systemPreferences } from 'electron';
import { spawn } from "node:child_process";
import XentuCreatorMenu from './menu';

const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');
const decompress = require('decompress');
const chokidar = require('chokidar');

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;


type GitRelease = {
   assets: Array<any>,
   draft: boolean,
   name: string,
   tag_name: string,
   prerelease: boolean,
	created_at: string
}


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
	app.quit();
}


const ProjectTemplate = () => {
	return  {
		"game": {
			"title": "Hello World",
			"entry_point": "/game.js",
			"version": "0.0.0",
			"v_sync": true,
			"fullscreen": false,
			"update_frequency": 60,
			"draw_frequency": 60,
			"window": { "width": 800,	"height": 600 },
			"viewport": { "width": 500, "height": 500, "mode": 1 },
			"audio": {
				"frequency": 44100,
				"channels": 2,
				"depth": 16,
				"codecs": ["wav", "ogg", "flac"]
			}
		}
	};
};


class XentuCreatorApp {
	mainMenu: XentuCreatorMenu;
	mainWindow: BrowserWindow;
	theSettings: any = {};
	theProject: any = {}; //: XentuProject;
	projectPath: string = "";
	childProcess?: any;
	fileWatcher?: any;
	t: number = 55;


	constructor() {
		// setup variables.
		this.mainMenu = new XentuCreatorMenu(this);
		this.theProject = null;

		// hook window events.
		//app.on('ready', this.createWindow);
		app.on('window-all-closed', async () => {
			if (process.platform !== 'darwin') {
				app.quit();
			}
		});
		app.on('activate', () => {
			if (BrowserWindow.getAllWindows().length === 0) {
				this.createWindow();
			}
		});

		// setup the api.
		ipcMain.on('set-title', this.handleSetTitle);
		ipcMain.handle('list-files', this.handleListFiles);
		ipcMain.handle('open-file', this.handleOpenFile);
		ipcMain.handle('create-file', this.handleCreateFile);
		ipcMain.handle('create-folder', this.handleCreateFolder);
		ipcMain.handle('delete', this.handleDeleteFileOrFolder);
		ipcMain.handle('open-image', this.handleOpenImage);
		ipcMain.handle('open-folder', (e:any) => { this.handleOpenFolder(e) });
		ipcMain.handle('save-file', this.handleSaveFile);
		ipcMain.handle('refresh-binaries', this.handleRefreshBinaries);
		ipcMain.handle('list-binaries', this.handleListBinaries);
		ipcMain.handle('get-accent-color', this.handleGetAccentColor);
		ipcMain.handle('get-settings', () => { return this.handleGetSettings() });
		ipcMain.on('set-settings', (e:any, newSettings:any) => { this.handleSetSettings(e, newSettings) });
		ipcMain.on('set-project', (e:any, newProject:any) => { this.handleSetProject(e, newProject) });

		ipcMain.handle('new-game', (e:any) => { this.handleNewGame(e) });
		ipcMain.on('menu-close', this.handleMenuClose);
	}


	// #########################################################################
	// Functions
	// #########################################################################


	/**
	 * Creates a new electron window.
	 */
	createWindow(): void {
		// Create the browser window.
		this.mainWindow = new BrowserWindow({
			height: 660,
			width: 970,
			minWidth: 620,
			minHeight: 430,
			icon: path.join(__dirname, '/../renderer/images/xentu-icon.ico'),
			webPreferences: {
				preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
			},
		});

		var dark = this.theSettings?.editor?.colorTheme == 'dark';
		this.mainWindow.setBackgroundColor(dark ? '#333333' : '#ffffff');
		this.mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
		
		//setMenuDisabled(true);
		this.mainWindow.webContents.openDevTools();
	}


	/**
	 * Loads settings from a JSON file.
	 */
	async loadSettings() {
		const appPath = app.getPath('userData');
		console.log("AppPath: ", appPath);
		const settingsFile = path.join(appPath, 'settings.json');
		const exists = await fs.pathExists(settingsFile);

		let settings = {
			editor: {
				colorTheme: 'dark',
				fontFamily: 'default',
				fontSize: 14,
				enableMinimap: true,
				enableCodeLens: true,
				enableLineNumbers: true
			},
			theme: {
				dark: {
					mainBackground: "#3d3d3d",
					mainText: "#ffffff",
					sidebarBackground: "#2b2b2b",
					sidebarText: "#ffffff",
					sidebarItemBackground: "#000000",
					sidebarItemText: "#ffffff",
					editorBackground: "#212121",
					editorText: "#ffffff",
					footerBackground: "#171717",
					footerText: "#ffffff",
					sidebarHoverBackground: "#383838",
					sidebarHoverText: "#ffffff",
					sidebarActiveBackground: "#7a3a98",
					terminalBackground: "#000000",
					terminalText: "#ffffff"
				},
				light: {
					mainBackground: "#4d88fe",
					mainText: "#ffffff",
					sidebarBackground: "#d2e1fe",
					sidebarText: "#000000",
					sidebarItemBackground: "#8297bf",
					sidebarItemText: "#ffffff",
					editorBackground: "#ffffff",
					editorText: "#000000",
					footerBackground: "#d2e1fe",
					footerText: "#000000",
					sidebarHoverBackground: "#9ebeff",
					sidebarHoverText: "#3744a9",
					sidebarActiveBackground: "#4d88fe",
					sidebarActiveText: "#ffffff",
					terminalBackground: "#ffffff",
					terminalText: "#000000"
				}
			},
			debugging: {
				enableDebugging: true,
				mainBinary: '${userData}/binaries/win_x64/xentu_debug.exe',
				extraArguments: '',
				binaryOptions: [
					{ platform: 'Windows', arch: 'x64', version: '0.0.4' },
					{ platform: 'Linux/FreeBSD', arch: 'x64', version: '0.0.4' },
					{ platform: 'Mac OS', arch: 'x64', version: '0.0.4' }
				]
			}
		};

		if (exists) {
			settings = await fs.readJson(settingsFile);
		}

		this.theSettings = settings;
	}


	async saveSettings() {
		const appPath = app.getPath('userData');
		const settingsFile = path.join(appPath, 'settings.json');
		await fs.writeJson(settingsFile, this.theSettings, { spaces: '\t' });
	}

	async saveProject() {
		const projectFile = path.join(this.projectPath, 'game.json');
		await fs.writeJson(projectFile, this.theProject, { spaces: '\t' });
	}

	async downloadFile(theUrl:string, theDest:string):Promise<void> {
		return new Promise((resolve, reject):void => {
			const outStream = fs.createWriteStream(theDest);
			axios({ method: "get", url: theUrl, responseType: "stream" })
				.then(function (response:any) {
					response.data.pipe(outStream);
					outStream.on("finish", () => {
						outStream.close();
						resolve();
				  	});
		  		})
				.catch((err:any) => {
					// do something with the error
					console.log({ err });
					reject(err.message);
				});
		});
	};


	async extractZip(theFile:string, thePath:string):Promise<void> {
		return await decompress(theFile, thePath);
	}

	// #########################################################################
	// API event handlers.
	// #########################################################################


	handleSetTitle(event:any, title:string): void {
		const webContents = event.sender;
		const win = BrowserWindow.fromWebContents(webContents);
		win.setTitle(title);
	}


	handleListFiles(event:any, scanPath: string) {
		const files = fs.readdirSync( scanPath );
		return files.map( (filename:String) => {
			  const filePath = path.resolve( scanPath, filename );
			  const fileStats = fs.statSync( filePath );
			  const isDirectory = fileStats.isDirectory();
			  return {
					name: filename,
					path: filePath,
					directory: isDirectory,
					ext: isDirectory ? 'folder' : filename.split('.').pop(),
					size: Number( fileStats.size / 1000 ).toFixed( 1 ), // kb
			  };
		});
	}

	handleGetAccentColor() {
		return systemPreferences.getAccentColor();
	}

	handleGetSettings() {
		return this.theSettings;
	}

	async handleSetSettings(event:any, newSettings: any) {
		this.theSettings = newSettings;
		await this.saveSettings();
	}

	async handleSetProject(event:any, newProject: any) {
		this.theProject = newProject;

		const window = BrowserWindow.getAllWindows()[0];
		const gameName = this.theProject?.game?.title ?? 'Untitled';
		window.setTitle(gameName + " - Xentu Creator");

		await this.saveProject();
	}

	async handleOpenFile(event:any, filePath: string) {
		const theData = await fs.readFile(filePath, 'utf-8');
		const ext = filePath.split('.').pop();
		let lang = 'text';
	
		switch (ext) {
			case 'js': lang = 'javascript'; break;
			case 'json': lang = 'text'; break;
			case 'toml': lang = 'toml'; break;
			case 'lua': lang = 'lua'; break;
			case 'py': lang = 'python'; break;
			case 'xml': lang = 'xml'; break;
		}
	
		return JSON.stringify({
			label: path.basename(filePath),
			lang: lang,
			path: filePath,
			data: theData
		});
	}


	async handleCreateFile(event:any, filePath: string) {
		await fs.outputFile(filePath, '', 'utf-8');
		return `file created (${filePath}).`;
	}

	

	async handleCreateFolder(event:any, folderPath: string) {
		await fs.ensureDir(folderPath);
		return `folder created (${folderPath}).`;
	}


	async handleDeleteFileOrFolder(event:any, filePath: string) {
		if (fs.lstatSync(filePath).isDirectory()) {
			await fs.rm(filePath, { recursive: true, force: true });
			return `folder deleted (${filePath}).`;
		}
		else {
			await fs.remove(filePath);
			return `file deleted (${filePath}).`;
		}
	}

	
	async handleOpenImage(event:any, filePath:string) {
		const theData = await fs.readFile(filePath, "base64");
		const ext = filePath.split('.').pop();
		return JSON.stringify({
			label: path.basename(filePath),
			path: filePath,
			data: `data:image/${ext};base64,${theData}`
		});
	}


	async handleOpenFolder(event:any) {
		const window = BrowserWindow.getAllWindows()[0];

		const dlgResult = await dialog.showOpenDialog(window, { properties: ['openDirectory'] });
		if (dlgResult.canceled == false) {
			// read the selected path.
			const selectedPath = dlgResult.filePaths[0];
			// read the project file if one exists.
			const projectFile = path.join(selectedPath, 'game.json');
			const projectFileExists = await fs.pathExists(projectFile);

			if (projectFileExists) {
				this.theProject = await fs.readJson(projectFile); // await XentuProject.Load(projectFile);
				const gameName = this.theProject?.game?.title ?? 'Untitled';
				window.setTitle(gameName + " - Xentu Creator");
			}
			else {
				this.theProject = ProjectTemplate();
				window.setTitle('Xentu Creator');
			}

			this.fileWatcher = chokidar.watch(selectedPath, {
				ignored: /(^|[\/\\])\../, // ignore dot files
				persistent: true
			});
			this.fileWatcher
			.on('add',			(path:string) => this.triggerFileAction('file-created', path))
			.on('change',		(path:string) => this.triggerFileAction('file-changed', path))
			.on('unlink',		(path:string) => this.triggerFileAction('file-removed', path))
			.on('addDir',		(path:string) => this.triggerFileAction('dir-created', path))
  			.on('unlinkDir',	(path:string) => this.triggerFileAction('dir-removed', path));

			this.projectPath = selectedPath;
			window.webContents.send('projectPathChanged', selectedPath);
			window.webContents.send('projectChanged', JSON.stringify(this.theProject));
			window.webContents.send('triggerAction', 'hide-welcome', null );
		}
	}


	async handleNewGame(event:any) {
		const window = BrowserWindow.getAllWindows()[0];
		window.webContents.send('triggerAction', 'show-new-game', null );
	}

	
	async handleMenuClose(event:any) {
		console.log('handleMenuClose', 'Xentu Creator');
		const webContents = event.sender;
		const win = BrowserWindow.fromWebContents(webContents);
		win.setTitle('Xentu Creator');


		await myCreator.fileWatcher.close(() => console.log('file watcher closed'));
		myCreator.fileWatcher = null;
		myCreator.projectPath = '';
		myCreator.theProject = ProjectTemplate();
		
		win.webContents.send('projectPathChanged', '');
		win.webContents.send('projectChanged', JSON.stringify(this.theProject));
		win.webContents.send('triggerAction', 'close-all', null);
	}


	async handleSaveFile(event:any, filePath: string, data:string) {
		try {
			await fs.outputFile(filePath, data, 'utf-8');
			return JSON.stringify({	success: true,	message: 'Saved!'	});
		}
		catch (err) {
			return JSON.stringify({ success: false, message: err });
	 	}
	}


	async handleListBinaries() {
		let res = '';
		const appPath = app.getPath('userData');
		const releaseFile = path.join(appPath, 'release.json');
		const releaseFileExists = await fs.pathExists(releaseFile);
		if (releaseFileExists) {
			res = await fs.readJson(releaseFile);
		}
		return res;
	}


	async handleRefreshBinaries(event:any, overwrite:boolean) {
		const res = await fetch("https://api.github.com/repos/xentu/xentu-engine/releases");
		const gitReleases : Array<GitRelease> = await res.json();
		let latestRelease = null;

		for (var i=0; i<gitReleases.length; i++) {
			const gitRelease = gitReleases[i];
			if (gitRelease.draft == true) continue;
			if (gitRelease.prerelease == true) continue;
			latestRelease = gitRelease;
			break;
		}

		if (latestRelease == null) {
			return { updated: false, data: gitReleases, message: 'No release available at the moment.' };
		}

		const appPath = app.getPath('userData');
		const releaseFile = path.join(appPath, 'release.json');
		const releaseFileExists = await fs.pathExists(releaseFile);

		if (releaseFileExists && overwrite == false) {
			const currentRelease = await fs.readJson(releaseFile);
			if (currentRelease.tag_name == latestRelease.tag_name) {
				return { updated: false, data: {}, message: 'The latest binaries are already downloaded.' };
			}
			await fs.remove(releaseFile);
		}

		const releaseOut = {
			name: latestRelease.name,
			tag_name: latestRelease.tag_name,
			release_date: latestRelease.created_at,
			binaries: new Array<any>()
		};

		for (var i=0; i<latestRelease.assets.length; i++) {
			const releaseBinary = latestRelease.assets[i];
			let thePlatform = 'windows_x64';
			if (releaseBinary.name.includes('linux_x86')) thePlatform = 'linux_x86';
			if (releaseBinary.name.includes('linux_x64')) thePlatform = 'linux_x64';
			if (releaseBinary.name.includes('macos_x64')) thePlatform = 'macos_x64';

			const outBinary = {
				name: releaseBinary.name,
				platform: thePlatform,
				download_url: releaseBinary.browser_download_url,
				local_path: `${appPath}/binaries/${thePlatform}/`,
				local_file: `${appPath}/binaries/${thePlatform}/${releaseBinary.name}`
			};

			try {
				// make sure directory exists.
				await fs.ensureDir(outBinary.local_path);
				// download the payload for this asset.
				await myCreator.downloadFile(outBinary.download_url, outBinary.local_file);
				// extract it in the folder.
				await myCreator.extractZip(outBinary.local_file, outBinary.local_path);
				// delete the zip file.
				await fs.remove(outBinary.local_file);
				// clean unnecessary info, then add to our release collection.
				delete(outBinary.local_file);
				releaseOut.binaries.push(outBinary);
			}
			catch (error:any) {
				return { updated: false, data: error, message: 'An error occurred when attempting to download a binary.' };
			}
		}

		await fs.writeJson(releaseFile, releaseOut, { spaces: '\t' });
		return { updated: true, data: releaseOut, message: 'The latest version of the engine binaries has been downloaded.' };
	}


	triggerAction(action:string, data:string = null) {
		const window = BrowserWindow.getAllWindows()[0];
		window.webContents.send('triggerAction', action, data);
	}


	triggerFileAction(action:string, data:string = null) {
		const window = BrowserWindow.getAllWindows()[0];
		window.webContents.send('projectPathChanged', this.projectPath);
		window.webContents.send('triggerAction', action, data);
	}


	async stopDebugging() {
		if (myCreator.childProcess != null) {
			myCreator.childProcess.kill('SIGINT');
			myCreator.childProcess = null;
		}
	}


	async beginDebugging() {
		let exePath = '';
		//const exePath = this.theSettings.debugging.mainBinary;
		const window = BrowserWindow.getAllWindows()[0];
		const release:any = await myCreator.handleListBinaries();

		// find the appropriate binary path.
		if (release.binaries) {
			for (var i=0; i<release.binaries.length; i++) {
				var binary = release.binaries[i];
				switch (process.platform) {
					case 'win32':
						if (binary.platform.includes('windows')) {
							exePath = binary.local_path;
							break;
						}
						break;
					case 'darwin':
						if (binary.platform.includes('macos')) {
							exePath = binary.local_path;
							break;
						}
						break;
					case 'linux':
						if (binary.platform.includes('linux')) {
							exePath = binary.local_path;
							break;
						}
						break;
				}
			}
		}

		
		if (exePath == '') {
			window.webContents.send('consoleData', 'error! failed to find an appropriate platform binary folder');
			return;
		}
		
		let exeFile = path.join(exePath, 'xentu_debug.exe');
		if (myCreator.theProject.game.entry_point.includes('.py')) {
			exeFile = path.join(exePath, 'xentu_py_debug.exe');
		}

		if (!await fs.pathExists(exeFile)) {
			window.webContents.send('consoleData', 'error! ' + exeFile + ' does not exist.');
			return;
		}

		const workingDir = this.projectPath;
		this.childProcess = spawn(exeFile, [], { cwd: workingDir });
		window.webContents.send('triggerAction', 'game-started');
		
		this.childProcess.stdout.on('data', (data:any) => {
			window.webContents.send('consoleData', data.toString());
		});
      
		this.childProcess.stderr.on('data', (data:any) => {
			window.webContents.send('consoleData', data.toString());
		});

		this.childProcess.on('exit', (code:any) => {
			window.webContents.send('consoleData', "\r\n$ ");
			window.webContents.send('triggerAction', 'game-stopped');
		});
	}
}


const myCreator = new XentuCreatorApp();


app.on('ready', async function() {
	await myCreator.loadSettings();
	myCreator.createWindow();
	await myCreator.handleRefreshBinaries(null, false);
});