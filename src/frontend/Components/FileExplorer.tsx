import { useState, useEffect } from 'react';
import FileExplorerEntry from './FileExplorerEntry';
import MenuItem, { MenuEntry } from './MenuItem';
import ContextMenu from './ContextMenu';
import FileCreator from './FileCreator';


declare global {
	interface Window {
	  api?: any;
	}
}


type FileExplorerProps = {
	path: string,
	onFileOpen?: Function
	onContextMenu?: Function,
	focusPath: string,
	setFocusPath: Function,
	fileCreator?: string,
	setFileCreator: Function,
	onFileCreate: Function
}


export default function FileExplorer(props: FileExplorerProps) {
	const [entries, setEntries] = useState([]);
	const [activePath, setActivePath] = useState('');
	const [rootPath, setRootPath] = useState('');

	
	useEffect(() => {
		const fetchFiles = async(thePath:string) => {
			if (thePath == '') {
				setEntries([]);
			}
			else {
				const files = await window.api.listFiles(thePath);
				setEntries(files);
				setRootPath(thePath);
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
			props.onFileOpen(newPath);
		}
	};


	const listEntries = () => {
		const result = new Array<any>();
		entries.map((file: any) => {
			if (file.ext == 'folder') {
				result.push(<FileExplorerEntry key={file.path} label={file.name}
														 path={file.path} directory={file.directory}
														 ext={file.ext} setActive={setActive}
														 setFocusPath={props.setFocusPath}
														 onContextMenu={(e: React.MouseEvent, directory:boolean) => showContextMenu(e, file.path, directory)}
														 activePath={activePath}
														 focusPath={props.focusPath}
														 setFileCreator={props.setFileCreator}
														 fileCreator={props.fileCreator}
														 onFileCreate={props.onFileCreate} />);
			}
		});
		entries.map((file: any) => {
			if (file.ext != 'folder') {
				result.push(<FileExplorerEntry key={file.path} label={file.name} 
													    path={file.path} directory={file.directory}
														 ext={file.ext} setActive={setActive}
														 setFocusPath={props.setFocusPath}
														 onContextMenu={(e: React.MouseEvent, directory:boolean) => showContextMenu(e, file.path, directory)}
														 activePath={activePath}
														 focusPath={props.focusPath}
														 setFileCreator={props.setFileCreator}
														 fileCreator={props.fileCreator}
														 onFileCreate={props.onFileCreate} />);
			}
		});
		return result;
	};

	
	const showContextMenu = (e: React.MouseEvent, path:string, directory:boolean) => {
		if (directory) {
			props.onContextMenu('file-explorer-directory', e.clientX, e.clientY, path);
		}
		else {
			props.onContextMenu('file-explorer-item', e.clientX, e.clientY, path);
		}
	};


	const showContextMenuOutside = (e: React.MouseEvent) => {
		e.stopPropagation();
		props.setFocusPath(null);
		props.onContextMenu('file-explorer', e.clientX, e.clientY);
	};


	return (
		<div className="file-explorer-wrapper" 
			  onContextMenu={(e:any) => showContextMenuOutside(e)}
			  >
			<ul className="file-explorer">
				{listEntries()}
				<FileCreator label='Untitled' visible={props.fileCreator==''} 
								 path={rootPath}
								 doHide={() => props.setFileCreator(null)} onSubmit={props.onFileCreate} />
			</ul>
		</div>
	);
}