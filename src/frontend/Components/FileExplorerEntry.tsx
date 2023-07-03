import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { Editor, loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import FileCreator from './FileCreator';


loader.config({ monaco });


monaco.editor.defineTheme('my-dark', {
	base: 'vs-dark',
	inherit: true,
	rules: [],
	colors: {
		"editor.background": '#2c3835'
	},
});


type FileExplorerEntryProps = {
	label: string,
	path?: string,
	directory: boolean,
	ext: string,
	setActive: Function,
	setFocusPath: Function,
	activePath: string,
	focusPath: string,
	onContextMenu: Function,
	fileCreator?: string,
	setFileCreator: Function,
	onFileCreate: Function
	/* children?: string | JSX.Element | JSX.Element[] */
}


export default function FileExplorerEntry(props: FileExplorerEntryProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [entries, setEntries] = useState([]);
	//const [fileCreatorValue, setFileCreatorValue] = useState(fileCreator);

	const c_open = isOpen ? 'is-open' : '';
	const c_label = props.directory ? 'has-children' : '';
	const c_active = props.path == props.activePath ? 'is-active' : '';
	const c_focus = props.path == props.focusPath ? 'is-context' : '';


	useEffect(() => {
		if (isOpen == true) {
			const fetchFiles = async() => {
				const files = await window.api.listFiles(props.path);
				setEntries(files);
			};
			fetchFiles().catch(console.error);
		}
	}, [isOpen]);


	useEffect(() => {
		if (!isOpen && props.fileCreator == props.path) {
			setIsOpen(true);
		}
	}, [props.fileCreator])


	/* if (fileCreator != fileCreatorValue) {
		setFileCreatorValue(fileCreator);
		if (!isOpen) setIsOpen(true);
	} */


	const listEntries = () => {
		const result = new Array<any>();
		entries.map((file: any) => {
			if (file.ext == 'folder') {
				result.push(<FileExplorerEntry key={file.path} path={file.path} label={file.name} directory={file.directory} ext={file.ext} setActive={props.setActive} setFocusPath={props.setFocusPath} activePath={props.activePath} focusPath={props.focusPath} onContextMenu={props.onContextMenu} fileCreator={props.fileCreator} setFileCreator={props.setFileCreator} onFileCreate={props.onFileCreate} />);
			}
		});
		entries.map((file: any) => {
			if (file.ext != 'folder') {
				result.push(<FileExplorerEntry key={file.path} path={file.path} label={file.name} directory={file.directory} ext={file.ext} setActive={props.setActive} setFocusPath={props.setFocusPath} activePath={props.activePath} focusPath={props.focusPath} onContextMenu={props.onContextMenu} fileCreator={props.fileCreator} setFileCreator={props.setFileCreator} onFileCreate={props.onFileCreate} />);
			}
		});
		return result;
	};


	const labelClicked = () => {
		if (props.directory) {
			setIsOpen(!isOpen);
			props.setActive(props.path, true);
		}
		else {
			props.setActive(props.path, false);
		}
	};


	const triggerContextMenu = (e: React.MouseEvent) => {
		e.stopPropagation();
		props.setFocusPath(props.path);
		props.onContextMenu(e, props.directory);
	};


	return (
		<li className={['file-entry', c_label, c_open, c_active, c_focus].join(' ')}>
			<a onClick={() => labelClicked()} onContextMenu={(e:React.MouseEvent) => triggerContextMenu(e)}>
				<i className="icon-right-open"></i>
				{props.directory == true && <Icon type={props.ext} />}
				{props.directory == false && <i className="file-icon icon-file-code"></i>}
				{/*<Icon type={ext} /> */}
				<span>{props.label}</span>
			</a>
			{props.directory == true && <ul className="file-folder">
				{listEntries()}
				<FileCreator label='Untitled' visible={props.fileCreator == props.path} path={props.path}
								 doHide={() => props.setFileCreator(null)}
								 onSubmit={props.onFileCreate} />
			</ul>}
		</li>
	);
}