import { useContext, useState } from 'react';
import SettingBool from '../Components/SettingBoolean';
import SettingCombo from '../Components/SettingCombo';
import Dictionary from '../../main/classes/Dictionary';
import SettingInput from '../Components/SettingInput';
import SettingDualInput from '../Components/SettingDualInput';
import { SettingsContext } from '../Context/SettingsManager';

type GamePropertiesDialogProps = {
	onPropertiesChanged: Function
}

declare global {
	interface Window {
	  api?: any;
	}
}


const sampleRates = new Dictionary<string>();
sampleRates.add('44100', '44100');
sampleRates.add('48000', '48000');
sampleRates.add('96000', '96000');

const bitDepths = new Dictionary<string>();
bitDepths.add('8', '8-bit');
bitDepths.add('16', '16-bit');
bitDepths.add('24', '24-bit');


const channelList = new Dictionary<string>();
channelList.add('1', 'Mono');
channelList.add('2', 'Stereo');
channelList.add('3', 'Quad Channel');


export default function GamePropertiesDialog({ onPropertiesChanged }: GamePropertiesDialogProps) {
	const settings = useContext(SettingsContext);
	const [page, setPage] = useState(0);

	const renderTestData = (str:string) => {
		const res = [];
		for (var i=0; i<20; i++) {
			res.push(<div key={'test-data'+i}>{str}</div>);
		}
		return res;
	}

	const updateSetting = async (group:any, option:any, newValue:any) => {
		// todo: save here.
	};

	return (
		<div className={`settings-dialog`}>
			<div className="settings-sidebar">
				
				<div>
					<h2>Game Properties</h2>
					<ul>
						<li data-index="0" onClick={() => setPage(0)} className={page==0?'is-active':''}>General</li>
						<li data-index="1" onClick={() => setPage(1)} className={page==1?'is-active':''}>Graphics</li>
						<li data-index="2" onClick={() => setPage(2)} className={page==2?'is-active':''}>Sound</li>
						<li data-index="3" onClick={() => setPage(3)} className={page==3?'is-active':''}>Dependencies</li>
					</ul>
				</div>
					
			</div>
			<div className="settings-main">
				
				<div className="settings-page" style={{display:page==0?'block':'none'}}>
					<h2>General</h2>

					<SettingInput slug='gameName' key={'gameName'} title='Game Name'
									  description='The name of your game'
									  value={''}
									  setValue={(s:string) => { updateSetting('general', 'gameName', s) }} />

					<SettingInput slug='entryPoint' key={'entryPoint'} title='Entry Point'
									  description='The main script file for your game'
									  value={''}
									  setValue={(s:string) => { updateSetting('general', 'entryPoint', s) }} />

					<SettingInput slug='icon' key={'icon'} title='Icon File'
									  description='The icon file for your game'
									  value={''}
									  setValue={(s:string) => { updateSetting('general', 'icon', s) }} />

					<SettingInput slug='version' key={'version'} title='Version'
									  description='The icon file for your game'
									  value={''}
									  setValue={(s:string) => { updateSetting('general', 'version', s) }} />

				</div>

				<div className="settings-page" style={{display:page==1?'block':'none'}}>
					<h2>Graphics</h2>

					<SettingDualInput slug='viewport' key={'viewport'} title='Viewport (width, height)'
									  description='The size of your rendered viewport'
									  value1={''} setValue1={(s:string) => { updateSetting('graphics', 'viewport.x', s) }}
									  value2={''} setValue2={(s:string) => { updateSetting('general', 'viewport.y', s) }} />

					<SettingDualInput slug='windowSize' key={'windowSize'} title='Window Size (width, height)'
									  description='The size of your game window when not full screen'
									  value1={''} setValue1={(s:string) => { updateSetting('graphics', 'windowSize.x', s) }}
									  value2={''} setValue2={(s:string) => { updateSetting('general', 'windowSize.y', s) }} />

					<SettingInput slug='updateFps' key={'updateFps'} title='Update FPS'	
									  description='The target fps for logic updates.'
									  value={''} small={true}
									  setValue={(s:string) => { updateSetting('general', 'updateFps', s) }} />

					<SettingInput slug='drawFps' key={'drawFps'} title='Draw FPS'	
									  description='The target fps for rendering frames.'
									  value={''} small={true}
									  setValue={(s:string) => { updateSetting('general', 'drawFps', s) }} />

					<SettingBool slug='vSync' key={'vSync'} title='Enable V-Sync'
									description='Enable vertical sync.'
									checked={false}
									setChecked={(v:boolean) => { updateSetting('general', 'vSync', v) }} />

					<SettingBool slug='fullScreen' key={'fullScreen'} title='Start Fullscreen'
									description='Start the game in full-screen by default.'
									checked={false}
									setChecked={(v:boolean) => { updateSetting('general', 'fullScreen', v) }} />
				</div>

				<div className="settings-page" style={{display:page==2?'block':'none'}}>
					<h2>Sound</h2>
					
					<SettingCombo slug='sampleRate' key={'sampleRate'} title='Sample Rate'
									  description='Change the color theme of the code editor'
									  options={sampleRates} value={''}
									  setValue={(v:string) => { updateSetting('sound', 'sampleRate', v) }} />

					<SettingCombo slug='bitDepth' key={'bitDepth'} title='Bit Depth'
									  description='Change the color theme of the code editor'
									  options={bitDepths} value={''}
									  setValue={(v:string) => { updateSetting('sound', 'bitDepth', v) }} />

					<SettingCombo slug='channels' key={'channels'} title='Channels'
									  description='Change the color theme of the code editor'
									  options={channelList} value={''}
									  setValue={(v:string) => { updateSetting('sound', 'channels', v) }} />
					
				</div>

				<div className="settings-page" style={{display:page==3?'block':'none'}}>
					<h2>Dependencies</h2>
					{renderTestData('c')}
				</div>

			</div>
		</div>
	);
}