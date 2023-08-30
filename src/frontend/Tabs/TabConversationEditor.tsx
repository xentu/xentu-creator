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
	label: string
}


const defaultEntries = [] as Array<MomentEntry>;
for (var i=0; i<10; i++) {
	defaultEntries.push({
		content: "test test test",
		label: i == 5 ? "Dave" : ""
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


	const setEntryLabel = (index:number, newLabel:string) => {
		setEntries((en:Array<MomentEntry>) => {
			en[index].label = newLabel;
			return en;
		});
	};


	const listMoments = () => {
		const result = [];
		for (var i=0; i<entries.length; i++) {
			result.push(<ConversationMoment key={'entry'+i} index={i} 
								label={entries[i].label}
								content={entries[i].content}
								setContent={setEntryContent}
								setFocus={setSelectedIndex}
								/>);
		}
		return result;
	};


	const addEntry = () => {
		entries.push({
			content: "content goes here",
			label: i == 5 ? "Dave" : ""
		});
		setEntries([...entries]);
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
							<Button className='toolbar-button' disabled={false} onClick={addEntry}><i className="icon-duh">+</i></Button>
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
					<i>Focus: {selectedIndex}</i>
				</aside>


			</div>
		</div>
	);
}