import React, { useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import { Editor, loader } from '@monaco-editor/react';

type TabCodeEditorProps = {
	filePath: string,
	active?: boolean,
	labelChanged: Function,
	dataChanged: Function,
}

declare global {
	interface Window {
	  api?: any;
	}
}


export default function TabCodeEditor({ filePath, active, labelChanged, dataChanged }: TabCodeEditorProps) {
	const [data, setData] = useState('');
	const [lang, setLang] = useState('text');

	useEffect(() => {
		const fetchData = async(thePath:string) => {
			const theJSON = await window.api.openFile(thePath);
			const theResponse = JSON.parse(theJSON);
			setLang(theResponse.lang);
			setData(theResponse.data);
			labelChanged(theResponse.label);
		};
		fetchData(filePath);
	}, []);

	return (
		<div style={{display: active == true ? 'initial' : 'none' }}>
			<Editor height="100vh" language={lang} theme="my-dark" value={data} onChange={e => dataChanged()} />
		</div>
	);
}