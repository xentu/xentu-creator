import React, { useEffect, useState, useContext } from 'react';
import { SettingsContext } from '../Context/SettingsManager';
import TabToolbar from '../Components/TabToolbar';
import Button from '../Components/Button';
import ToggleButton from '../Components/ToggleButton';
import GroupBox from '../Components/GroupBox';
import SpriteMapViewport from '../Components/SpriteMapViewport';
import ListBox from '../Components/ListBox';

import '../Resources/css/sprite-map-editor.css';

type ComponentProps = {
	guid: string,
	filePath:string,
	active: boolean,
	changed: boolean,
	labelChanged: Function,
	onSetData: Function
};

const testGroups = ['walk_right', 'walk_left', 'jump_right'];
const testFrames = ['Frame 1', 'Frame 2', 'Frame 3', 'Frame 4'];

export default function TabSpriteMapEditor(props: ComponentProps) {
	const [data, setData] = useState('');
	const [group, setGroup] = useState('walk_right');
	const [frame, setFrame] = useState('Frame 1');
	const [preview, setPreview] = useState(false);
	const settings = useContext(SettingsContext);


	return (
		<div className={[props.active?'tab-active':'tab-inactive'].join(' ')}>
			<div className='toolbar-container'>
				<TabToolbar>
					<div className="toolbar-group">
						{/* <Button className="toolbar-button" disabled={true}><i className='icon-arrows-cw'></i></Button> */}
						<ToggleButton className="toolbar-button" toggle={preview} onClick={() => setPreview(!preview)} />
						<Button className="toolbar-button" disabled={false} onClick={() => {}}><i className='icon-folder'></i></Button>
						<span className="toolbar-label" style={{fontWeight:'bold', paddingRight:0}}>Texture:</span>
						<span className="toolbar-label">/assets/ZOMBIE_1.png</span>
					</div>
				</TabToolbar>
				<div className='sprite-map-editor'>
					<SpriteMapViewport>
						
						{preview && <div className='tab-placeholder'>
							Not Yet Implemented (SpriteMap Editor Preview)
						</div>}

						{preview == false && <div className='tab-placeholder'>
							Not Yet Implemented (SpriteMap Editor)
						</div>}

					</SpriteMapViewport>
					<div className='sprite-map-options'>
						<GroupBox header='Sprite Groups'>
							<ListBox items={testGroups} value={group} onSelect={setGroup} />
							<div className="buttons">
								<Button className='button'>New</Button>
								<Button className='button'>Copy</Button>
								<Button className='button'>Rename</Button>
								<Button className='button'><i className="icon-cancel" /></Button>
							</div>
						</GroupBox>
						<GroupBox header='Frames'>
							<ListBox items={testFrames} value={frame} onSelect={setFrame} />
							<div className="buttons">
								<Button className='button'>New</Button>
								<Button className='button'><i className="icon-cancel" /></Button>
							</div>
						</GroupBox>
						<GroupBox header='Selected Frame'>
							<div style={{overflowX: 'auto', height: '100%'}}>
								<div className='sprite-map-option'>
									<span>Coords (x,y,w,h)</span>
									<div>
										<input className="input" type="text" />
									</div>
								</div>
								<div className='sprite-map-option'>
									<span>Frame Time (ms)</span>
									<div>
										<input className="input" type="number" />
									</div>
								</div>
								<div className='sprite-map-option'>
									<span>Features</span>
									<div>
										<label>
											<input type="checkbox" />
											<span>Flip X</span>
										</label>
										<label>
											<input type="checkbox" />
											<span>Flip Y</span>
										</label>
									</div>
								</div>
							</div>
						</GroupBox>
					</div>
				</div>
			</div>
		</div>
	);
}