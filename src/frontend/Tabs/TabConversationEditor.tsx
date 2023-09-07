import React, { useEffect, useRef, useState, useContext } from 'react';
import { SettingsContext } from '../Context/SettingsManager';
import TabToolbar from '../Components/TabToolbar';
import Button from '../Components/Button';
import ConversationMoment from '../Components/ConversationMoment';
import './TabConversationEditor.css';


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
	actor: string,
	id: string,
	goto: string,
	clear: boolean,
	options: Array<string>
}


const defaultEntries = [] as Array<MomentEntry>;
for (var i=0; i<10; i++) {
	defaultEntries.push({
		content: "test test test",
		actor: i == 5 ? "Dave" : "",
		id: '',
		goto: '',
		clear: false,
		options: []
	});
}


export default function TabConversationEditor(props: ComponentProps) {
	const [data, setData] = useState('');
	const [entries, setEntries] = useState([...defaultEntries]);
	const [rightBarWidth, setRightBarWidth] = useState(300);
	const [isTrackingMouse, setIsTrackingMouse] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const settings = useContext(SettingsContext);
	const containerRef = useRef(null);


	// ########################################################################
	// Use Effect Handlers
	// ########################################################################


	useEffect(() => {
		const fetchData = async(thePath:string) => {
			const theJSON = await window.api.openFile(thePath);
			const theResponse = JSON.parse(theJSON);
			let data = theResponse.data == '' ? '' : JSON.parse(theResponse.data);

			setData(data);
			props.labelChanged(theResponse.label);
			props.onSetData(theResponse.data, false);
		};
		fetchData(props.filePath);
	}, []);


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
		setEntries((en:Array<MomentEntry>) => {
			en[index].content = newContent;
			return en;
		});
	};


	const setEntryActor = (index:number, newActor:string) => {
		const newEntries = [...entries];
		newEntries[index].actor = newActor;
		setEntries(newEntries);
	};


	const setEntryId = (index:number, newValue:string) => {
		const newEntries = [...entries];
		newEntries[index].id = newValue;
		setEntries(newEntries);
	};


	const setEntryGoto = (index:number, newValue:string) => {
		const newEntries = [...entries];
		entries[index].goto = newValue;
		setEntries(newEntries);
	};

	
	const setEntryClear = (index:number, newValue:boolean) => {
		const newEntries = [...entries];
		entries[index].clear = newValue;
		setEntries(newEntries);
	};


	const addEntryOption = (index:number) => {
		const newEntries = [...entries];
		const newText = `Option Text`;
		newEntries[index].options.push(newText);
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
								/>);
		}
		return result;
	};


	const addEntry = () => {
		entries.push({
			content: "content goes here",
			actor: "",
			id: '',
			goto: '',
			clear: false,
			options: []
		});
		setEntries([...entries]);
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
			<div className='right-bar-container' ref={containerRef}
				  onMouseMove={e => handleMouseMove(e.clientX, e.clientY)}
				  onMouseLeave={e => setIsTrackingMouse(false)}>

				<div className='toolbar-container'>
					<TabToolbar>
						<div className="toolbar-group">
							<Button className='toolbar-button' disabled={!props.changed} onClick={() => window.api.menuSave()}><i className='icon-floppy'></i></Button>
							<Button className='toolbar-button' style={{ width: '28px', textAlign: 'center'}} disabled={false} onClick={addEntry}><i className="icon-duh">+</i></Button>
							<Button className='toolbar-button' style={{ width: '28px', textAlign: 'center'}} disabled={false} onClick={removeEntry}><i className="icon-duh">-</i></Button>
						</div>
					</TabToolbar>
					<div className='conversation-viewer'>
						<div className='moment-list'>
							{listMoments()}
						</div>
					</div>
				</div>

				<span id="splitter3" onMouseDown={e => setIsTrackingMouse(true)} onMouseUp={e => setIsTrackingMouse(false)} />

				<aside data-title="" style={{width:rightBarWidth+'px'}}>
					{selectedIndex >= 0 && <>
						<i>Selected Moment: #{selectedIndex}</i>

						<div className="conversation-property">
							<label>Actor:</label>
							<input className="input" type="text" value={entries[selectedIndex].actor} onChange={(e:any) => setEntryActor(selectedIndex, e.target.value)} />
						</div>

						<div className="conversation-property">
							<label>ID:</label>
							<input className="input" type="text" value={entries[selectedIndex].id} onChange={(e:any) => setEntryId(selectedIndex, e.target.value)} />
						</div>

						<div className="conversation-property">
							<label>Goto:</label>
							<input className="input" type="text" value={entries[selectedIndex].goto} onChange={(e:any) => setEntryGoto(selectedIndex, e.target.value)} />
						</div>

						<div className="conversation-property">
							<label>Clear:</label>
							<span className={`toggle-button ${entries[selectedIndex].clear?'is-toggled':''}`} style={{margin:'5px 0 0 0'}} onClick={(e:any) => {
								const c = entries[selectedIndex].clear;
								setEntryClear(selectedIndex, !c);
							}}></span>
						</div>

						<div className="conversation-property">
							<label>&nbsp;</label>
							<div className="buttons" style={{margin: '6px 0 6px 0'}}>
								<a className="button" onClick={() => addEntryOption(selectedIndex)}>Add Option</a>
							</div>
						</div>

					</>}
					&nbsp;					
				</aside>
			</div>
		</div>
	);
}