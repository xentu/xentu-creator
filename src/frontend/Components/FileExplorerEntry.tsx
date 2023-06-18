import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { Editor, loader } from '@monaco-editor/react';
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


type FileExplorerEntryProps = {
	label: string,
	path?: string,
	directory: boolean,
	ext: string,
	setActive: Function,
	activePath: string,
	/* children?: string | JSX.Element | JSX.Element[] */
}

export default function FileExplorerEntry({ label, path, directory, ext, setActive, activePath }: FileExplorerEntryProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [entries, setEntries] = useState([]);

	const c_open = isOpen ? 'is-open' : '';
	const c_label = directory ? 'has-children' : '';
	const c_active = path == activePath ? 'is-active' : '';

	useEffect(() => {
		if (isOpen == true) {
			const fetchFiles = async() => {
				const files = await window.api.listFiles(path);
				setEntries(files);
			};
			fetchFiles().catch(console.error);
		}
	}, [isOpen]);

	const listEntries = () => {
		const result = new Array<any>();
		entries.map((file: any) => {
			if (file.ext == 'folder') {
				result.push(<FileExplorerEntry key={file.path} path={file.path} label={file.name} directory={file.directory} ext={file.ext} setActive={setActive} activePath={activePath} />);
			}
		});
		entries.map((file: any) => {
			if (file.ext != 'folder') {
				result.push(<FileExplorerEntry key={file.path} path={file.path} label={file.name} directory={file.directory} ext={file.ext} setActive={setActive} activePath={activePath} />);
			}
		});
		return result;
	};

	const labelClicked = () => {
		if (directory) {
			setIsOpen(!isOpen);
			setActive(path, true);
		}
		else {
			setActive(path, false);
		}
	};

	return (
		<li className={['file-entry', c_label, c_open, c_active].join(' ')}>
			<a onClick={() => labelClicked()}>
				<i className="icon-right-open"></i>
				{directory == true && <Icon type={ext} />}
				{directory == false && <i className="file-icon icon-file-code"></i>}
				{/*<Icon type={ext} /> */}
				<span>{label}</span>
			</a>
			{directory == true && <ul className="file-folder">
				{listEntries()}
			</ul>}
		</li>
	);
}