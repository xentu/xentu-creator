import React, { useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';

type TabCodeEditorProps = {
	guid: string,
	filePath:string,
	active: boolean,
	labelChanged: Function, 
	onSetData: Function
};

type TabCodeEditorState = {
	data?: string; // like this
	lang?: string;
};


export default function TabCodeEditor({ guid, filePath, active, labelChanged, onSetData }: TabCodeEditorProps) {
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
			<Editor className={`monaco-${guid}`} height="100vh" language={lang} theme="my-dark" value={data} onChange={(newValue, e) => onSetData(newValue, true)} />
		</div>
	);
}