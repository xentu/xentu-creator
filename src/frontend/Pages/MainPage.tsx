import { Link } from "react-router-dom";
import Logo from "../Components/Logo";
import React, { useState, useEffect, useRef, MouseEvent } from 'react';

import FileExplorer from "../Components/FileExplorer";
import TabCodeEditor from "../Components/TabCodeEditor";
import TabItem from "../Components/TabItem";


/* window.MonacoEnvironment = { 
	getWorkerUrl: function (moduleId, label) {
	  if (label === 'json') return 'static/monaco/json.worker.js';
	  if (label === 'css') return 'static/monaco/css.worker.js';
	  if (label === 'html') return 'static/monaco/html.worker.js';
	  if (label === 'typescript' || label === 'javascript') return 'static/monaco/typescript.worker.js';
	  return 'static/monaco/editor.worker.js';
	}
}; */


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


	const handleMouseMove = (x: any) => {
		if (isTrackingMouse) {
			setSidebarWidth(x + 2);
		}
	};


	const setTab = (tab: OpenTab) => {
		const index = tabs.indexOf(tab);
		setSelectedTabIndex(index);
		console.log("SetTab", index, tab);
	};


	const closeTab = (e: MouseEvent, tab: OpenTab) => {
		const index = tabs.indexOf(tab);
		console.log("Remove tab " + index);
		if (confirm("Are you sure?")) {
			tabs[index] = null;
			// update the tabs.
			const allNull = tabs.every(el => el === null);
			setTabs(allNull ? [] : [...tabs]);
			// select the next available.
			const nextOpen = findFirstOpenTab();
			setTab(nextOpen);
			//this.forceUpdate();
		}
		// don't let the close button bubble to the tab itself.
		e.stopPropagation();
		return false;
	};


	const labelChanged = (tab: any, newLabel: any) => {
		const index = tabs.indexOf(tab);
		const tabsCopy = [...tabs];
		tabsCopy[index].label = newLabel;
		setTabs(tabsCopy);
	};


	const dataChange = (tab: any) => {
		tab.changed = true;
		const tabsCopy = [...tabs];
		setTabs(tabsCopy);
	};


	const renderTabLabels = () => {
		const result = [];
		for (var i=0; i<tabs.length; i++) {
			const tab = tabs[i];
			if (tab == null) continue;
			const label = tab.label + (tab.changed ? '*' : '');
			result.push(<TabItem key={"tabLabel"+i} label={label} active={selectedTabIndex == i} onClick={e => {setTab(tab)}} onClose={e => {closeTab(e, tab);}} />);
		}
		return result;
	};


	const renderTabBodies = () => {
		const result = [];
		for (var i=0; i<tabs.length; i++) {
			const tab = tabs[i];
			if (tab == null) continue;
			result.push(<TabCodeEditor key={"tabBody"+i}  filePath={tab.path} active={selectedTabIndex == i} 
												labelChanged={(label: string) => labelChanged(tab, label)}
												dataChanged={() => dataChange(tab)} 
												/>);
		}
		return result;
	};


	const findTab = (filePath: string) : OpenTab => {
		for (var i=0; i<tabs.length; i++) {
			const tab = tabs[i];
			if (tab == null) continue;
			if (tab.path == filePath) return tab;
		}
		return null;
	};


	const findNextOpenTab = (tab: OpenTab) : OpenTab => {
		const index = tabs.indexOf(tab);
		for (var i=index+1; i<tabs.length; i++) {
			if (tabs[i] != null) return tabs[i];
		}
		return null;
	}


	const findFirstOpenTab = () : OpenTab => {
		for (var i=0; i<tabs.length; i++) {
			if (tabs[i] != null) return tabs[i];
		}
		return null;
	}


	const loadEditor = (filePath: string) => {
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


	return (
		<div className={isTrackingMouse ? 'columns is-tracking' : 'columns'} 
			  onMouseMove={e => handleMouseMove(e.clientX)}
			  onMouseLeave={e => setIsTrackingMouse(false)}>

			<div id="sidebar" className="column" style={{flexBasis: sidebarWidth + 'px' }}>
				<div className="column-head">
					<strong>Xentu Sutori</strong>
				</div>
				<div className="column-body">
					<FileExplorer path="d:/temp" onFileOpen={(filePath: string) => loadEditor(filePath)} />
				</div>
			</div>

			<div id="splitter" onMouseDown={e => setIsTrackingMouse(true)} onMouseUp={e => setIsTrackingMouse(false)} />
		
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