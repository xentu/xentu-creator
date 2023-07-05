import React, { useState, useEffect, useRef } from 'react';
import Icon from '../Icon';


type ComponentProps = {
	label: string,
	path?: string,
	directory: boolean,
	ext: string,
	setActive: Function,
	setFocusPath: Function,
	activePath: string,
	focusPath: string, // the path focused for a context menu.
	eventPath?: string, // passed down the tree when a file event happens.
	onContextMenu: Function
}


export default function FileExplorerEntry(props: ComponentProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [entries, setEntries] = useState([]);

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
	}, [isOpen, props.eventPath]);


	const listEntries = () => {
		const result = new Array<any>();
		entries.map((file: any) => {
			if (file.ext == 'folder') {
				result.push(<FileExplorerEntry key={file.path} path={file.path} label={file.name} directory={file.directory} ext={file.ext} setActive={props.setActive} setFocusPath={props.setFocusPath} activePath={props.activePath} focusPath={props.focusPath} onContextMenu={props.onContextMenu} />);
			}
		});
		entries.map((file: any) => {
			if (file.ext != 'folder') {
				result.push(<FileExplorerEntry key={file.path} path={file.path} label={file.name} directory={file.directory} ext={file.ext} setActive={props.setActive} setFocusPath={props.setFocusPath} activePath={props.activePath} focusPath={props.focusPath} onContextMenu={props.onContextMenu} />);
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
		props.onContextMenu(e, props.path, props.directory);
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
			</ul>}
		</li>
	);
}