import React, { useEffect, useRef, useState, useContext } from 'react';
import { SettingsContext } from '../Context/SettingsManager';
import TabToolbar from '../Components/TabToolbar';
import Button from '../Components/Button';
import ConversationMoment from '../Components/ConversationMoment';
import './TabConversationEditor.css';
import PropertyTable, { KeyValuePair } from '../Components/PropertyTable';


type ComponentProps = {
	guid: string,
	filePath:string,
	active: boolean,
	changed: boolean,
	labelChanged: Function, 
	onSetData: Function
};


type MomentEntry = {
	content: string,
	actor?: string,
	id?: string,
	goto?: string,
	clear: boolean,
	options: Array<string>,
	properties: Array<KeyValuePair>
}


const defaultEntries = [] as Array<MomentEntry>;
/* for (var i=0; i<10; i++) {
	defaultEntries.push({
		content: "test test test",
		actor: i == 5 ? "Dave" : "",
		id: '',
		goto: '',
		clear: false,
		options: [],
		properties: []
	});
} */

const dataTest = new Array<KeyValuePair>();
dataTest.push({ key: 'george', value: '52' });
dataTest.push({ key: 'andrew', value: '32' });
dataTest.push({ key: 'rachel', value: '27' });


export default function TabConversationEditor(props: ComponentProps) {
	const [entries, setEntries] = useState([...defaultEntries]);
	const [rightBarWidth, setRightBarWidth] = useState(300);
	const [isTrackingMouse, setIsTrackingMouse] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const [loaded, setLoaded] = useState(false);
	const settings = useContext(SettingsContext);
	const containerRef = useRef(null);


	// ########################################################################
	// Use Effect Handlers
	// ########################################################################


	useEffect(() => {
		const fetchData = async(thePath:string) => {
			const theJSON = await window.api.openFile(thePath);
			const theResponse = JSON.parse(theJSON);
			let data = theResponse.data == '' ? [...defaultEntries] : JSON.parse(theResponse.data);
			setEntries(data);
			props.labelChanged(theResponse.label);
			await props.onSetData(theResponse.data, false);
			setTimeout(() => setLoaded(true), 100);
		};
		fetchData(props.filePath);
	}, []);


	/**
	 * Propagate new data to save when entries change.
	 */
	useEffect(() => {
		if (loaded) {
			console.log('yo');
			const saveEntries = [...entries];

			/* strip out empty id, actor, goto */
			for (var i=0; i<saveEntries.length; i++) {
				if (saveEntries[i].id == '') saveEntries[i].id = null;
				if (saveEntries[i].actor == '') saveEntries[i].actor = null;
				if (saveEntries[i].goto == '') saveEntries[i].goto = null;
			}

			let replacer = (key:any, value:any) => value === null ? undefined : value;
			let data = JSON.stringify(saveEntries, replacer, 2);
			props.onSetData(data, true);
		}
	}, [entries]);


	/**
	 * Handles the mouse moving.
	 */
	const handleMouseMove = (x: any, y: any) => {
		if (isTrackingMouse) {
			const w = window.innerWidth;
			const tw = w - x - 2;
			setRightBarWidth(w - x - 2);
		}
	};


	const setEntryContent = (index:number, newContent:string) => {
		const newEntries = [...entries];
		if (newEntries[index].content != newContent) {
			newEntries[index].content = newContent;
			setEntries(newEntries);
		}
	};


	const setEntryActor = (index:number, newActor:string) => {
		const newEntries = [...entries];
		if (newEntries[index].actor != newActor) {
			newEntries[index].actor = newActor;
			setEntries(newEntries);
		}
	};


	const setEntryId = (index:number, newValue:string) => {
		const newEntries = [...entries];
		if (newEntries[index].id != newValue) {
			newEntries[index].id = newValue;
			setEntries(newEntries);
		}
	};


	const setEntryGoto = (index:number, newValue:string) => {
		const newEntries = [...entries];
		if (entries[index].goto != newValue) {
			entries[index].goto = newValue;
			setEntries(newEntries);
		}
	};

	
	const setEntryClear = (index:number, newValue:boolean) => {
		const newEntries = [...entries];
		entries[index].clear = newValue;
		setEntries(newEntries);
	};


	const setEntryProps = (index:number, newProps:Array<KeyValuePair>) => {
		const newEntries = [...entries];
		entries[index].properties = newProps;
		setEntries(newEntries);
	};


	const addEntryOption = (index:number) => {
		const newEntries = [...entries];
		const newText = `Option Text`;
		newEntries[index].options.push(newText);
		setEntries(newEntries);
	};


	const addEntryProperty = (index:number) => {
		const newEntries = [...entries];
		newEntries[index].properties.push({ key: "untitled", value: "" });
		setEntries(newEntries);
	};


	const doRemoveOption = (momentIndex:number, optionIndex:number) => {
		const newEntries = [...entries];
		newEntries[momentIndex].options.splice(optionIndex, 1);
		setEntries(newEntries);
	};


	const listMoments = () => {
		const result = [];
		for (var i=0; i<entries.length; i++) {
			result.push(<ConversationMoment key={'entry'+i} index={i} 
								selected={i==selectedIndex}
								label={entries[i].actor}
								content={entries[i].content}
								options={entries[i].options}
								setContent={setEntryContent}
								setFocus={setSelectedIndex}
								doRemoveOption={doRemoveOption}
								/>);
		}
		return result;
	};


	const addEntry = () => {
		const newEntries = [...entries];
		const newMoment = {
			content: "content goes here",
			clear: false,
			options: [],
			properties: []
		} as MomentEntry;

		if (selectedIndex >= 0 && selectedIndex < newEntries.length - 1) {
			newEntries.splice(selectedIndex + 1, 0, newMoment);
		}
		else {
			newEntries.push(newMoment);
		}

		setEntries(newEntries);
	};


	const removeEntry = () => {
		if (entries.length > 0) {
			entries.splice(selectedIndex, 1);
			setEntries([...entries]);
			setSelectedIndex(-1);
		}
	};


	return (
		<div className={[props.active?'tab-active':'tab-inactive'].join(' ')}>
			<div className="toolbar-container">
				<div className='right-bar-container' ref={containerRef}
					onMouseMove={e => handleMouseMove(e.clientX, e.clientY)}
					onMouseLeave={e => setIsTrackingMouse(false)}>

					<div className='toolbar-container'>
						<TabToolbar>
							<div className="toolbar-group">
								<Button className='toolbar-button' disabled={!props.changed} onClick={() => window.api.menuSave()}><i className='icon-floppy'></i></Button>
								<Button className='toolbar-button' disabled={false} onClick={addEntry}><i className="icon-plus-squared"></i></Button>
								<Button className='toolbar-button' disabled={false} onClick={removeEntry}><i className="icon-minus-squared"></i></Button>
							</div>
						</TabToolbar>
						<section className='conversation-viewer'>
							<div className='moment-list'>
								{listMoments()}
							</div>
						</section>
					</div>

					<span id="splitter3" onMouseDown={e => setIsTrackingMouse(true)} onMouseUp={e => setIsTrackingMouse(false)} />

					<aside data-title="" style={{width:rightBarWidth+'px'}}>
						{selectedIndex >= 0 && <>
							{/*<i>Selected Moment: #{selectedIndex}</i>*/}

							<div className="conversation-property" style={{marginTop: '0'}}>
								<label>Actor:</label>
								<input className="input" type="text" value={entries[selectedIndex].actor ?? ""} onChange={(e:any) => setEntryActor(selectedIndex, e.target.value)} />
							</div>

							<div className="conversation-property">
								<label>ID:</label>
								<input className="input" type="text" value={entries[selectedIndex].id ?? ""} onChange={(e:any) => setEntryId(selectedIndex, e.target.value)} />
							</div>

							<div className="conversation-property">
								<label>Goto:</label>
								<input className="input" type="text" value={entries[selectedIndex].goto ?? ""} onChange={(e:any) => setEntryGoto(selectedIndex, e.target.value)} />
							</div>

							<div className="conversation-property">
								<label>Clear:</label>
								<span className={`toggle-button ${entries[selectedIndex].clear?'is-toggled':''}`} style={{margin:'5px 0 0 0'}} onClick={(e:any) => {
									const c = entries[selectedIndex].clear;
									setEntryClear(selectedIndex, !c);
								}}></span>
							</div>

							<div className="conversation-property" style={{marginBottom:'10px'}}>
								<div className="buttons" style={{margin: '6px 0 6px 0'}}>
									<a className="button" onClick={() => addEntryOption(selectedIndex)}>Add Option</a>
									<a className="button" onClick={() => addEntryProperty(selectedIndex)}>Add Property</a>
								</div>
							</div>

							<div className="conversation-property">
								<label>Properties:</label>
								<PropertyTable table={entries[selectedIndex].properties} setTable={(newData:Array<KeyValuePair>) => setEntryProps(selectedIndex, newData)} />
							</div>

						</>}
						&nbsp;					
					</aside>
				</div>
			</div>
		</div>
	);
}