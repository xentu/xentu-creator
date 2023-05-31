import React, { useState, useEffect, useRef } from 'react';
import FileExplorerEntry from './FileExplorerEntry';

declare global {
	interface Window {
	  api?: any;
	}
}

type FileExplorerProps = {
	path: string,
	maxDepth?: number,
	onFileOpen?: Function
}

export default function FileExplorer({ path, maxDepth = 5, onFileOpen }: FileExplorerProps) {
	const [entries, setEntries] = useState([]);
	const [activePath, setActivePath] = useState('');

	useEffect(() => {

		const fetchFiles = async(thePath:string) => {
			const files = await window.api.listFiles(thePath);
			setEntries(files);
		};
		//fetchFiles(path).catch(console.error);

		window.api.onPathChanged((newPath:string) => {
			console.log("Window", newPath);
			fetchFiles(newPath).catch(console.error);
			setActivePath(newPath);
		});

	}, []);

	const setActive = (newPath: string, isDirectory: boolean) => {
		//console.log('SetActive', newPath);
		setActivePath(newPath);
		if (isDirectory == false) {
			onFileOpen(newPath);
		}
	};

	const listEntries = () => {
		const result = new Array<any>();
		entries.map((file: any) => {
			if (file.ext == 'folder') {
				result.push(<FileExplorerEntry key={file.path} label={file.name} path={file.path} directory={file.directory} ext={file.ext} setActive={setActive} activePath={activePath} />);
			}
		});
		entries.map((file: any) => {
			if (file.ext != 'folder') {
				result.push(<FileExplorerEntry key={file.path} label={file.name} path={file.path} directory={file.directory} ext={file.ext} setActive={setActive} activePath={activePath} />);
			}
		});
		return result;
	};

	return (
		<div className="file-explorer-wrapper">
			<ul className="file-explorer">
				{listEntries()}
			</ul>
		</div>
	);
}