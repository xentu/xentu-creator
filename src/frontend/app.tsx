import { createRoot } from 'react-dom/client';
import { useState, useEffect, useRef, MouseEvent } from 'react';
import FileExplorer from "./Components/FileExplorer";
import DialogContainer from "./Components/DialogContainer";
import TabCodeEditor from "./Components/TabCodeEditor";
import TabImageViewer from "./Components/TabImageViewer";
import TabItem from "./Components/TabItem";
import WelcomePanel from './Components/WelcomePanel';
import OpenTab, { OpenTabType } from "./Classes/OpenTab";
import SettingsDialog from './Dialogs/SettingsDialog';
import { SettingsContext } from './Context/SettingsManager';
import { ProjectContext, ProjectSchema } from './Context/ProjectManager';
import { XTerm } from 'xterm-for-react';
import NewGameDialog from './Dialogs/NewGameDialog';
import GamePropertiesDialog from './Dialogs/GamePropertiesDialog';
import MainMenu from './Components/MainMenu';
import ThemeEditor from './Components/ThemeEditor';
import ContextMenu from './Components/ContextMenu';
import { MenuEntry } from './Components/MenuItem';
require('./windowFuncs');


declare global {
	interface Window {
	  api?: any;
	  findEditor: Function,
	  xterm: any
	}
}


type appProps = {
	loadedSettings: any
};

type contextMenuInfo = {
	name: string,
	x: number,
	y: number
};


const container = document.getElementById('app');
const root = createRoot(container!);


