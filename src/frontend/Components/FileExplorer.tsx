import { useState, useEffect } from 'react';
import FileExplorerEntry from './FileExplorerEntry';
import MenuItem, { MenuEntry } from './MenuItem';
import ContextMenu from './ContextMenu';


declare global {
	interface Window {
	  api?: any;
	}
}


type FileExplorerProps = {
	path: string,
	maxDepth?: number,
	onFileOpen?: Function
	onContextMenu?: Function,
	focusPath: string,
	setFocusPath: Function
}


export default function FileExplorer({ path, maxDepth = 5, onFileOpen, onContextMenu, focusPath, setFocusPath }: FileExplorerProps) {
	const [entries, setEntries] = useState([]);
	const [activePath, setActivePath] = useState('');

	useEffect(() => {
		const fetchFiles = async(thePath:string) => {
			if (thePath == '') {
				setEntries([]);
			}
			else {
				const files = await window.api.listFiles(thePath);
				setEntries(files);
			}
		};
		window.api.onProjectPathChanged((newPath:string) => {
			fetchFiles(newPath).catch(console.error);
			//setActivePath(newPath);
		});
	}, []);

	const setActive = (newPath: string, isDirectory: boolean) => {
		setActivePath(newPath);
		if (isDirectory == false) {
			onFileOpen(newPath);
		}
	};

	const listEntries = () => {
		const result = new Array<any>();
		entries.map((file: any) => {
			if (file.ext == 'folder') {
				result.push(<FileExplorerEntry key={file.path} label={file.name}
														 path={file.path} directory={file.directory}
														 ext={file.ext} setActive={setActive}
														 setFocusPath={setFocusPath}
														 onContextMenu={(e: React.MouseEvent, directory:boolean) => showContextMenu(e, directory)}
														 activePath={activePath}
														 focusPath={focusPath} />);
			}
		});
		entries.map((file: any) => {
			if (file.ext != 'folder') {
				result.push(<FileExplorerEntry key={file.path} label={file.name} 
													    path={file.path} directory={file.directory}
														 ext={file.ext} setActive={setActive}
														 setFocusPath={setFocusPath}
														 onContextMenu={(e: React.MouseEvent, directory:boolean) => showContextMenu(e, directory)}
														 activePath={activePath}
														 focusPath={focusPath} />);
			}
		});
		return result;
	};

	
	const showContextMenu = (e: React.MouseEvent, directory:boolean) => {
		if (directory) {
			onContextMenu('file-explorer-directory', e.clientX, e.clientY);
		}
		else {
			onContextMenu('file-explorer-item', e.clientX, e.clientY);
		}
	};


	const showContextMenuOutside = (e: React.MouseEvent) => {
		e.stopPropagation();
		setFocusPath(null);
		onContextMenu('file-explorer', e.clientX, e.clientY);
	};


	return (
		<div className="file-explorer-wrapper" 
			  onContextMenu={(e:any) => showContextMenuOutside(e)}
			  >
			<ul className="file-explorer">
				{listEntries()}
			</ul>
		</div>
	);
}