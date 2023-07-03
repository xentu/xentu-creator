import React, { useEffect, useState, useContext } from 'react';
import { SettingsContext } from '../Context/SettingsManager';


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
		<div style={{display: props.active == true ? 'initial' : 'none' }}>
			<div className='image-viewer'>
				<img src={data} />
			</div>
		</div>
	);
}