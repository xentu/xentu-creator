import { createRoot } from 'react-dom/client';
import { useState, useEffect, useRef, MouseEvent, useReducer } from 'react';
import ContextMenu from './Components/ContextMenu';
import DialogContainer from "./Components/DialogContainer";
import FileExplorer from "./Components/Sidebar/FileExplorer";
import GamePropertiesDialog from './Dialogs/GamePropertiesDialog';
import MainMenu from './Components/MainMenu';
import NewGameDialog from './Dialogs/NewGameDialog';
import NewFileDialog from './Dialogs/NewFileDialog';
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
import { appStateReducer, appStateDefault } from './state'
import { classList } from './helpers';
import { useTranslation } from "react-i18next";
import "./i18n";
import PickImageDialog from './Dialogs/PickImageDialog';
import AlertDialog from './Dialogs/AlertDialog';
import ConfirmDialog from './Dialogs/ConfirmDialog';
import PromptDialog from './Dialogs/PromptDialog';


require('./window');
require('./types');
require('./autocomplete');


const container = document.getElementById('app');
const root = createRoot(container!);


function App(props: appProps) {
	const [appState, dispatchAppState] = useReducer(appStateReducer, appStateDefault);
	const [contextMenu, setContextMenu] = useState(null);
	const [project, setProject] = useState({} as ProjectSchema);
	const [settings, setSettings] = useState(props.loadedSettings);
	const [tabs, setTabs] = useState(new Array<OpenTab>());
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [tabsChangeContext, setTabChangeContext] = useState(null);
	const handleAction = useRef(null);
	const handleConsole = useRef(null);
	const xtermRef = useRef(null);
	const { i18n, t } = useTranslation();


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
			dispatchAppState({ type: 'project-path', value: newPath });
		});

		xtermRef.current.terminal.writeln(t('_terminal_greeting'));
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
						default:	term.write("\r\n" + t('_terminal_cmd_not_recognised')); break;
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
				dispatchAppState([ { type:'focus-path', value:'' }, { type:'dialog', value:'' } ]);
			}
		};

		dispatchAppState({ type: 'show-console', value: false });

	}, []);


	useEffect(() => {
		dispatchAppState({ type: 'can-save', value: tabs.length > 0 });
		//setCanSave(tabs.length > 0);
	}, [tabs]);


	useEffect(() => {
		if (project !== null && typeof project.game !== 'undefined') {
			recordProjectOpen();
			//todo: fix doLoadDefaultEditor();
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
				//setShowSidebar(!showSidebar);
				dispatchAppState({ type: 'toggle-sidebar' });
				break;
			case 'toggle-console':
				//setShowConsole(!showConsole);
				dispatchAppState({ type: 'toggle-console' });
				doEditorResize();
				break;
			case 'toggle-statusbar':
				//setShowStatusBar(!showStatusBar);
				dispatchAppState({ type: 'toggle-statusbar' });
				break;
			case 'toggle-theme-editor':
				//setShowThemeEditor(!showThemeEditor);
				dispatchAppState({ type: 'toggle-theme-editor' });
				break;
			case 'show-new-game':
				dispatchAppState({ type: 'dialog', value: 'new-game' });
				break;
			case 'show-settings':
				dispatchAppState({ type: 'dialog', value: 'settings' });
				break;
			case 'show-new-file':
				dispatchAppState({ type: 'dialog', value: 'new-file' });
				break;
			case 'show-new-folder':
				dispatchAppState({ type: 'dialog', value: 'new-folder' });
				console.log('todo');
				break;
			case 'show-game-properties':
				dispatchAppState({ type: 'dialog', value: 'game-properties' });
				break;
			case 'hide-welcome':
				//setIsWelcomeVisible(false);
				dispatchAppState({ type: 'is-welcome-visible', value: false });
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
				dispatchAppState([
					{ type: 'dialog', value: '' },
					{ type: 'is-welcome-visible', value: true }
				]);
				break;
			case 'file-created':
			case 'file-changed':
			case 'dir-created':
			case 'dir-removed':
				//console.log(`Action ${action} for ${data}`);
				dispatchAppState({ type:'file-changed', value:data }); 
				break;
			case 'file-removed':
				dispatchAppState({ type:'file-changed', value:data }); 
				doMarkTabDirty(data);
				break;
			case 'game-started': dispatchAppState([
					{ type:'is-debugging', value:true },
					{ type:'show-console', value:true }
				]);
				break;
			case 'game-stopped':	
				dispatchAppState({ type:'is-debugging', value:false });
				break;
			case 'alert':
				dispatchAppState({ type:'dialog2', value:'alert', data:data });
				break;
			case 'confirm':
				dispatchAppState({ type:'dialog2', value:'confirm', data:data });
				break;
			case 'prompt':
				const pd = JSON.parse(data);
				dispatchAppState({ type:'prompt', message:pd.message, defaultValue:pd.defaultValue });
				break;
			case 'pick-image':
				dispatchAppState({ type:'pick-image', value:null });
				break;
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
				case 'resize':
					const tab = findActiveTab();
					if (tab && tab.guid && tab.type == OpenTabType.CodeEditor) {
						const editor = window.findEditor(tab.guid);
						editor?.layout({  });
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
		switch (appState.isTrackingMouse) {
			case 'splitter':
				dispatchAppState({ type:'sidebar-width', value: x + 2 });
				break;
			case 'splitter2':
				const h = document.getElementById('main').clientHeight;
				dispatchAppState({ type:'console-height', value: h - y + 30 });
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


	/**
	 * Remove a recent path, and update settings.
	 * @param path 
	 */
	const handleRemoveRecent = async (path: string) => {
		const clone = JSON.parse(JSON.stringify(settings));
		clone.recentProjects = clone.recentProjects.filter((e:string) => !e.endsWith(path));
		setSettings(clone);
		await window.api.setSettings(clone);
	}


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
				--terminalBackground: ${th.terminalBackground};
				--terminalText: ${th.terminalText};
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
		const newEntry = `${project.game.title}|${appState.projectPath}`;
		// remove duplicates.
		clone.recentProjects = clone.recentProjects.filter((e:string) => !e.endsWith(appState.projectPath));
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
	};


	/**
	 * Load the entry point when the project loads.
	 */
	const doLoadDefaultEditor = () => {
		const path = appState.projectPath + '/' + project.game.entry_point;
		doLoadEditor(path);
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
			newTab = new OpenTab(t('_tab_loading'), filePath, OpenTabType.CodeEditor);
		}
		else if (['jpg', 'png'].includes(ext)) {
			newTab = new OpenTab(t('_tab_loading'), filePath, OpenTabType.ImageViewer);
		}
		else if (['xcf'].includes(ext)) newTab = new OpenTab(t('_tab_loading'), filePath, OpenTabType.ConversationEditor);
		else if (['xdf'].includes(ext)) newTab = new OpenTab(t('_tab_loading'), filePath, OpenTabType.DatabaseClient);
		else if (['xgf'].includes(ext)) newTab = new OpenTab(t('_tab_loading'), filePath, OpenTabType.GraphicEditor);		
		else if (['xlf'].includes(ext)) newTab = new OpenTab(t('_tab_loading'), filePath, OpenTabType.LayoutEditor);
		else if (['xff'].includes(ext)) newTab = new OpenTab(t('_tab_loading'), filePath, OpenTabType.SpriteFontEditor);
		else if (['xsf'].includes(ext)) newTab = new OpenTab(t('_tab_loading'), filePath, OpenTabType.SpriteMapEditor);
		
		// set tab state if tab was loaded.
		if (newTab != null) {
			setTabChangeContext(newTab);
			setTabs([...tabs, newTab]);
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
		dispatchAppState({ type: 'focus-path', value: null });
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


	/**
	 * 
	 */
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
			editor?.layout();
		}
		window.dispatchEvent(new Event("resize"));
	};


	const doJiggleZoom = () => {
		dispatchAppState({ type:'console-height', value:appState.consoleHeight + 1 });
		setTimeout(() => {
			dispatchAppState({ type:'console-height', value:appState.consoleHeight - 1 });
		}, 10);
	};

	/**
	 * Close a specific tab.
	 * @param tab The tab to close.
	 * @return boolean True if closed, false if canceled.
	 */
	const doCloseTab = (tab: OpenTab) : boolean => {
		const index = tabs.indexOf(tab);
		if (index < 0) return false;

		if (tab?.changed == false) {
			tabs[index] = null;
			const allNull = tabs.every(el => el === null);
			setTabs(allNull ? [] : [...tabs]);
			const nextOpen = findFirstOpenTab();
			setSelectedTab(nextOpen);
			return true;
		}
		else {
			window.api.showConfirm(t('are_you_sure_you_want_to_close_this_tab'), async (result:boolean) => {
				if (result == true) {
					tabs[index] = null;
					const allNull = tabs.every(el => el === null);
					setTabs(allNull ? [] : [...tabs]);
					const nextOpen = findFirstOpenTab();
					setSelectedTab(nextOpen);
					return true;
				}
			});
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


	/**
	 * Mark an open tab as changed (dirty) so it needs to be saved before closing.
	 * @param path 
	 */
	const doMarkTabDirty = (path: string) => {
		const tab = findTab(path);
		if (tab) {
			const index = tabs.indexOf(tab);
			tabs[index].changed = true;
			setTabs([...tabs]);
		}
	}


	/**
	 * 
	 */
	const doContextMenuAction = async (action:string, directory?:boolean, extension?:string) => {
		/* console.log('Context Menu Action', { 'action': action, 'path': contextMenu?.path ?? '' }); */
		switch (action) {
			case 'new-file':
				window.api.menuNewFile();
				break;
			case 'new-folder':
				window.api.menuNewFolder();
				break;
			case 'delete':
				if (contextMenu.path) {
					window.api.showConfirm(t('are_you_sure_you_want_to_delete_this'), async (result:boolean) => {
						if (result == true) {
							const r = await window.api.deleteFileOrFolder(contextMenu.path);
							doCloseTabByPath(contextMenu.path);
						}
					});
				}
				break;
		}
	}


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
										onClose={e => {handleTabCloseClicked(e, tab)}} 
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
					result.push(<TabCodeEditor key={key} filePath={tab.path} changed={tab.changed} guid={tab.guid} active={active} labelChanged={(l: string) => handleLabelChanged(tab, l)} onSetData={(n: any, c: boolean) => handleSetData(tab, n, c)} />);
					break;
				case OpenTabType.ConversationEditor:
					result.push(<TabConversationEditor key={key} filePath={tab.path} changed={tab.changed} guid={tab.guid} active={active} labelChanged={(l: string) => handleLabelChanged(tab, l)} onSetData={(n: any, c: boolean) => handleSetData(tab, n, c)} />);
					break;
				case OpenTabType.DatabaseClient:
					result.push(<TabDatabaseClient key={key} filePath={tab.path} changed={tab.changed} guid={tab.guid} active={active} labelChanged={(l: string) => handleLabelChanged(tab, l)} onSetData={(n: any, c: boolean) => handleSetData(tab, n, c)} />);
					break;
				case OpenTabType.GraphicEditor:
					result.push(<TabGraphicEditor key={key} filePath={tab.path} changed={tab.changed} guid={tab.guid} active={active} labelChanged={(l: string) => handleLabelChanged(tab, l)} onSetData={(n: any, c: boolean) => handleSetData(tab, n, c)} />);
					break;
				case OpenTabType.ImageViewer:
					result.push(<TabImageViewer key={key} filePath={tab.path} changed={tab.changed} guid={tab.guid} active={active} labelChanged={(l: string) => handleLabelChanged(tab, l)} onSetData={(n: any, c: boolean) => {}} onZoom={() => doJiggleZoom()} />);
					break;
				case OpenTabType.LayoutEditor:
					result.push(<TabLayoutEditor key={key} filePath={tab.path} changed={tab.changed} guid={tab.guid} active={active} labelChanged={(l: string) => handleLabelChanged(tab, l)} onSetData={(n: any, c: boolean) => handleSetData(tab, n, c)} />);
					break;
				case OpenTabType.SpriteFontEditor:
					result.push(<TabSpriteFontEditor key={key} filePath={tab.path} changed={tab.changed} guid={tab.guid} active={active} labelChanged={(l: string) => handleLabelChanged(tab, l)} onSetData={(n: any, c: boolean) => handleSetData(tab, n, c)} />);
					break;
				case OpenTabType.SpriteMapEditor:
					result.push(<TabSpriteMapEditor key={key} filePath={tab.path} 
															  changed={tab.changed}
															  guid={tab.guid} 
															  active={active} 
															  labelChanged={(l: string) => handleLabelChanged(tab, l)} 
															  onSetData={(n: any, c: boolean) => handleSetData(tab, n, c)}
															  onPickImage={(c: Function) => dispatchAppState({ type:'pick-image', value:c })}
															  />);
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
		switch (appState.dialog) {
			case 'settings': result.push(<SettingsDialog key={'settings-dialog'} onCancel={() => dispatchAppState({ type:'dialog', value:'' })} onSettingsChanged={(s:any) => setSettings(s)} />); break;
			case 'new-game': result.push(<NewGameDialog key={'new-game'} onCancel={() => dispatchAppState({ type:'dialog', value:'' })} />); break;
			case 'new-file': result.push(<NewFileDialog key={'new-file'} folderFirst={false} onCancel={() => dispatchAppState({ type:'dialog', value:'' })} selectedFolder={appState.selectedPath || appState.projectPath} projectFolder={appState.projectPath} />); break;
			case 'new-folder': result.push(<NewFileDialog key={'new-file'} folderFirst={true} onCancel={() => dispatchAppState({ type:'dialog', value:'' })} selectedFolder={appState.selectedPath || appState.projectPath} projectFolder={appState.projectPath} />); break;
			case 'game-properties': result.push(<GamePropertiesDialog key={'game-properties'} onCancel={() => dispatchAppState({ type:'dialog', value:'' })} onPropertiesChanged={(s:any) => setProject(s)} />); break;
			case 'pick-image': result.push(<PickImageDialog key={'pick-image'} onClose={(e:any) => dispatchAppState({ type:'pick-image-finished', value:e })} />); break;
		}
		return result;
	};


	const renderDialog2 = () => {
		const result = [];
		switch (appState.dialog2) {
			case 'alert':
				result.push(<AlertDialog key={'alert'} message={appState.dialog2message} onClose={() => dispatchAppState({ type:'alert-finished', value:'' })} />);
				break;
			case 'confirm':
				result.push(<ConfirmDialog key={'confirm'} message={appState.dialog2message} onClose={(r:any) => {
					dispatchAppState({ type:'confirm-finished', value:r });
				}} />);
				break;
			case 'prompt':
				result.push(<PromptDialog key={'prompt'} message={appState.dialog2message} defaultText={appState.dialog2default} onClose={(r:any) => {
					dispatchAppState({ type:'prompt-finished', value:r });
				}} />);
				break;
		}
		return result;
	};


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
						<MenuEntry key="new-file" disabled={false} label={t('new_file')} click={() => doContextMenuAction('new-file', true)} />
						<MenuEntry key="new-folder" label={t('new_folder')} click={() => doContextMenuAction('new-folder')} />
						<hr />
						<MenuEntry key="rename" label={t('rename')} disabled={true} click={() => doContextMenuAction('rename')} />
						<MenuEntry key="delete" label={t('delete')} disabled={true} click={() => doContextMenuAction('delete')} />
					</div>);
			}
			else if (info.name == 'file-explorer-directory') {
				result.push(
					<div key="context-menu" className="context-menu" onBlur={() => {doHideContextMenu()}} style={style}>
						<MenuEntry key="new-file-code" disabled={false} label={t('new_file')} click={() => doContextMenuAction('new-file', true)} />
						<MenuEntry key="new-folder" label={t('new_folder')} click={() => doContextMenuAction('new-folder', true)} />
						<hr />
						<MenuEntry key="rename" label={t('rename')} disabled={true} click={() => doContextMenuAction('rename', true)} />
						<MenuEntry key="delete" label={t('delete')} click={() => doContextMenuAction('delete', true)} />
					</div>);
			}
			else if (info.name == 'file-explorer-item') {
				result.push(
					<div key="context-menu" className="context-menu" onBlur={() => {doHideContextMenu()}} style={style}>
						<MenuEntry key="rename" label={t('rename')} disabled={true} click={() => doContextMenuAction('rename')} />
						<MenuEntry key="delete" label={t('delete')} click={() => doContextMenuAction('delete')} />
					</div>);
			}
		}
		return result;
	};


	// ########################################################################
	// CSS State Constants
	// ########################################################################


	const c_tracking = appState.isTrackingMouse ? 'is-tracking' : '';
	const c_statusbar = appState.showStatusBar ? '' : 'hide-statusbar';
	const c_console = appState.showConsole ? '' : 'hide-console';
	const c_roboto = settings.editor.fontFamily == 'roboto' ? 'font-roboto' : '';
	const c_welcome = appState.isWelcomeVisible ? 'welcome-visible' : '';
	const c_light = settings.editor.colorTheme == 'light' ? 'theme-is-light' : '';


	// ########################################################################
	// Render The App
	// ########################################################################


	return (
		<div className={classList([c_light, c_roboto, c_welcome])}>
			<SettingsContext.Provider value={settings}>
				<ProjectContext.Provider value={project}>

					<MainMenu enabled={!appState.isWelcomeVisible} canSave={appState.canSave} showSidebar={appState.showSidebar} 
								 showStatus={appState.showStatusBar} showConsole={appState.showConsole} showThemeEditor={appState.showThemeEditor}
								 debugging={appState.isDebugging} />

					<div className={classList(['columns', c_tracking, c_statusbar, c_console])} onMouseMove={e => handleMouseMove(e.clientX, e.clientY)} onMouseLeave={e => dispatchAppState({ type: 'is-tracking-mouse', value: '' })}>

						<div id="sidebar" className="column" style={{flexBasis: appState.sidebarWidth + 'px', display: appState.showSidebar ? 'flex' : 'none' }}>
							<div className="column-head tab-labels">
								<div className='tab-label'>{t('files_and_folders')}</div>

								<div className="buttons" style={{display:'none'}}>
									<a className="menu-item" title="Config Game">
										<span className="menu-label"><i className='icon-cog'></i></span>
									</a>
								</div>

							</div>
							<div className="column-body">
								<FileExplorer path="d:/temp" 
									onFileOpen={(filePath: string) => doLoadEditor(filePath)} 
									onContextMenu={(name:string, x:number, y:number, path:string) => doShowContextMenu(name, x, y, path)} 
									focusPath={appState.focusPath} eventPath={appState.eventPath}
									setFocusPath={(p:string) => {
										dispatchAppState({ type:'focus-path', value: p });
										dispatchAppState({ type:'selected-path', value: p });
									}}
									/>
							</div>
						</div>

						<div id="splitter" onMouseDown={e => dispatchAppState({ type: 'is-tracking-mouse', value: 'splitter' })} onMouseUp={e => dispatchAppState({ type: 'is-tracking-mouse', value: '' })} />
					
						<div id="main" className="column">
							<div className="column-head tab-labels">
								{renderTabLabels()}
							</div>
							<div className="column-body" data-count={tabs.length}>
								<div className="main-rows">
									<div className="tab-bodies">
										{renderTabBodies()}
									</div>
									<div id="splitter2" onMouseDown={e => dispatchAppState({ type: 'is-tracking-mouse', value: 'splitter2' })} onMouseUp={e => dispatchAppState({ type: 'is-tracking-mouse', value: '' })} />
									<div id="console" style={{ flexBasis: appState.consoleHeight + 'px', display: appState.showConsole ? 'block' : 'none' }}>
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

					<div id='status-bar'>{t('idle')}</div>
					<WelcomePanel visible={appState.isWelcomeVisible} removeRecent={handleRemoveRecent} />
					<ThemeEditor shown={appState.showThemeEditor} onClose={(e:any) => dispatchAppState({ type: 'toggle-theme-editor' })} onSettingsChanged={(s:any) => setSettings(s)} />
					<DialogContainer key='dialog1' visible={appState.dialog!==''} onClose={() => dispatchAppState({ type: 'dialog', value: '' })}>
						{renderDialog()}
					</DialogContainer>
					<DialogContainer key='dialog2' visible={appState.dialog2!==''} onClose={() => dispatchAppState({ type: 'dialog2', value: '' })}>
						{renderDialog2()}
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