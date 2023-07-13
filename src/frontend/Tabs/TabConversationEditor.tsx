import React, { useEffect, useRef, useState, useContext } from 'react';
import { SettingsContext } from '../Context/SettingsManager';
import TabToolbar from '../Components/TabToolbar';
import Button from '../Components/Button';
import './TabConversationEditor.css';

type ComponentProps = {
	guid: string,
	filePath:string,
	active: boolean,
	changed: boolean,
	labelChanged: Function, 
	onSetData: Function
};

export default function TabConversationEditor(props: ComponentProps) {
	const [data, setData] = useState('');
	const [rightBarWidth, setRightBarWidth] = useState(300);
	const [isTrackingMouse, setIsTrackingMouse] = useState(false);
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


	return (
		<div className={[props.active?'tab-active':'tab-inactive'].join(' ')}>
			<div className='right-bar-container' ref={containerRef}
				  onMouseMove={e => handleMouseMove(e.clientX, e.clientY)}
				  onMouseLeave={e => setIsTrackingMouse(false)}>

				<div className='toolbar-container'>
					<TabToolbar>
						<div className="toolbar-group">
							<Button className='toolbar-button' disabled={!props.changed} onClick={() => window.api.menuSave()}><i className='icon-floppy'></i></Button>
						</div>
					</TabToolbar>
					<div className='conversation-viewer'>
						<div className='tab-placeholder'>
							Not Yet Implemented (Conversation Editor)
						</div>
					</div>
				</div>

				<span id="splitter3" onMouseDown={e => setIsTrackingMouse(true)} onMouseUp={e => setIsTrackingMouse(false)} />

				<aside data-title="" style={{width:rightBarWidth+'px'}}>
					<i>Right Bar Goes Here</i>
				</aside>


			</div>
		</div>
	);
}