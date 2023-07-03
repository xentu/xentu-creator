import React, { useEffect, useState, useContext } from 'react';
import { SettingsContext } from '../Context/SettingsManager';
import TabToolbar from '../Components/TabToolbar';


type TabImageViewerProps = {
	guid: string,
	filePath:string,
	active: boolean,
	labelChanged: Function, 
	onSetData: Function
};


export default function TabCodeEditor(props: TabImageViewerProps) {
	const [data, setData] = useState('');
	const settings = useContext(SettingsContext);

	useEffect(() => {
		const fetchData = async(thePath:string) => {
			const theJSON = await window.api.openImage(thePath);
			const theResponse = JSON.parse(theJSON);
			setData(theResponse.data);
			props.labelChanged(theResponse.label);
			//onSetData(theResponse.data, false);
		};
		fetchData(props.filePath);
	}, []);

	return (
		<div className={[props.active?'tab-active':'tab-inactive'].join(' ')}>
			<div className='toolbar-container'>
				<TabToolbar>
					<div className="toolbar-group">
						<a className="toolbar-button is-disabled"><i className='icon-arrows-cw'></i></a>
						<a className="toolbar-button is-disabled"><i className='icon-zoom-out'></i></a>
						<a className="toolbar-button is-disabled"><i className='icon-zoom-in'></i></a>
					</div>
				</TabToolbar>
				<div className='image-viewer'>
					<img src={data} />
				</div>
			</div>
		</div>
	);
}