import { app, shell, BrowserWindow, Menu, dialog, ipcMain, systemPreferences } from 'electron';
import { spawn, SpawnOptionsWithoutStdio } from "node:child_process";
import XentuCreatorMenu from './menu';
import XentuDefaults from './defaults';

const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');
const decompress = require('decompress');
const chokidar = require('chokidar');
const JSZip = require("jszip");

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


type BuildSchema = {
	exe_name: string, /* the executable name */
	icon: string, /* the icon to embed (win) */
	pre_build_commands: Array<string>, /* any commands to run before build (tsc etc..) */
	assets: {
		pack: boolean, /* pack assets into game.dat? */
		ignores: Array<string> /* list of file/folder ignore rules for assets, eg "*.json" */
	}
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


const BuildTemplate = (isTypeScript:boolean = false) => {
	const commands = [] as Array<string>;
	const ignores = [
		".git",
		".gitignore",
		"editor.json"
	];

	if (isTypeScript) {
		commands.push('tsc');
		ignores.push('tsconfig.json');
	}

	return {
		"exe_name": "untitled", /* the executable name */
		"icon": "", /* the icon to embed (win) */
		"pre_build_commands": commands, /* any commands to run before build (tsc etc..) */
		"assets": {
			"pack": false, /* pack assets into game.dat? */
			/* list of file/folder ignore rules for assets, eg "*.json" */
			"ignores": ignores
		}
	}
};


class XentuCreatorApp {
	mainMenu: XentuCreatorMenu;
	mainWindow: BrowserWindow;
	theSettings: any = {};
	theProject: any = {}; //: XentuProject;
	theBuild: BuildSchema = BuildTemplate(); //: XentuBuild;
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
		ipcMain.on('show-alert', this.handleShowAlert);
		ipcMain.handle('show-confirm', this.handleShowConfirm);
		ipcMain.handle('show-prompt', this.handleShowPrompt);
		ipcMain.on('set-settings', (e:any, newSettings:any) => { this.handleSetSettings(e, newSettings) });
		ipcMain.on('set-project', (e:any, newProject:any) => { this.handleSetProject(e, newProject) });
		ipcMain.on('set-build', (e:any, newBuild:any) => { this.handleSetBuild(e, newBuild) });
		ipcMain.handle('list-files', this.handleListFiles);
		ipcMain.handle('list-images', this.handleListImages);
		ipcMain.handle('open-file', this.handleOpenFile);
		ipcMain.handle('create-game', this.handleCreateGame);
		ipcMain.handle('create-file', this.handleCreateFile);
		ipcMain.handle('rename-file', this.handleRenameFile);
		ipcMain.handle('create-folder', this.handleCreateFolder);
		ipcMain.handle('delete', this.handleDeleteFileOrFolder);
		ipcMain.handle('open-image', this.handleOpenImage);
		ipcMain.handle('open-folder', this.handleOpenFolder);
		ipcMain.handle('open-folder-at', this.handleOpenFolderAt);
		ipcMain.handle('save-file', this.handleSaveFile);
		ipcMain.handle('save-copy', this.handlePromptSaveCopy);
		ipcMain.handle('refresh-binaries', this.handleRefreshBinaries);
		ipcMain.handle('list-binaries', this.handleListBinaries);
		ipcMain.handle('get-accent-color', this.handleGetAccentColor);
		ipcMain.handle('get-settings', () => { return this.handleGetSettings() });
		ipcMain.handle('get-default-theme-dark', () => { return XentuDefaults.DarkThemeJson() } );
		ipcMain.handle('get-default-theme-light', () => { return XentuDefaults.LightThemeJson() } );
		ipcMain.handle('export-theme', this.handleExportTheme);
		ipcMain.handle('import-theme', this.handleImportTheme);
		ipcMain.handle('new-game', (e:any) => { this.handleNewGame(e) });
		ipcMain.handle('navigate-to', this.handleNavigateTo);
		ipcMain.handle('pick-image', this.handlePickImage);
		ipcMain.handle('exec-cmd', (e:any, cmd:string) => this.handleExecCmd(cmd));
		ipcMain.handle('export-game', (e:any, platform:string, openFolder:boolean) => this.handleExportGame(platform, openFolder));
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
			height: 720,
			width: 1100,
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
		//this.mainWindow.webContents.openDevTools();
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
				locale: 'en',
				colorTheme: 'dark',
				fontFamily: 'default',
				fontSize: 14,
				enableMinimap: true,
				enableCodeLens: true,
				enableLineNumbers: true
			},
			theme: {
				dark: XentuDefaults.DarkTheme(),
				light: XentuDefaults.LightTheme()
			},
			debugging: {
				enableDebugging: true,
				alternateBinaryPath: '',
				extraArguments: '',
			},
			recentProjects: new Array<string>()
		};

		if (exists) {
			settings = await fs.readJson(settingsFile);
		}

		if (typeof settings.recentProjects === 'undefined') {
			settings.recentProjects = new Array<string>();
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


	async saveBuild() {
		const buildFile = path.join(this.projectPath, 'editor.json');
		await fs.writeJson(buildFile, this.theBuild, { spaces: '\t' });
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
	}


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


	handleShowAlert(event: any, message:string): void {
		myCreator.triggerAction('alert', message);
		/*const win = BrowserWindow.fromWebContents(webContents);
		const webContents = event.sender;
		dialog.showMessageBox(win, {
			message: message
		}); */
	}


	async handleNavigateTo(event:any, url:string) {
		await shell.openExternal(url);
	}


	async handleShowConfirm(event: any, message:string) {
		myCreator.triggerAction('confirm', message);
	}


	async handleShowPrompt(event: any, message:string, defaultValue:string) {
		const data = JSON.stringify({ message:message, defaultValue:defaultValue });
		myCreator.triggerAction('prompt', data);
	}


	async handlePickImage(event: any) {
		myCreator.triggerAction('pick-image');
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


	handleListImages(event:any) {
		return myCreator.scanForImages(myCreator.projectPath);
	}


	scanForImages(dir:string) {
		var result = Array<string>();
		const files = fs.readdirSync(dir);
		for (const filename of files) {
			const filePath = path.resolve( dir, filename );
			const fileStats = fs.statSync( filePath );
			if (fileStats.isDirectory()) {
				for (const fileSub of myCreator.scanForImages(filePath)) {
					result.push(fileSub);
				}
			}
			else {
				const ext = filename.split('.').pop().toLowerCase();
				if (['jpg', 'png', 'gif'].includes(ext)) {
					let p = filePath.substring(myCreator.projectPath.length);
					p = (String.raw`${p}`).replace(/\\/g, "/");
					result.push(p);
				}
			}
		}
		return result;
	}


	scanForExportAssets(dir:string) {
		var result = Array<string>();
		const ignores = this.theBuild.assets.ignores;
		const files = fs.readdirSync(dir);
		for (const filename of files) {
			const filePath = path.resolve( dir, filename );
			const fileStats = fs.statSync( filePath );
			if (ignores.includes(filename)) continue;

			if (fileStats.isDirectory()) {
				for (const fileSub of myCreator.scanForExportAssets(filePath)) {
					result.push(fileSub);
				}
			}
			else {
				result.push(filePath);
			}
		}
		return result;
	}


	handleGetAccentColor() {
		let res = '#ffff00';
		try {
			res = systemPreferences.getAccentColor();
		}
		catch {}
		return res;
	}


	handleGetSettings() {
		return this.theSettings;
	}


	async handleExportTheme() {
		const window = BrowserWindow.getAllWindows()[0];
		const dlgResult = await dialog.showSaveDialog(window, { 
			title: 'Choose where to save your exported theme...',
			defaultPath: 'my-theme.json',
			filters: [
				{ name: 'JSON File(s)', extensions: ['json'] }
			]
		});

		if (dlgResult.canceled == true) {
			return JSON.stringify({ 'success': false, 'message': 'Cancelled' });
		}

		await fs.writeJson(dlgResult.filePath, myCreator.theSettings.theme, { spaces: '\t' });
		return JSON.stringify({ 'success': true });
	}


	async handleImportTheme() {
		const window = BrowserWindow.getAllWindows()[0];
		const dlgResult = await dialog.showOpenDialog(window, { 
			title: 'Choose the json file to import...',
			properties: ['openFile'],
			filters: [
				{ name: 'JSON File(s)', extensions: ['json'] }
			]
		});

		if (dlgResult.canceled == true) {
			return JSON.stringify({ 'success': false, 'message': 'Cancelled' });
		}

		// TODO: validate the JSON.
		const theme = await fs.readJson(dlgResult.filePaths[0]);

		return JSON.stringify({ 'success': true, 'theme': theme });
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


	async handleSetBuild(event:any, newBuild:any) {
		this.theBuild = newBuild;
		await this.saveBuild();
	}


	async handleOpenFile(event:any, filePath: string) {
		const theData = await fs.readFile(filePath, 'utf-8');
		const ext = filePath.split('.').pop();
		let lang = 'text';
	
		switch (ext) {
			case 'js': lang = 'javascript'; break;
			case 'ts': lang = 'typescript'; break;
			case 'json': lang = 'json'; break;
			case 'toml': lang = 'toml'; break;
			case 'lua': lang = 'lua'; break;
			case 'py': lang = 'python'; break;
			case 'xml': lang = 'xml'; break;
			case 'sh': lang = 'shell'; break;
			case 'md': lang = 'markdown'; break;
		}
	
		return JSON.stringify({
			label: path.basename(filePath),
			lang: lang,
			path: filePath,
			data: theData
		});
	}


	async handlePromptSaveCopy(event:any, originalPath: string, data:string) {
		const window = BrowserWindow.getAllWindows()[0];
		const dlgResult = await dialog.showSaveDialog(window, { properties: [] });
		if (dlgResult.canceled == false) {
			// read the selected path.
			const selectedPath = dlgResult.filePath;
			console.log('SaveAs [from] ', originalPath);
			console.log('SaveAs [to] ', selectedPath);
			// this.triggerAction('save-as')

			try {
				await fs.outputFile(selectedPath, data);
				return JSON.stringify({	success: true,	message: 'Saved!'	});
			}
			catch (err) {
				return JSON.stringify({ success: false, message: err });
			}
		}

		return JSON.stringify({ success: false, message: 'Canceled' });
	}


	async handleCreateGame(event:any, jsonConfig:string) {
		const window = BrowserWindow.getAllWindows()[0];
		const dlgResult = await dialog.showSaveDialog(window, { 
			title: 'Choose where to save the config for your new game...',
			defaultPath: 'game.json',
			filters: [
				{ name: 'JSON File(s)', extensions: ['json'] }
			]
		});
		if (dlgResult.canceled == true) {
			return JSON.stringify({ 'success': false, 'message': 'Cancelled' });
		}

		const cfgDir = path.dirname(dlgResult.filePath);
		const cfgFile = path.join(cfgDir, 'game.json');
		const cfgFileExists = await fs.pathExists(cfgFile);
		const cfgSrc = JSON.parse(jsonConfig);
		const cfgData = ProjectTemplate();
		const bldFile = path.join(cfgDir, 'editor.json');
		const bldData = BuildTemplate(cfgSrc.language == 'ts');

		if (cfgFileExists) {
			return JSON.stringify({ 'success': false, 'message': 'Project already exists at this location, please choose another.' });
		}

		// apply out config data ready for writing.
		cfgData.game.title = cfgSrc.title;
		cfgData.game.entry_point = "/game." + (cfgSrc.language == 'ts' ? 'js' : cfgSrc.language);
		cfgData.game.window.width = cfgSrc.vp_width;
		cfgData.game.window.height = cfgSrc.vp_height;
		cfgData.game.viewport.width = cfgSrc.vp_width;
		cfgData.game.viewport.height = cfgSrc.vp_height;
		cfgData.game.draw_frequency = cfgSrc.target_fps;
		cfgData.game.v_sync = cfgSrc.v_sync;
		cfgData.game.fullscreen = cfgSrc.fullscreen;

		// make sure directory exists.
		await fs.ensureDir(cfgDir);
		await fs.ensureDir(path.join(cfgDir, 'assets'));
		await fs.writeJson(cfgFile, cfgData, { spaces: '\t' });
		await fs.writeJson(bldFile, bldData, { spaces: '\t' });

		// generate the initial code.
		myCreator.generateTemplateFiles(cfgDir, cfgSrc.language, cfgSrc.template);

		// return the success result.
		return JSON.stringify({ 'success': true, 'path': cfgDir });
	}


	async handleCreateFile(event:any, filePath: string, extension?: string) {
		const _entry = (myCreator.theProject.game.entry_point ?? '').toLowerCase();
		let _filePath = filePath;

		if (extension == null) {
			if (_entry.includes('.js')) _filePath += '.js';
			if (_entry.includes('.py')) _filePath += '.py';
			if (_entry.includes('.lua')) _filePath += '.lua';
		}
		else {
			_filePath += extension;
		}
	
		await fs.outputFile(_filePath, '', 'utf-8');
		return `file created (${_filePath}).`;
	}


	async handleRenameFile(event:any, oldFile:string, newFile:string) {
		await fs.rename(oldFile, newFile);
		return `file renamed!`;
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

	
	async handleOpenImage(event:any, filePath:string, relative:boolean) {
		let _filePath = filePath;
		if (relative) {
			_filePath = path.join(myCreator.projectPath, filePath);
		}

		const theData = await fs.readFile(_filePath, "base64");
		const ext = filePath.split('.').pop();
		return JSON.stringify({
			label: path.basename(filePath),
			path: filePath,
			data: `data:image/${ext};base64,${theData}`
		});
	}


	/**
	 * 
	 * @returns 
	 */
	async handleOpenFolder(event:any) {
		const window = BrowserWindow.getAllWindows()[0];
		const self = myCreator;
		const dlgResult = await dialog.showOpenDialog(window, { properties: ['openDirectory'] });
		if (dlgResult.canceled == false) {
			// read the selected path.
			const selectedPath = dlgResult.filePaths[0];
			return await self.handleOpenFolderAt(event, selectedPath);
		}
		return false;
	}


	/**
	 * Open a folder/project/game.
	 * @param thePath The path to open.
	 * @returns Boolean on success.
	 */
	async handleOpenFolderAt(event:any, thePath:string) {
		const window = BrowserWindow.getAllWindows()[0];

		// read the project file if one exists.
		const projectFile = path.join(thePath, 'game.json');
		const projectFileExists = await fs.pathExists(projectFile);

		// read the build file if one exists.
		const buildFile = path.join(thePath, 'editor.json');
		const buildFileExists = await fs.pathExists(buildFile);

		const self = myCreator;

		// close old folder if needed.
		if (self.projectPath && self.projectPath.length > 0) {
			await self.handleMenuClose(event);
		}

		if (projectFileExists) {
			self.theProject = await fs.readJson(projectFile); // await XentuProject.Load(projectFile);
			const gameName = self.theProject?.game?.title ?? 'Untitled';
			window.setTitle(gameName + " - Xentu Creator");

			if (buildFileExists) {
				self.theBuild = await fs.readJson(buildFile);
			}
			else {
				self.theBuild = BuildTemplate();
				await fs.writeJson(buildFile, self.theBuild, { spaces: '\t' });
			}
		}
		else {
			dialog.showMessageBox(window, {
				message: "The project at the chosen location no longer exists."
			});
			return false;
			//self.theProject = ProjectTemplate();
			//window.setTitle('Xentu Creator');
		}

		self.fileWatcher = chokidar.watch(thePath, {
			ignored: /(^|[\/\\])\../, // ignore dot files
			persistent: true,
			depth: 3
		})
		.on('add',			(path:string) => self.triggerFileAction('file-created', path))
		.on('change',		(path:string) => self.triggerFileAction('file-changed', path))
		.on('unlink',		(path:string) => self.triggerFileAction('file-removed', path))
		.on('addDir',		(path:string) => self.triggerFileAction('dir-created', path))
		.on('unlinkDir',	(path:string) => self.triggerFileAction('dir-removed', path));

		self.projectPath = thePath;
		window.webContents.send('projectPathChanged', thePath);
		window.webContents.send('projectChanged', JSON.stringify(self.theProject));
		window.webContents.send('buildChanged', JSON.stringify(self.theBuild));
		window.webContents.send('triggerAction', 'hide-welcome', null );
		return true;
	}


	async handleNewGame(event:any) {
		const window = BrowserWindow.getAllWindows()[0];
		window.webContents.send('triggerAction', 'show-new-game', null );
	}

	
	async handleMenuClose(event:any) {
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


	async stopGame() {
		if (myCreator.childProcess != null) {
			myCreator.childProcess.kill('SIGINT');
			myCreator.childProcess = null;
		}
	}


	async handleExecCmd(cmd:string) {
		const window = BrowserWindow.getAllWindows()[0];
		const workingDir = this.projectPath;

		const firstSpace = cmd.indexOf(' ');
		let first = cmd;
		let args = [] as Array<string>;

		if (firstSpace > 0) {
			first = cmd.substring(0, firstSpace);
			args = cmd.substring(firstSpace).split(' ');
		}

		this.childProcess = spawn(first, args, {	cwd: workingDir, shell: true });
			
		this.childProcess.stdout.on('data', (data:any) => {
			window.webContents.send('consoleData', data.toString());
		});
			
		this.childProcess.stderr.on('data', (data:any) => {
			window.webContents.send('consoleData', data.toString());
		});
			
		this.childProcess.on('error', (data:any) => {
			window.webContents.send('consoleData', data.toString());
		});
	
		this.childProcess.on('exit', (code:any) => {
			window.webContents.send('consoleData', "\r\n$ ");
		});
	}


	replaceAll(target:string, search:string, replacement:string) {
		let res = target;
		while (res.includes(search)) {
			res = res.replace(search, replacement);
		}
		return res;
	};


	async handleExportGame(platform:string, openFolder:boolean) {
		const window = BrowserWindow.getAllWindows()[0];
		const release:any = await myCreator.handleListBinaries();
		let chosenBinary:any = null;
		let assets:Array<string> = [];

		// run pre-build commands, if there are any
		const pbCommands = myCreator.theBuild.pre_build_commands;
		if (pbCommands.length > 0) {
			window.webContents.send('consoleData', 'Running pre-build commands...');
			for (var i=0; i<pbCommands.length; i++) {
				await myCreator.handleExecCmd(pbCommands[0]);
			}
			window.webContents.send('consoleData', 'Pre-build commands complete.');
		}

		// find the binary for the chosen export platform.
		for (var i=0; i<release.binaries.length; i++) {
			const binary = release.binaries[i];
			if (binary.platform.includes(platform)) {
				chosenBinary = binary;
				break;
			}
		}

		// generate a list of assets to export.
		assets = this.scanForExportAssets(this.projectPath);
		const ppLen = this.projectPath.length;

		// ask where to save the export.
		const dlgResult = await dialog.showSaveDialog(window, {
			title: 'Export game...',
			defaultPath: myCreator.theBuild.exe_name ?? 'untitled',
  			filters: [
   			{ name: 'Game Binary', extensions: [platform == 'windows' ? 'exe' : '*'] }
  			]
		});

		if (dlgResult.canceled == false) {
			let inputBinary = path.join(chosenBinary.local_path, "xentu");
			if (this.theProject.game.entry_point.includes('.py')) inputBinary += '_py';
			if (platform == 'windows') inputBinary += '.exe';

			const outputBinary = dlgResult.filePath;
			const outputPath = path.dirname(outputBinary);

			// delete old binary.
			if (await fs.pathExists(outputBinary)) {
				fs.delete(outputBinary);
			}

			// copy binary.
			await fs.copy(inputBinary, outputBinary);
			
			// copy assets
			if (this.theBuild.assets.pack) {
				const zip = new JSZip();

				for (var i=0; i<assets.length; i++) {
					const assetPath = assets[i];
					const assetRelPath = assetPath.substring(ppLen);
					let assetZipPath = this.replaceAll(assetRelPath, '\\', '/');
					if (assetZipPath[0] == '/') assetZipPath = assetZipPath.substring(1);
					zip.file(assetZipPath, await fs.readFile(assetPath));
					//console.log("ASSET: " + assetZipPath);
				}

				const zipFile = path.join(outputPath, 'game.dat');

				// delete old game.
				if (await fs.pathExists(zipFile)) {
					fs.delete(zipFile);
				}

				zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
  					.pipe(fs.createWriteStream(zipFile))
  					.on('finish', () => {
						myCreator.triggerAction('alert', "Export complete!");
						if (openFolder) shell.showItemInFolder(outputPath);
  					});
			}
			else {
				for (var i=0; i<assets.length; i++) {
					const assetPath = assets[i];
					const assetRelPath = assetPath.substring(ppLen);
					const destPath = outputPath + assetRelPath;
					await fs.copy(assetPath, destPath);
				}
				myCreator.triggerAction('alert', "Export complete!");
				if (openFolder) shell.showItemInFolder(outputPath);
			}

			for (var i=0; i<assets.length; i++) {
				const assetPath = assets[i];
				const assetRelPath = assetPath.substring(ppLen);
				let assetZipPath = this.replaceAll(assetRelPath, '\\', '/');
				if (assetZipPath[0] == '/') assetZipPath = assetZipPath.substring(1);
				const destPath = outputPath + assetRelPath;
			}
		}
	}


	async beginGame(debugging: boolean) {
		let exePath = '';
		//const exePath = this.theSettings.debugging.mainBinary;
		const window = BrowserWindow.getAllWindows()[0];
		const release:any = await myCreator.handleListBinaries();
		const altBinPath = myCreator.theSettings.debugging.alternateBinaryPath ?? '';
		let binFile = '';

		// run pre-build commands, if there are any
		const pbCommands = myCreator.theBuild.pre_build_commands;
		if (pbCommands.length > 0) {
			window.webContents.send('consoleData', 'Running pre-build commands...\n');
			for (var i=0; i<pbCommands.length; i++) {
				await myCreator.handleExecCmd(pbCommands[0]);
			}
			window.webContents.send('consoleData', ' complete!\n');
		}

		// find the appropriate binary path.
		if (altBinPath == '') {
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
	
			// 
			if (exePath == '') {
				window.webContents.send('consoleData', 'error! failed to find an appropriate platform binary folder');
				return;
			}
		}
		else {
			exePath = altBinPath;
		}
		
		// work out which binary to use.
		binFile = path.join(exePath, 'xentu');


		if (debugging) {
			binFile = path.join(exePath, 'xentu_debug')
			console.log("debug entry: " + myCreator.theProject.game.entry_point);
			if (myCreator.theProject.game.entry_point.includes('.py')) {
				binFile = path.join(exePath, 'xentu_py_debug');
			}
		}
		else {
			if (myCreator.theProject.game.entry_point.includes('.py')) {
				binFile = path.join(exePath, 'xentu_py');
			}
		}

		// if on win32, add .exe
		if (process.platform == 'win32') binFile += '.exe';

		// check if the 
		if (!await fs.pathExists(binFile)) {
			window.webContents.send('consoleData', 'error! ' + binFile + ' does not exist.');
			return;
		}

		console.log("Binary: " + binFile);

		const workingDir = this.projectPath;
		this.childProcess = spawn(binFile, [], { cwd: workingDir });
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


	async revealInExplorer() {
		const workingDir = myCreator.projectPath;
		shell.showItemInFolder(workingDir);
	}


	async generateTemplateFiles(dir:string, language:string, template:string) {
		// read the main code file for the selected template.
		const _template = template == '' ? 'blank' : template;
		const codeDir = path.join(__dirname, '../renderer', 'templates', _template);
		const codeSrcFile = path.join(codeDir, 'game.' + language + '.txt');
		const codeSrcFileContents = await fs.readFile(codeSrcFile, 'utf8');

		// write the code to the destination path.
		const codeDstFile = path.join(dir, 'game.' + language);
		await fs.writeFile(codeDstFile, codeSrcFileContents);

		if (language == 'ts') {
			const tsConfig = `
			{
				"compilerOptions": {
					"target": "ES5",
					"module": "AMD",
					  "baseUrl": ".",
					  "outFile": "game.js"
				},
				"include": ["./**/*"]
			}
			`;
			const tsConfigFile = path.join(codeDir, 'tsconfig.json');
			await fs.writeFile(tsConfigFile, tsConfig);
		}

		// copy other files.
		await myCreator.copyTemplateFile(codeDir, dir, 'assets/xentu-logo.png');
	}


	async copyTemplateFile(srcDir:string, dstDir:string, file:string) {
		const src = path.join(srcDir, file);
		const dst = path.join(dstDir, file);
		await fs.copyFile(src, dst);
	}
}


const myCreator = new XentuCreatorApp();


app.on('ready', async function() {
	await myCreator.loadSettings();
	myCreator.createWindow();
	await myCreator.handleRefreshBinaries(null, false);
});