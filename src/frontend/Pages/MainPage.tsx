import { useState, useEffect, useRef, MouseEvent, Ref } from 'react';
import FileExplorer from "../Components/FileExplorer";
import TabCodeEditor from "../Components/TabCodeEditor";
import TabItem from "../Components/TabItem";


declare global {
	interface Window {
	  api?: any;
	}
}


type OpenTab = {
	label?: string,
	changed: boolean,
	path: string
};


export default function MainPage() {
	const [sidebarWidth, setSidebarWidth] = useState(240);
	const [isTrackingMouse, setIsTrackingMouse] = useState(false);
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [tabs, setTabs] = useState([]);

	// ########################################################################
	// Event handlers (from back end).
	// ########################################################################

	useEffect(() => {
		window.api.onTriggerAction((action:string) => {
			console.log("Action triggered:", action);
		});
	}, []);


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
		closeTab(tab);
		// don't let the close button bubble to the tab itself.
		e.stopPropagation();
		return false;
	};


	/**
	 * Handle the data changing for a specific tab.
	 * @param tab The tab where data changed.
	 */
	const handleDataChanged = (tab: any) : void => {
		tab.changed = true;
		const tabsCopy = [...tabs];
		setTabs(tabsCopy);
	};


	// ########################################################################
	// Functions
	// ########################################################################


	/**
	 * Set which tab is currently active.
	 * @param tab The tab to set as selected.
	 */
	const setSelectedTab = (tab: OpenTab) => {
		const index = tabs.indexOf(tab);
		setSelectedTabIndex(index);
		console.log("setSelectedTab", index, tab);
	};


	/**
	 * Close a specific tab.
	 * @param tab The tab to close.
	 * @return boolean True if closed, false if canceled.
	 */
	const closeTab = (tab: OpenTab) : boolean => {
		const index = tabs.indexOf(tab);
		console.log("Remove tab " + index);
		if (confirm("Are you sure?")) {
			tabs[index] = null;
			// update the tabs.
			const allNull = tabs.every(el => el === null);
			setTabs(allNull ? [] : [...tabs]);
			// select the next available.
			const nextOpen = findFirstOpenTab();
			setSelectedTab(nextOpen);
			return true;
		}
		return false;
	};

	
	/**
	 * Set the label for an open tab.
	 * @param tab The associated tab.
	 * @param newLabel The new label.
	 */
	const setTabLabel = (tab: any, newLabel: any) => {
		const index = tabs.indexOf(tab);
		const tabsCopy = [...tabs];
		tabsCopy[index].label = newLabel;
		setTabs(tabsCopy);
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
	 * Load an editor for a specific file.
	 * @param filePath The absolute path to the file to edit.
	 */
	const loadEditor = (filePath: string) : void => {
		const ext = filePath.split('.').pop();
		const allowed = ['lua', 'js', 'json', 'toml', 'txt', 'xml', 'py'];
		if (allowed.includes(ext)) {
			const existing = findTab(filePath);
			if (existing !== null) {
				setSelectedTabIndex(tabs.indexOf(existing));
				return;
			}
			setSelectedTabIndex(tabs.length);
			setTabs([...tabs, { path: filePath, label: 'loading...' }]);
		}
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
			result.push(<TabCodeEditor key={"tabBody"+i}  filePath={tab.path} 
												active={selectedTabIndex == i}
												labelChanged={(l: string) => setTabLabel(tab, l)}
												dataChanged={() => handleDataChanged(tab)} 
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
					<FileExplorer path="d:/temp" onFileOpen={(filePath: string) => loadEditor(filePath)} />
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