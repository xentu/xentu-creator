import { useState, useEffect, useRef, MouseEvent, Ref } from 'react';
import FileExplorer from "../Components/FileExplorer";
import TabCodeEditor from "../Components/TabCodeEditor";
import TabItem from "../Components/TabItem";
import OpenTab from "../Classes/OpenTab";
import * as monaco from 'monaco-editor';


declare global {
	interface Window {
	  api?: any;
	  findEditor: Function
	}
}


/**
 * Helper function for locating a Monaco editor by a guid we assigned.
 * @param guid The guid attached to an OpenTab instance.
 * @returns The Monaco editor instance
 */
window.findEditor = function(guid:string) {
	const editors = monaco.editor.getEditors();
	const found = editors.filter(editor => {
		const div = editor.getDomNode();
		return div.parentElement.classList.contains('monaco-' + guid);
	});
	return found.length > 0 ? found[0] : null;
};


export default function MainPage() {
	const [sidebarWidth, setSidebarWidth] = useState(240);
	const [isTrackingMouse, setIsTrackingMouse] = useState(false);
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [tabsChangeContext, setTabChangeContext] = useState(null);
	const [tabs, setTabs] = useState(new Array<OpenTab>());
	const handleAction = useRef(null);

	
	useEffect(() => {
		window.api.onTriggerAction((action:string) => { handleAction.current(action); });
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


	// ########################################################################
	// Event handlers (from back end).
	// ########################################################################


	handleAction.current = (action:string) => {
		if (tabs.length <= 0) return;
		// note: if actions ever stop working, make sure tabs has correct length.
		switch (action) {
			case 'save':
				doSaveTab( findActiveTab() );
				break;
			case 'select-all':
				doSelectAll();
				break;
		}		
	};


	// ########################################################################
	// Event handlers (front end).
	// ########################################################################


	/**
	 * Handles the mouse moving.
	 */
	const handleMouseMove = (x: any, y: any) => {
		if (isTrackingMouse) {
			setSidebarWidth(x + 2);
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
		const allowed = ['lua', 'js', 'json', 'toml', 'txt', 'xml', 'py'];
		if (allowed.includes(ext)) {
			const existing = findTab(filePath);
			if (existing !== null) {
				setSelectedTab(existing);
				return;
			}
			//setSelectedTabIndex(tabs.length);
			const newTab = new OpenTab('loading...', filePath);
			setTabChangeContext(newTab);
			setTabs([...tabs, newTab]);
		}
	};

	
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


	const doUpdateWindowTitle = () => {
		try {
			const activeTab = findActiveTab();
			if (activeTab !== null) {
				const label = activeTab.label ?? 'Untitled';
				window.api.setTitle(`${label} - Xentu Creator`);
			}
			else {
				window.api.setTitle(`Xentu Creator`);
			}
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
			result.push(<TabCodeEditor key={"tabBody"+i} filePath={tab.path} guid={tab.guid}
												active={selectedTabIndex == i}
												labelChanged={(l: string) => handleLabelChanged(tab, l)}
												onSetData={(n: any, c: boolean) => handleSetData(tab, n, c)} 
												/>);
		}
		return result;
	};


	return (
		<div className={isTrackingMouse ? 'columns is-tracking' : 'columns'} 
			  onMouseMove={e => handleMouseMove(e.clientX, e.clientY)}
			  onMouseLeave={e => setIsTrackingMouse(false)}>

			<div id="sidebar" className="column" style={{flexBasis: sidebarWidth + 'px' }}>
				<div className="column-head">
					<strong>Xentu Sutori</strong>
				</div>
				<div className="column-body">
					<FileExplorer path="d:/temp" onFileOpen={(filePath: string) => doLoadEditor(filePath)} />
				</div>
			</div>

			<div id="splitter" onMouseDown={e => setIsTrackingMouse(true)} 
									 onMouseUp={e => setIsTrackingMouse(false)} />
		
			<div id="main" className="column">
				<div className="column-head tab-labels">
					{renderTabLabels()}
				</div>
				<div className="column-body" data-count={tabs.length}>
					{renderTabBodies()}
				</div>
			</div>
	
		</div>
	);
}