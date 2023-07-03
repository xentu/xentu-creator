import { createRoot } from 'react-dom/client';
import { useState, useEffect, useRef, MouseEvent } from 'react';
import ContextMenu from './Components/ContextMenu';
import DialogContainer from "./Components/DialogContainer";
import FileExplorer from "./Components/Sidebar/FileExplorer";
import GamePropertiesDialog from './Dialogs/GamePropertiesDialog';
import MainMenu from './Components/MainMenu';
import NewGameDialog from './Dialogs/NewGameDialog';
import OpenTab, { OpenTabType } from "./Classes/OpenTab";
import SettingsDialog from './Dialogs/SettingsDialog';
import TabCodeEditor from "./Tabs/TabCodeEditor";
import TabConversationEditor from './Tabs/TabConversationEditor';
import TabDatabaseClient from './Tabs/TabDatabaseClient';
import TabGraphicEditor from './Tabs/TabGraphicEditor';
import TabImageViewer from "./Tabs/TabImageViewer";
import TabLayoutEditor from './Tabs/TabLayoutEditor';
import TabSpriteFontEditor from './Tabs/TabSpriteFontEditor';
import TabSpriteMapEditor from './Tabs/TabSpriteMapEditor';
import TabItem from "./Components/TabItem";
import ThemeEditor from './Components/ThemeEditor';
import WelcomePanel from './Components/WelcomePanel';
import { MenuEntry } from './Components/MenuItem';
import { ProjectContext, ProjectSchema } from './Context/ProjectManager';
import { SettingsContext } from './Context/SettingsManager';
import { XTerm } from 'xterm-for-react';


require('./windowFuncs');
require('./allTypes');


declare global {
	interface Window {
	  api?: any;
	  findEditor: Function,
	  xterm: any
	}
}


const container = document.getElementById('app');
const root = createRoot(container!);


