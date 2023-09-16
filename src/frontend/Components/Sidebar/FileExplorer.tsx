import { useState, useEffect } from 'react';
import FileExplorerEntry from './FileExplorerEntry';
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';


loader.config({ monaco });


monaco.editor.defineTheme('my-dark', {
	base: 'vs-dark',
	inherit: true,
	rules: [],
	colors: {
		"editor.background": '#2c3835'
	},
});


declare global {
	interface Window {
	  api?: any;
	}
}


type ComponentProps = {
	path: string,
	onFileOpen?: Function
	onContextMenu?: Function,
	focusPath: string,
	eventPath?: string,
	setFocusPath: Function
}


export default function FileExplorer(props: ComponentProps) {
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
			if (file.name == '.git') return;
			if (file.ext == 'folder') {
				result.push(<FileExplorerEntry key={file.path} label={file.name}
														 path={file.path} directory={file.directory}
														 ext={file.ext} setActive={setActive}
														 setFocusPath={props.setFocusPath}
														 onContextMenu={(e: React.MouseEvent, path:string, directory:boolean) => showContextMenu(e, path, directory)}
														 activePath={activePath} eventPath={props.eventPath}
														 focusPath={props.focusPath} />);
			}
		});

		const hiddenFiles = ['game.json', 'editor.json'];

		entries.map((file: any) => {
			if (hiddenFiles.includes(file.name)) return;
			if (file.ext != 'folder') {
				result.push(<FileExplorerEntry key={file.path} label={file.name} 
													    path={file.path} directory={file.directory}
														 ext={file.ext} setActive={setActive}
														 setFocusPath={props.setFocusPath}
														 onContextMenu={(e: React.MouseEvent, path:string, directory:boolean) => showContextMenu(e, path, directory)}
														 activePath={activePath} eventPath={props.eventPath}
														 focusPath={props.focusPath} />);
			}
		});
		return result;
	};

	
	const showContextMenu = (e:React.MouseEvent, path:string, directory:boolean) => {
		e.stopPropagation();
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
			</ul>
		</div>
	);
}