function App({ loadedSettings }: appProps) {
	const [sidebarWidth, setSidebarWidth] = useState(240);
	const [consoleHeight, setConsoleHeight] = useState(150);
	const [isTrackingMouse, setIsTrackingMouse] = useState(''); /* stored as string, empty means false */
	const [isWelcomeVisible, setIsWelcomeVisible] = useState(true);
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [tabsChangeContext, setTabChangeContext] = useState(null);
	const [tabs, setTabs] = useState(new Array<OpenTab>());
	const [project, setProject] = useState({} as ProjectSchema);
	const [settings, setSettings] = useState(loadedSettings);
	const [dialog, setDialog] = useState('');
	const [contextMenu, setContextMenu] = useState(null);
	const [showSidebar, setShowSidebar] = useState(true);
	const [showConsole, setShowConsole] = useState(true);
	const [showStatusBar, setShowStatusBar] = useState(true);
	const [showThemeEditor, setShowThemeEditor] = useState(false);
	const [debugging, setDebugging] = useState(false);
	const [focusPath, setFocusPath] = useState('');
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
		/* window.api.getSettings().then((foundSettings:any) => {
			setSettings(foundSettings);
		}); */
		window.onresize = () => { handleAction.current('resize', ''); }

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

	}, []);


	useEffect(() => {
		if (tabsChangeContext === null) return;
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


	useEffect(() => {
		document.onkeyup = (e:KeyboardEvent) => {
			console.log("keyup", e.key);
			if (e.key == 'Escape') {
				setContextMenu('');
				setFocusPath('');
			}
		};
	}, []);


	// ########################################################################
	// Event handlers (from back end).
	// ########################################################################


	/**
	 * 
	 */
	handleAction.current = (action:string, data?:string) => {
		console.log('handleAction', action);
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
		}	

		if (tabs.length > 0) {
			switch (action) {
				case 'save':
					doSaveTab( findActiveTab() );
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
					if (tab && tab.guid && tab.type == OpenTabType.Editor) {
						const editor = window.findEditor(tab.guid);
						editor.layout({  });
					}
					break;
				case 'game-started':	setDebugging(true); break;
				case 'game-stopped':	setDebugging(false); break;
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
				--sidebarHoverBackground: ${th.sidebarHoverBackground};
				--sidebarHoverText: ${th.sidebarHoverText};
				--sidebarActiveBackground: ${th.sidebarActiveBackground};
				--sidebarActiveText: ${th.sidebarActiveText};
				--editorBackground: ${th.editorBackground};
				--editorText: ${th.editorText};
				--footerBackground: ${th.footerBackground};
				--footerBackgroundHs: ` + window.hexToHs(th.footerBackground) + `;
				--footerBackgroundL: ` + window.hexToHsl(th.footerBackground)[2] + `%;
				--footerBackgroundDark: hsl(var(--footerBackgroundHs), calc(var(--footerBackgroundL) - 5%));
				--footerText: ${th.footerText};
			}
		`;
		window.changeThemeColors(dark, th.editorBackground);

		window.xterm.setOption('theme', { 
			background: settings.theme[dark?'dark':'light'].terminalBackground,
			foreground: settings.theme[dark?'dark':'light'].terminalText,
		});

		/* xtermRef.current.terminal.setOption('theme', {
			background: th.terminalBackground
	  	}); */
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

		if (['lua', 'js', 'json', 'toml', 'txt', 'xml', 'py'].includes(ext)) {
			const existing = findTab(filePath);
			if (existing !== null) {
				setSelectedTab(existing);
				return;
			}
			//setSelectedTabIndex(tabs.length);
			const newTab = new OpenTab('loading...', filePath, OpenTabType.Editor);
			setTabChangeContext(newTab);
			setTabs([...tabs, newTab]);
		}

		if (['jpg', 'png'].includes(ext)) {
			const existing = findTab(filePath);
			if (existing !== null) {
				setSelectedTab(existing);
				return;
			}
			const newTab = new OpenTab('loading...', filePath, OpenTabType.ImageViewer);
			setTabChangeContext(newTab);
			setTabs([...tabs, newTab]);
		}
	};


	/**
	 * Sets the arguments for where to show a context menu.
	 */
	const doShowContextMenu = (name:string, x:number, y:number) : void => {
		setContextMenu({ name, x, y });
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


	const doEditorResize = () => {
		const tab = findActiveTab();
		if (tab && tab.guid) {
			const editor = window.findEditor(tab.guid);
			editor.layout();
			console.log('editor resized');
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
		if (tab.changed == false || confirm("Are you sure?")) {
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


	// ########################################################################
	// ReactJS Render Methods
	// ########################################################################


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


	const renderTabBodies = () => {
		const result = [];
		for (var i=0; i<tabs.length; i++) {
			const tab = tabs[i];
			if (tab == null) continue;
			if (tab.type == OpenTabType.Editor) {
				result.push(<TabCodeEditor key={"tabBody"+i} filePath={tab.path} guid={tab.guid}
												active={selectedTabIndex == i}
												labelChanged={(l: string) => handleLabelChanged(tab, l)}
												onSetData={(n: any, c: boolean) => handleSetData(tab, n, c)} 
												/>);
			}
			else if (tab.type == OpenTabType.ImageViewer) {
				result.push(<TabImageViewer key={"tabBody"+i} filePath={tab.path} guid={tab.guid}
												active={selectedTabIndex == i}
												labelChanged={(l: string) => handleLabelChanged(tab, l)}
												onSetData={(n: any, c: boolean) => {}} 
												/>);
			}
			
		}
		return result;
	};


	const renderDialog = () => {
		const result = [];
		switch (dialog) {
			case 'settings': result.push(<SettingsDialog key={'settings-dialog'} onSettingsChanged={(s:any) => setSettings(s)} />); break;
			case 'new-game': result.push(<NewGameDialog key={'new-game'} createGameCallback={(opts:any) => { console.log("newGame", opts); }} />); break;
			case 'game-properties': result.push(<GamePropertiesDialog key={'game-properties'} onPropertiesChanged={(s:any) => setProject(s)} />); break;
		}
		return result;
	};


	const renderContextMenu = () => {
		const result = [];
		if (contextMenu !== null) {
			const info = contextMenu as contextMenuInfo;
			const style = { left:info.x+'px', top: info.y+'px' };
			if (info.name == 'file-explorer') {
				result.push(
					<div key="context-menu" className="context-menu" onBlur={() => {doHideContextMenu()}} style={style}>
						<MenuEntry key="new-file" label="New File..." />
						<MenuEntry key="new-folder" label="New Folder..." />
						<hr />
						<MenuEntry key="rename" label="Rename" />
						<MenuEntry key="delete" label="Delete" />
					</div>);
			}
			else if (info.name == 'file-explorer-directory') {
				result.push(
					<div key="context-menu" className="context-menu" onBlur={() => {doHideContextMenu()}} style={style}>
						<MenuEntry key="new-file" label="New File..." />
						<MenuEntry key="new-folder" label="New Folder..." />
						<hr />
						<MenuEntry key="rename" label="Rename" />
						<MenuEntry key="delete" label="Delete" />
					</div>);
			}
			else if (info.name == 'file-explorer-item') {
				result.push(
					<div key="context-menu" className="context-menu" onBlur={() => {doHideContextMenu()}} style={style}>
						<MenuEntry key="rename" label="Rename" />
						<MenuEntry key="delete" label="Delete" />
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

					<MainMenu enabled={!isWelcomeVisible} showSidebar={showSidebar} showStatus={showStatusBar}
								 showConsole={showConsole} showThemeEditor={showThemeEditor} debugging={debugging} />

					<div className={['columns', c_tracking, c_statusbar, c_console].join(' ')} 
						onMouseMove={e => handleMouseMove(e.clientX, e.clientY)}
						onMouseLeave={e => setIsTrackingMouse('')}>

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
												  onContextMenu={(name:string, x:number, y:number) => doShowContextMenu(name, x, y)}
												  focusPath={focusPath} setFocusPath={setFocusPath} />
							</div>
						</div>

						<div id="splitter" onMouseDown={e => setIsTrackingMouse('splitter')} 
												onMouseUp={e => setIsTrackingMouse('')} />
					
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
									<div id="console" style={{ flexBasis: consoleHeight + 'px', display: showConsole ? 'block' : 'none' }}>
										<XTerm ref={xtermRef} options={{ 
											rows: 8, 
											allowTransparency: true,
											/* theme: {
												background: settings.theme[isDark?'dark':'light'].terminalBackground,
												foreground: settings.theme[isDark?'dark':'light'].terminalText
											} */
										}} />
									</div>
								</div>
							</div>						
						</div>
					</div>


					<div id='status-bar'>Idle.</div>


					<WelcomePanel visible={isWelcomeVisible} />

					<ThemeEditor shown={showThemeEditor} 
									onClose={(e:any) => setShowThemeEditor(!showThemeEditor)}
									onSettingsChanged={(s:any) => setSettings(s)} />
					
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