function App(props: appProps) {
	const [consoleHeight, setConsoleHeight] = useState(150);
	const [contextMenu, setContextMenu] = useState(null);
	const [debugging, setDebugging] = useState(false);
	const [dialog, setDialog] = useState('');
	const [fileCreator, setFileCreator] = useState(null);
	const [fileCreatorOpt, setFileCreatorOpt] = useState(false); /* when true, file creator created directories instead */
	const [fileCreatorExt, setFileCreatorExt] = useState(null); /* when true, file creator created directories instead */
	const [focusPath, setFocusPath] = useState('');
	const [isTrackingMouse, setIsTrackingMouse] = useState(''); /* stored as string, empty means false */
	const [isWelcomeVisible, setIsWelcomeVisible] = useState(true);
	const [canSave, setCanSave] = useState(false);
	const [projectPath, setProjectPath] = useState('');
	const [project, setProject] = useState({} as ProjectSchema);
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [settings, setSettings] = useState(props.loadedSettings);
	const [showConsole, setShowConsole] = useState(true);
	const [showSidebar, setShowSidebar] = useState(true);
	const [showStatusBar, setShowStatusBar] = useState(true);
	const [showThemeEditor, setShowThemeEditor] = useState(false);
	const [sidebarWidth, setSidebarWidth] = useState(240);
	const [tabs, setTabs] = useState(new Array<OpenTab>());
	const [tabsChangeContext, setTabChangeContext] = useState(null);

	const handleAction = useRef(null);
	const handleConsole = useRef(null);
	const xtermRef = useRef(null);


	// ########################################################################
	// Use Effect Handlers
	// ########################################################################

	
	useEffect(() => {
		window.api.onTriggerAction((action:string, data:string) => { handleAction.current(action, data); });
		window.api.onConsoleData((data:string) => { handleConsole.current(data); });
		window.api.onProjectChanged((newProject:object) => {
			setProject(newProject as ProjectSchema);
		});
		window.api.getAccentColor().then((accentColor:string) => {
			document.documentElement.style.setProperty('--accent','#' + accentColor.substring(0, 6));
		});
		window.api.onProjectPathChanged((newPath:string) => {
			setProjectPath(newPath);
		});

		xtermRef.current.terminal.writeln("Hello, World!");
		xtermRef.current.terminal.write("$ ");
		window.xterm = xtermRef.current.terminal;

		xtermRef.current.terminal.onData( (e:any) => {
			const term = xtermRef.current.terminal;
			switch (e) {
				case '\u0003': // Ctrl+C
					//xtermRef.current.terminal.write('^C');
					//prompt(term);
					break;
				case '\r': case '\n': // Enter
					var clear = false;
					switch (term.v ?? '') {
						case 'clear': term.reset(); clear = true; break;
						default:	term.write("\r\nCommand not recognised."); break;
					}
					term.v = '';
					term.write(clear ? '$ ' : "\r\n$ ");
					break;
				case '\u007F': // Backspace (DEL)
					// Do not delete the prompt
					if (term._core.buffer.x > 2) {
						term.write('\b \b');
						if (term.v.length > 0) {
							term.v = term.v.substring(0, term.v.length - 1);
						}
				 	}
				 	break;
			  	default: // Print all other characters for demo
				 	if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
						if (typeof term.v == 'undefined') term.v = '';
						term.v = term.v + e;
						term.write(e);
					}
					break;
			}
		 });

		window.onresize = () => { 
			handleAction.current('resize', '');
		}

		document.onkeyup = (e:KeyboardEvent) => {
			if (e.key == 'Escape') {
				setContextMenu('');
				setFocusPath('');
				setDialog('');
				setFileCreator(null);
			}
		};

	}, []);


	useEffect(() => {
		setCanSave(tabs.length > 0);
	}, [tabs]);


	useEffect(() => {
		if (project !== null && typeof project.game !== 'undefined') {
			recordProjectOpen();
		}
	}, [project]);


	useEffect(() => {
		if (tabsChangeContext === null) {
			return;
		}
		if (tabsChangeContext instanceof OpenTab) {
			setTabChangeContext(null);
			setSelectedTab(tabsChangeContext);
		}
	}, [tabsChangeContext]);


	useEffect(() => {
		doUpdateWindowTitle();
	}, [selectedTabIndex]);


	useEffect(() => {
		updateRootCssVariables();
	}, [settings]);


	// ########################################################################
	// Event handlers (from back end).
	// ########################################################################


	/**
	 * 
	 */
	handleAction.current = (action:string, data?:string) => {
		// note: if actions ever stop working, make sure tabs has correct length.
		switch (action) {
			case 'toggle-sidebar':
				setShowSidebar(!showSidebar);
				break;
			case 'toggle-console':
				const show = !showConsole;
				setShowConsole(show);
				doEditorResize();
				break;
			case 'toggle-statusbar':
				setShowStatusBar(!showStatusBar);
				break;
			case 'toggle-theme-editor':
				setShowThemeEditor(!showThemeEditor);
				break;
			case 'show-new-game':
				setDialog('new-game')
				break;
			case 'show-settings':
				setDialog('settings');
				break;
			case 'show-game-properties':
				setDialog('game-properties');
				break;
			case 'hide-welcome':
				setIsWelcomeVisible(false);
				break;
			case 'clear-console':
				const term = xtermRef.current.terminal;
				term.reset();
				term.v = '';
				term.write('$ ');
				break;
			case 'close-all':
				setTabs(new Array<OpenTab>());
				setProject(null);
				setDialog('');
				setIsWelcomeVisible(true);
				break;
			case 'game-started':	setDebugging(true); break;
			case 'game-stopped':	setDebugging(false); break;
		}	

		if (tabs.length > 0) {
			switch (action) {
				case 'save':
					doSaveTab( findActiveTab() );
					break;
				case 'save-copy':
					doSaveTabCopy( findActiveTab() );
					break;
				case 'save-all':
					doSaveAllTabs();
					break;
				case 'select-all':
					doSelectAll();
					break;
				case 'file-created':
				case 'file-changed':
				case 'file-removed':
				case 'dir-created':
				case 'dir-removed':
					console.log(`Action ${action} for ${data}`);
					break;
				case 'resize':
					const tab = findActiveTab();
					if (tab && tab.guid && tab.type == OpenTabType.CodeEditor) {
						const editor = window.findEditor(tab.guid);
						editor.layout({  });
					}
					break;
			}
		}
	};


	handleConsole.current = (data:string) => {
		const term = xtermRef.current.terminal;
		term.write(data);
		//console.log(data);
	};


	// ########################################################################
	// Event handlers (front end).
	// ########################################################################


	/**
	 * Handles the mouse moving.
	 */
	const handleMouseMove = (x: any, y: any) => {
		switch (isTrackingMouse) {
			case 'splitter':
				setSidebarWidth(x + 2);
				break;
			case 'splitter2':
				const h = document.getElementById('main').clientHeight;
				setConsoleHeight(h - y - 5);
				break;
		}
	};


	/**
	 * Handles closing a tab.
	 * @param e The mouse event that triggered it.
	 * @param tab The tab to close.
	 */
	const handleTabCloseClicked = (e: MouseEvent, tab: OpenTab) => {
		doCloseTab(tab);
		// don't let the close button bubble to the tab itself.
		e.stopPropagation();
		return false;
	};


	/**
	 * 
	 */
	const handleLabelChanged = (tab: OpenTab, newLabel: string) => {
		setTabLabel(tab, newLabel);
		doUpdateWindowTitle();
	}


	/**
	 * Handle the data changing for a specific tab.
	 * @param tab The tab where data changed.
	 * @param newValue The new data being assigned for the tab.
	 * @param changed Weather the data changed (false = just loaded).
	 */
	const handleSetData = (tab: OpenTab, newVal: any, changed: boolean) : void => {
		if (changed) tab.changed = true;
		tab.data = newVal ?? null;
		const tabsCopy = [...tabs];
		setTabs(tabsCopy);
	};


	// ########################################################################
	// Functions
	// ########################################################################


	const updateRootCssVariables = () => {
		const th = settings.theme[settings.editor.colorTheme];
		const dark = settings.editor.colorTheme == 'dark';
		
		document.getElementById('root-styles').innerHTML = `
			:root {
				--mainBackground: ${th.mainBackground};
				--mainBackgroundHs: ` + window.hexToHs(th.mainBackground) + `;
				--mainBackgroundL: ` + window.hexToHsl(th.mainBackground)[2] + `%;
				--mainBackgroundSemiDark: hsl(var(--mainBackgroundHs), calc(var(--mainBackgroundL) - 5%));
				--mainBackgroundDark: hsl(var(--mainBackgroundHs), calc(var(--mainBackgroundL) - 10%));
				--mainText: ${th.mainText};
				--sidebarBackground: ${th.sidebarBackground};
				--sidebarText: ${th.sidebarText};
				--sidebarItemBackground: ${th.sidebarItemBackground};
				--sidebarItemText: ${th.sidebarItemText};
				--hoverBackground: ${th.hoverBackground};
				--hoverText: ${th.hoverText};
				--activeBackground: ${th.activeBackground};
				--activeText: ${th.activeText};
				--editorBackground: ${th.editorBackground};
				--editorText: ${th.editorText};
				--footerBackground: ${th.footerBackground};
				--footerBackgroundHs: ` + window.hexToHs(th.footerBackground) + `;
				--footerBackgroundL: ` + window.hexToHsl(th.footerBackground)[2] + `%;
				--footerBackgroundDark: hsl(var(--footerBackgroundHs), calc(var(--footerBackgroundL) - 5%));
				--footerBackgroundLight: hsl(var(--footerBackgroundHs), calc(var(--footerBackgroundL) + 5%));
				--footerText: ${th.footerText};
			}
		`;
		window.changeThemeColors(dark, th.editorBackground);

		window.xterm.setOption('theme', { 
			background: settings.theme[dark?'dark':'light'].terminalBackground,
			foreground: settings.theme[dark?'dark':'light'].terminalText,
			cursor: settings.theme[dark?'dark':'light'].terminalText
		});
	};


	/**
	 * Find an open tab by it's file path, or null if the file isn't open.
	 * @param filePath 
	 * @returns OpenTab|null
	 */
	const findTab = (filePath: string) : OpenTab => {
		for (var i=0; i<tabs.length; i++) {
			const tab = tabs[i];
			if (tab == null) continue;
			if (tab.path == filePath) return tab;
		}
		return null;
	};


	/**
	 * Get the currently active tab.
	 * @returns 
	 */
	const findActiveTab = () : OpenTab|null => {
		return tabs[selectedTabIndex];
	};


	/**
	 * Find the first open tab.
	 * @returns A tab or null.
	 */
	const findFirstOpenTab = () : OpenTab => {
		for (var i=0; i<tabs.length; i++) {
			if (tabs[i] != null) return tabs[i];
		}
		return null;
	}


	/**
	 * 
	 */
	const recordProjectOpen = async () => {
		const clone = JSON.parse(JSON.stringify(settings));
		// make sure recentProjects is an array.
		if (typeof clone.recentProjects === 'undefined') {
			clone.recentProjects = new Array<string>();
		}
		const newEntry = `${project.game.title}|${projectPath}`;
		// remove duplicates.
		clone.recentProjects = clone.recentProjects.filter((e:string) => !e.endsWith(projectPath));
		// add to beginning of 
		clone.recentProjects.unshift(newEntry);
		// save changes.
		setSettings(clone);
		await window.api.setSettings(clone);
	}


	// ########################################################################
	// Methods
	// ########################################################################

	
	/**
	 * Set the label for an open tab.
	 * @param tab The associated tab.
	 * @param newLabel The new label.
	 */
	const setTabLabel = (tab: any, newLabel: any) => {
		const index = tabs.indexOf(tab);
		const tabsCopy = [...tabs];
		tabsCopy[index].label = newLabel;
		setTabChangeContext(tabsCopy[index]);
		setTabs(tabsCopy);
	};


	/**
	 * Set which tab is currently active.
	 * @param tab The tab to set as selected.
	 */
	const setSelectedTab = (tab?: OpenTab) => {
		const index = tabs.indexOf(tab);
		if (tab !== null) {
			setSelectedTabIndex(index);
		}
		doUpdateWindowTitle();
	};


	/**
	 * Load an editor for a specific file.
	 * @param filePath The absolute path to the file to edit.
	 */
	const doLoadEditor = (filePath: string) : void => {
		const ext = filePath.split('.').pop();
		
		// goto tab if its already open.
		const existing = findTab(filePath);
		if (existing !== null) { setSelectedTab(existing); return; }
		let newTab = null;

		// load the desired tab.
		if (['lua', 'js', 'json', 'toml', 'txt', 'xml', 'py'].includes(ext)) {
			newTab = new OpenTab('loading...', filePath, OpenTabType.CodeEditor);
		}
		else if (['jpg', 'png'].includes(ext)) {
			newTab = new OpenTab('loading...', filePath, OpenTabType.ImageViewer);
		}
		else if (['xcf'].includes(ext)) newTab = new OpenTab('loading...', filePath, OpenTabType.ConversationEditor);
		else if (['xdf'].includes(ext)) newTab = new OpenTab('loading...', filePath, OpenTabType.DatabaseClient);
		else if (['xgf'].includes(ext)) newTab = new OpenTab('loading...', filePath, OpenTabType.GraphicEditor);		
		else if (['xlf'].includes(ext)) newTab = new OpenTab('loading...', filePath, OpenTabType.LayoutEditor);
		else if (['xff'].includes(ext)) newTab = new OpenTab('loading...', filePath, OpenTabType.SpriteFontEditor);
		else if (['xsf'].includes(ext)) newTab = new OpenTab('loading...', filePath, OpenTabType.SpriteMapEditor);
		
		// set tab state if tab was loaded.
		if (newTab != null) {
			setTabChangeContext(newTab);
			setTabs([...tabs, newTab]);
		}
	};


	const doCreateFile = async (filePath: string) => {
		if (fileCreatorOpt == true) {
			await window.api.createFolder(filePath);	
		}
		else {
			await window.api.createFile(filePath, fileCreatorExt);
		}
	};


	/**
	 * Sets the arguments for where to show a context menu.
	 */
	const doShowContextMenu = (name:string, x:number, y:number, path:string) : void => {
		setContextMenu({ name, x, y, path });
	};


	/**
	 * Hide the active context menu.
	 */
	const doHideContextMenu = () => {
		setContextMenu(null);
		setFocusPath(null);
	}

	
	/**
	 * Save any changes on a specific tab.
	 */
	const doSaveTab = (tab: OpenTab) => {
		const index = tabs.indexOf(tab);
		// call save in async.
		const saveTabData = async(path:string, data:string) => {
			const theJSON = await window.api.saveFile(path, data);
			const theResponse = JSON.parse(theJSON);
		};
		saveTabData(tab.path, tab.data ?? '');
		// update state.
		tabs[index].changed = false;
		setTabs([...tabs]);
	};


	const doSaveAllTabs = () => {
		const saveTabData = async(path:string, data:string) => {
			const theJSON = await window.api.saveFile(path, data);
			const theResponse = JSON.parse(theJSON);
		};
		const saveEachTab = async (tabs:Array<OpenTab>) => {
			for (const tab of tabs) {
				tab.changed = false;
			  	await saveTabData(tab.path, tab.data ?? '');
			}
		}
		saveEachTab(tabs).then(() => {
			setTabs([...tabs]);
		});
	};


	/**
	 * Ask the main thread to save data from a tab as a copy.
	 * @param tab 
	 */
	const doSaveTabCopy = (tab: OpenTab) => {
		const index = tabs.indexOf(tab);
		// call save in async.
		const saveTabDataCopy = async(path:string, data:string) => {
			const theJSON = await window.api.saveCopy(path, data);
			const theResponse = JSON.parse(theJSON);
		};
		saveTabDataCopy(tab.path, tab.data ?? '');
	};


	/**
	 * Perform a "select all" command on the active monaco editor.
	 */
	const doSelectAll = () => {
		const tab = findActiveTab();
		if (tab && tab.guid) {
			const editor = window.findEditor(tab.guid);
			const range = editor.getModel().getFullModelRange();
			editor.setSelection(range);
		}
	};


	/**
	 * 
	 */
	const doEditorResize = () => {
		const tab = findActiveTab();
		if (tab && tab.guid) {
			const editor = window.findEditor(tab.guid);
			editor.layout();
		}
		window.dispatchEvent(new Event("resize"));
	};


	/**
	 * 
	 */
	const doUpdateWindowTitle = () => {
		try {
			/* const activeTab = findActiveTab();
			if (activeTab !== null) {
				const label = activeTab.label ?? 'Untitled';
				window.api.setTitle(`${label} - Xentu Creator`);
			}
			else {
				window.api.setTitle(`Xentu Creator`);
			} */
		}
		catch {}
	};


	/**
	 * Close a specific tab.
	 * @param tab The tab to close.
	 * @return boolean True if closed, false if canceled.
	 */
	const doCloseTab = (tab: OpenTab) : boolean => {
		const index = tabs.indexOf(tab);
		if (index < 0) return false;
		if (tab?.changed == false || confirm("Are you sure you want to close this tab?")) {
			tabs[index] = null;
			// update the tabs.
			const allNull = tabs.every(el => el === null);
			setTabs(allNull ? [] : [...tabs]);
			// select the next available.
			const nextOpen = findFirstOpenTab();
			setSelectedTab(nextOpen);
			doUpdateWindowTitle();
			return true;
		}
		return false;
	};


	/**
	 * Close a tab for a specific path.
	 * @param path 
	 */
	const doCloseTabByPath = (path: string) => {
		const tab = findTab(path);
		doCloseTab(tab);
	};


	// ########################################################################
	// ReactJS Render Methods
	// ########################################################################


	/**
	 * 
	 */
	const renderTabLabels = () => {
		const result = [];
		for (var i=0; i<tabs.length; i++) {
			const tab = tabs[i];
			if (tab == null) continue;
			const label = tab.label + (tab.changed ? '*' : '');
			result.push(<TabItem key={"tabLabel"+i} label={label} 
										active={selectedTabIndex == i} 
										onClick={e => {setSelectedTab(tab)}} 
										onClose={e => {handleTabCloseClicked(e, tab);}} 
										/>);
		}
		return result;
	};


	/**
	 * 
	 */
	const renderTabBodies = () => {
		const result = [];
		for (var i=0; i<tabs.length; i++) {
			const tab = tabs[i];
			if (tab == null) continue;
			const active = selectedTabIndex == i;
			const key = "tabBody"+i;

			switch (tab.type) {
				case OpenTabType.CodeEditor:
					result.push(<TabCodeEditor key={key} filePath={tab.path} guid={tab.guid} active={active} labelChanged={(l: string) => handleLabelChanged(tab, l)} onSetData={(n: any, c: boolean) => handleSetData(tab, n, c)} />);
					break;
				case OpenTabType.ConversationEditor:
					result.push(<TabConversationEditor key={key} filePath={tab.path} guid={tab.guid} active={active} labelChanged={(l: string) => handleLabelChanged(tab, l)} onSetData={(n: any, c: boolean) => handleSetData(tab, n, c)} />);
					break;
				case OpenTabType.DatabaseClient:
					result.push(<TabDatabaseClient key={key} filePath={tab.path} guid={tab.guid} active={active} labelChanged={(l: string) => handleLabelChanged(tab, l)} onSetData={(n: any, c: boolean) => handleSetData(tab, n, c)} />);
					break;
				case OpenTabType.GraphicEditor:
					result.push(<TabGraphicEditor key={key} filePath={tab.path} guid={tab.guid} active={active} labelChanged={(l: string) => handleLabelChanged(tab, l)} onSetData={(n: any, c: boolean) => handleSetData(tab, n, c)} />);
					break;
				case OpenTabType.ImageViewer:
					result.push(<TabImageViewer key={key} filePath={tab.path} guid={tab.guid} active={active} labelChanged={(l: string) => handleLabelChanged(tab, l)} onSetData={(n: any, c: boolean) => {}} />);
					break;
				case OpenTabType.LayoutEditor:
					result.push(<TabLayoutEditor key={key} filePath={tab.path} guid={tab.guid} active={active} labelChanged={(l: string) => handleLabelChanged(tab, l)} onSetData={(n: any, c: boolean) => handleSetData(tab, n, c)} />);
					break;
				case OpenTabType.SpriteFontEditor:
					result.push(<TabSpriteFontEditor key={key} filePath={tab.path} guid={tab.guid} active={active} labelChanged={(l: string) => handleLabelChanged(tab, l)} onSetData={(n: any, c: boolean) => handleSetData(tab, n, c)} />);
					break;
				case OpenTabType.SpriteMapEditor:
					result.push(<TabSpriteMapEditor key={key} filePath={tab.path} guid={tab.guid} active={active} labelChanged={(l: string) => handleLabelChanged(tab, l)} onSetData={(n: any, c: boolean) => handleSetData(tab, n, c)} />);
					break;
			}			
		}
		return result;
	};


	/**
	 * 
	 */
	const renderDialog = () => {
		const result = [];
		switch (dialog) {
			case 'settings': result.push(<SettingsDialog key={'settings-dialog'} onSettingsChanged={(s:any) => setSettings(s)} />); break;
			case 'new-game': result.push(<NewGameDialog key={'new-game'} onCancel={() => setDialog('')} />); break;
			case 'game-properties': result.push(<GamePropertiesDialog key={'game-properties'} onPropertiesChanged={(s:any) => setProject(s)} />); break;
		}
		return result;
	};


	const contextMenuAction = async (action:string, directory?:boolean, extension?:string) => {
		console.log('Context Menu Action', {
			'action': action,
			'path': contextMenu?.path ?? ''
		});

		switch (action) {
			case 'new-file':
				setFileCreatorOpt(false);
				setFileCreatorExt(extension);
				setFileCreator(contextMenu.path ?? '');
				break;
			case 'new-folder':
				setFileCreatorOpt(true);
				setFileCreator(contextMenu.path ?? '');
				break;
			case 'delete':
				if (contextMenu.path && confirm("Are you sure you wish to delete this?")) {
					const r = await window.api.deleteFileOrFolder(contextMenu.path);
					console.log("DeleteFile result", r);
					doCloseTabByPath(contextMenu.path);
				}
				break;
		}
	}


	/**
	 * 
	 */
	const renderContextMenu = () => {
		const result = [];
		if (contextMenu !== null) {
			const info = contextMenu as contextMenuInfo;
			const style = { left:info.x+'px', top: info.y+'px' };
			if (info.name == 'file-explorer') {
				result.push(
					<div key="context-menu" className="context-menu" onBlur={() => {doHideContextMenu()}} style={style}>
						<MenuEntry key="new-file-code" disabled={false} label="New Code File..." click={() => contextMenuAction('new-file', true)} />
						<hr />
						<MenuEntry key="new-file-conversation" disabled={false} label="New Conversation..." click={() => contextMenuAction('new-file', true, '.xcf')} />
						<MenuEntry key="new-file-database" disabled={false} label="New Database..." click={() => contextMenuAction('new-file', true, '.xdf')} />
						<hr />
						<MenuEntry key="new-file-graphic" disabled={false} label="New Graphic..." click={() => contextMenuAction('new-file', true, '.xgf')} />
						<MenuEntry key="new-file-layout" disabled={false} label="New Layout..." click={() => contextMenuAction('new-file', true, '.xlf')} />
						<MenuEntry key="new-file-sprite-sheet" disabled={false} label="New Sprite Sheet..." click={() => contextMenuAction('new-file', true, '.xsf')} />
						<MenuEntry key="new-file-sprite-font" disabled={false} label="New Sprite Font..." click={() => contextMenuAction('new-file', true, '.xff')} />
						<hr />
						<MenuEntry key="new-folder" label="New Folder..." click={() => contextMenuAction('new-folder')} />
						<hr />
						<MenuEntry key="rename" label="Rename" disabled={true} click={() => contextMenuAction('rename')} />
						<MenuEntry key="delete" label="Delete" disabled={true} click={() => contextMenuAction('delete')} />
					</div>);
			}
			else if (info.name == 'file-explorer-directory') {
				result.push(
					<div key="context-menu" className="context-menu" onBlur={() => {doHideContextMenu()}} style={style}>
						<MenuEntry key="new-file-code" disabled={false} label="New Code File..." click={() => contextMenuAction('new-file', true)} />
						<hr />
						<MenuEntry key="new-file-conversation" disabled={false} label="New Conversation..." click={() => contextMenuAction('new-file', true)} />
						<MenuEntry key="new-file-database" disabled={false} label="New Database..." click={() => contextMenuAction('new-file', true)} />
						<hr />
						<MenuEntry key="new-file-graphic" disabled={false} label="New Graphic..." click={() => contextMenuAction('new-file', true)} />
						<MenuEntry key="new-file-sprite-sheet" disabled={false} label="New Sprite Sheet..." click={() => contextMenuAction('new-file', true)} />
						<MenuEntry key="new-file-sprite-font" disabled={false} label="New Sprite Font..." click={() => contextMenuAction('new-file', true)} />
						<hr />
						<MenuEntry key="new-folder" label="New Folder..." click={() => contextMenuAction('new-folder', true)} />
						<hr />
						<MenuEntry key="rename" label="Rename" disabled={true} click={() => contextMenuAction('rename', true)} />
						<MenuEntry key="delete" label="Delete" click={() => contextMenuAction('delete', true)} />
					</div>);
			}
			else if (info.name == 'file-explorer-item') {
				result.push(
					<div key="context-menu" className="context-menu" onBlur={() => {doHideContextMenu()}} style={style}>
						<MenuEntry key="rename" label="Rename" disabled={true} click={() => contextMenuAction('rename')} />
						<MenuEntry key="delete" label="Delete" click={() => contextMenuAction('delete')} />
					</div>);
			}
		}
		return result;
	};


	const c_tracking = isTrackingMouse ? 'is-tracking' : '';
	const c_statusbar = showStatusBar ? '' : 'hide-statusbar';
	const c_console = showConsole ? '' : 'hide-console';
	const c_roboto = settings.editor.fontFamily == 'roboto' ? 'font-roboto' : '';
	const c_welcome = isWelcomeVisible ? 'welcome-visible' : '';
	const isDark = settings.editor.colorTheme == 'dark';


	return (
		<div className={[isDark?'theme-is-dark':'theme-is-light', c_roboto, c_welcome].join(' ')}>
			<SettingsContext.Provider value={settings}>
				<ProjectContext.Provider value={project}>

					<MainMenu enabled={!isWelcomeVisible} canSave={canSave} showSidebar={showSidebar} 
								 showStatus={showStatusBar} showConsole={showConsole} showThemeEditor={showThemeEditor}
								 debugging={debugging}
								 setFileCreator={setFileCreator}
								 setFileCreatorOpt={setFileCreatorOpt}
								 setFileCreatorExt={setFileCreatorExt} />

					<div className={['columns', c_tracking, c_statusbar, c_console].join(' ')} onMouseMove={e => handleMouseMove(e.clientX, e.clientY)} onMouseLeave={e => setIsTrackingMouse('')}>

						<div id="sidebar" className="column" style={{flexBasis: sidebarWidth + 'px', display: showSidebar ? 'flex' : 'none' }}>
							<div className="column-head tab-labels">
								<div className='tab-label'>Files &amp; Folders</div>

								<div className="buttons" style={{display:'none'}}>
									<a className={["menu-item"].join(' ')} title="Config Game">
										<span className="menu-label"><i className='icon-cog'></i></span>
									</a>
								</div>

							</div>
							<div className="column-body">
								<FileExplorer path="d:/temp" 
									onFileOpen={(filePath: string) => doLoadEditor(filePath)} 
									onFileCreate={(filePath: string) => doCreateFile(filePath)}
									onContextMenu={(name:string, x:number, y:number, path:string) => doShowContextMenu(name, x, y, path)} 
									focusPath={focusPath} 
									setFocusPath={setFocusPath} 
									fileCreator={fileCreator} 
									setFileCreator={setFileCreator} />
							</div>
						</div>

						<div id="splitter" onMouseDown={e => setIsTrackingMouse('splitter')} onMouseUp={e => setIsTrackingMouse('')} />
					
						<div id="main" className="column">
							<div className="column-head tab-labels">
								{renderTabLabels()}
							</div>
							<div className="column-body" data-count={tabs.length}>
								<div className="main-rows">
									<div className="tab-bodies">
										{renderTabBodies()}
									</div>
									<div id="splitter2" />
									<div id="console" style={{ /* flexBasis: consoleHeight + 'px', */ display: showConsole ? 'block' : 'none' }}>
										<XTerm ref={xtermRef} options={{ 
											rows: 8, 
											allowTransparency: true,
											fontFamily: 'Consolas, "Courier New", monospace',
											fontSize: settings?.editor?.fontSize ?? 14
										}} />
									</div>
								</div>
							</div>						
						</div>
					</div>

					<div id='status-bar'>Idle.</div>
					<WelcomePanel visible={isWelcomeVisible} />
					<ThemeEditor shown={showThemeEditor} onClose={(e:any) => setShowThemeEditor(!showThemeEditor)} onSettingsChanged={(s:any) => setSettings(s)} />
					<DialogContainer visible={dialog!==''} onClose={() => setDialog('')}>
						{renderDialog()}
					</DialogContainer>
					<ContextMenu onBlur={() => doHideContextMenu()}> 
						{renderContextMenu()}
					</ContextMenu>

				</ProjectContext.Provider>
			</SettingsContext.Provider>
		</div>
	);
}


window.api.getSettings().then((foundSettings:any) => {
	root.render(<App loadedSettings={foundSettings} />);
});