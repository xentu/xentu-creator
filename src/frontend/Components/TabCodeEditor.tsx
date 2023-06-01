import React, { useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import { Editor, loader } from '@monaco-editor/react';

type TabCodeEditorProps = {
	filePath:string, 
	active?:boolean, 
	labelChanged: Function, 
	dataChanged: Function
 };

 type TabCodeEditorState = {
	data?: string; // like this
	lang?: string;
 };

class TabCodeEditor extends React.Component<TabCodeEditorProps, TabCodeEditorState> {
	state: TabCodeEditorState = {
		data: "",
		lang: "text"
	};
	doTest() {
		console.log('test worked for', this.props.filePath);
		//if (action == 'save' && active == true) {
			//console.log("Save action triggered on tab:", filePath);
			//doSave();
		//}
	}
	componentDidMount() {
		const fetchData = async(thePath:string) => {
			const theJSON = await window.api.openFile(thePath);
			const theResponse = JSON.parse(theJSON);
			this.setState({ 
				lang: theResponse.lang,
				data: theResponse.data
			});
			this.props.labelChanged(theResponse.label);
		};
		fetchData(this.props.filePath);
	}
	render() {
		return (
			<div style={{display: this.props.active == true ? 'initial' : 'none' }}>
				<Editor height="100vh" language={this.state.lang} theme="my-dark" value={this.state.data} onChange={e => this.props.dataChanged()} />
			</div>
		);
	}
}


export default TabCodeEditor;