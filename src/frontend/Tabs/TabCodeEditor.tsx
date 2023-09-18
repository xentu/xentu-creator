import React, { useEffect, useState, useContext } from 'react';
import { Editor } from '@monaco-editor/react';
import { SettingsContext } from '../Context/SettingsManager';
import TabToolbar from '../Components/TabToolbar';
import Button from '../Components/Button';
import { classList } from '../helpers';
import './TabCodeEditor.css';


type TabCodeEditorProps = {
	guid: string,
	filePath:string,
	active: boolean,
	changed: boolean,
	labelChanged: Function, 
	onSetData: Function
};


export default function TabCodeEditor(props: TabCodeEditorProps) {
	const [data, setData] = useState('');
	const [lang, setLang] = useState('text');
	const [hasFocus, setHasFocus] = useState(false);
	const settings = useContext(SettingsContext);

	const doEditorAction = (action:string) => {
		const editor = window.findEditor(props.guid);
		if (editor) {
			editor.getAction(action).run();
		}
	};

	const doListenForSelection = () => {
		const editor = window.findEditor(props.guid);
		if (editor) {
			editor.onDidChangeCursorSelection(() => {
				const sel = editor.getSelection();
				const empty = sel.isEmpty();
				setHasFocus(empty == false);
			});
			/* editor.onDidBlurEditorWidget(() => {
				if (editor.getSelection().isEmpty()) setHasFocus(false);
			}); */
		} else {
			console.log('could not find editor');
		}
	};

	useEffect(() => {
		const fetchData = async(thePath:string) => {
			const theJSON = await window.api.openFile(thePath);
			const theResponse = JSON.parse(theJSON);
			setLang(theResponse.lang);
			setData(theResponse.data);
			props.labelChanged(theResponse.label);
			props.onSetData(theResponse.data, false);
			doListenForSelection();
		};
		fetchData(props.filePath);
	}, []);


	return (
		<div className={classList([props.active?'tab-active':'tab-inactive'])}>
			<div className='toolbar-container'>
				<TabToolbar>
					<div className="toolbar-group">
						<Button className='toolbar-button' disabled={!props.changed} onClick={() => window.api.menuSave()}><i className='icon-floppy'></i></Button>
						{/* <Button className='toolbar-button' disabled={true}><i className='icon-arrows-cw'></i></Button> */}
						{/* <Button className='toolbar-button' disabled={true}><i className='icon-indent-left'></i></Button> */}
						<Button className='toolbar-button' disabled={!hasFocus} onClick={() => doEditorAction('editor.action.indentLines')}><i className='icon-indent-right'></i></Button>
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