import React, { useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import { Editor, loader } from '@monaco-editor/react';
import { OpenTabState } from '../Classes/OpenTab';

type TabCodeEditorProps = {
	filePath:string,
	active: boolean,
	labelChanged: Function, 
	onSetData: Function
};

type TabCodeEditorState = {
	data?: string; // like this
	lang?: string;
};


export default function TabCodeEditor({ filePath, active, labelChanged, onSetData }: TabCodeEditorProps) {
	const [data, setData] = useState('');
	const [lang, setLang] = useState('text');

	useEffect(() => {
		const fetchData = async(thePath:string) => {
			const theJSON = await window.api.openFile(thePath);
			const theResponse = JSON.parse(theJSON);
			setLang(theResponse.lang);
			setData(theResponse.data);
			labelChanged(theResponse.label);
			onSetData(theResponse.data, false);
		};
		fetchData(filePath);
	}, []);

	return (
		<div style={{display: active == true ? 'initial' : 'none' }}>
			<Editor height="100vh" language={lang} theme="my-dark" value={data} onChange={(newValue, e) => onSetData(newValue, true)} />
		</div>
	);
}