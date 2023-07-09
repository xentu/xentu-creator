import React, { useEffect, useState, useContext, CSSProperties } from 'react';
import { SettingsContext } from '../Context/SettingsManager';
import TabToolbar from '../Components/TabToolbar';
import Button from '../Components/Button';


type TabImageViewerProps = {
	guid: string,
	filePath:string,
	active: boolean,
	changed: boolean,
	labelChanged: Function, 
	onSetData: Function,
	onZoom: Function
};


export default function TabCodeEditor(props: TabImageViewerProps) {
	const [data, setData] = useState('');
	const [zoom, setZoom] = useState(1);
	const settings = useContext(SettingsContext);

	const updateZoom = (factor:number) => {
		setZoom(factor);
		setTimeout(() => {
			props.onZoom();
		}, 10);
	};

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

	const imageStyle = {} as CSSProperties;
	imageStyle.transform = `translate(-30px, -30px) scale(${zoom})`;
	imageStyle.transformOrigin = 'top left';
	imageStyle.imageRendering = 'pixelated';

	const canZoomIn = zoom < 10;
	const canZoomOut = zoom > 1;

	return (
		<div className={[props.active?'tab-active':'tab-inactive'].join(' ')}>
			<div className='toolbar-container'>
				<TabToolbar>
					<div className="toolbar-group">
						{/* <Button className="toolbar-button" disabled={true}><i className='icon-arrows-cw'></i></Button> */}
						<Button className="toolbar-button" disabled={!canZoomOut} onClick={() => updateZoom(zoom - 1)}><i className='icon-zoom-out'></i></Button>
						<Button className="toolbar-button" disabled={!canZoomIn} onClick={() => updateZoom(zoom + 1)}><i className='icon-zoom-in'></i></Button>
						<span className="toolbar-label">{`${zoom}x`}</span>
					</div>
				</TabToolbar>
				<div className='image-viewer'>
					<img src={data} style={imageStyle} />
				</div>
			</div>
		</div>
	);
}