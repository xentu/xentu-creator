import React, { useEffect, useState, useContext } from 'react';
import { Editor } from '@monaco-editor/react';
import { SettingsContext } from '../Context/SettingsManager';
import TabToolbar from '../Components/TabToolbar';


type TabCodeEditorProps = {
	guid: string,
	filePath:string,
	active: boolean,
	labelChanged: Function, 
	onSetData: Function
};


export default function TabCodeEditor(props: TabCodeEditorProps) {
	const [data, setData] = useState('');
	const [lang, setLang] = useState('text');
	const settings = useContext(SettingsContext);

	useEffect(() => {
		const fetchData = async(thePath:string) => {
			const theJSON = await window.api.openFile(thePath);
			const theResponse = JSON.parse(theJSON);
			setLang(theResponse.lang);
			setData(theResponse.data);
			props.labelChanged(theResponse.label);
			props.onSetData(theResponse.data, false);
		};
		fetchData(props.filePath);
	}, []);

	return (
		<div className={[props.active?'tab-active':'tab-inactive'].join(' ')}>
			<div className='toolbar-container'>
				<TabToolbar>
					<div className="toolbar-group">
						<a className="toolbar-button is-disabled"><i className='icon-floppy'></i></a>
						<a className="toolbar-button is-disabled"><i className='icon-arrows-cw'></i></a>
						<a className="toolbar-button is-disabled"><i className='icon-indent-left'></i></a>
						<a className="toolbar-button is-disabled"><i className='icon-indent-right'></i></a>
					</div>
				</TabToolbar>
				<Editor className={`monaco-${props.guid}`} language={lang} theme='my-theme'
						options={{ 
								lineNumbers: settings.editor.enableLineNumbers == true ? 'on' : 'off',
								codeLens: settings.editor.enableCodeLens == true,
								fontSize: settings.editor.fontSize ?? 14,
								minimap: { enabled: settings.editor.enableMinimap == true }
						}}
						value={data} onChange={(newValue, e) => props.onSetData(newValue, true)} />
			</div>
		</div>
	);
}