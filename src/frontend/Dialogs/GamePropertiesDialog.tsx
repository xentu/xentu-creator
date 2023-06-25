import { useContext, useState } from 'react';
import SettingBool from '../Components/SettingBoolean';
import SettingCombo from '../Components/SettingCombo';
import Dictionary from '../../main/classes/Dictionary';
import SettingInput from '../Components/SettingInput';
import SettingDualInput from '../Components/SettingDualInput';
import { SettingsContext } from '../Context/SettingsManager';
import { ProjectContext, ProjectSchema } from '../Context/ProjectManager';


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
	const project = useContext(ProjectContext);
	const [page, setPage] = useState(0);

	const renderTestData = (str:string) => {
		const res = [];
		for (var i=0; i<20; i++) {
			res.push(<div key={'test-data'+i}>{str}</div>);
		}
		return res;
	}

	const updateProjectProperty = async (option:any, newValue:any) => {
		const clone = JSON.parse(JSON.stringify(project));
		clone.game[option] = newValue;
		onPropertiesChanged(clone);
		await window.api.setProject(clone);
	};

	const updateProjectSubProperty = async (group:any, option:any, newValue:any) => {
		const clone = JSON.parse(JSON.stringify(project));
		clone.game[group][option] = newValue;
		onPropertiesChanged(clone);
		await window.api.setProject(clone);
	};

	return (
		<div className={`settings-dialog`}>
			<div className="dialog-sidebar">
				
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
			<div className="dialog-main">
				
				<div className="dialog-page" style={{display:page==0?'block':'none'}}>
					<h2>General</h2>
					<p>Configure basic info about your game.</p>

					<SettingInput slug='gameName' key={'gameName'} title='Game Name'
									  description='The name of your game'
									  value={project.game.title}
									  setValue={(s:string) => { updateProjectProperty('title', s) }} />

					<SettingInput slug='entryPoint' key={'entryPoint'} title='Entry Point'
									  description='The main script file for your game'
									  value={project.game.entry_point}
									  setValue={(s:string) => { updateProjectProperty('entry_point', s) }} />

					<SettingInput slug='icon' key={'icon'} title='Icon File'
									  description='The icon file for your game'
									  value={project.game.icon}
									  setValue={(s:string) => { updateProjectProperty('icon', s) }}  />

					<SettingInput slug='version' key={'version'} title='Version'
									  description='The icon file for your game'
									  value={project.game.version}
									  setValue={(s:string) => { updateProjectProperty('version', s) }} />

				</div>

				<div className="dialog-page" style={{display:page==1?'block':'none'}}>
					<h2>Graphics</h2>
					<p>Configure the graphical settings for your game.</p>

					<SettingDualInput slug='viewport' key={'viewport'} title='Viewport (width, height)'
									  description='The size of your rendered viewport'
									  value1={project.game.viewport.width} setValue1={(s:string) => { updateProjectSubProperty('viewport', 'width', s) }}
									  value2={project.game.viewport.height} setValue2={(s:string) => { updateProjectSubProperty('viewport', 'height', s) }} />

					<SettingDualInput slug='windowSize' key={'windowSize'} title='Window Size (width, height)'
									  description='The size of your game window when not full screen'
									  value1={project.game.window.width} setValue1={(s:string) => { updateProjectSubProperty('viewport', 'width', s) }}
									  value2={project.game.window.height} setValue2={(s:string) => { updateProjectSubProperty('viewport', 'height', s) }} />

					<SettingInput slug='updateFps' key={'updateFps'} title='Update FPS'	
									  description='The target fps for logic updates.'
									  value={project.game.update_frequency} small={true}
									  setValue={(s:string) => { updateProjectProperty('update_frequency', s) }} />

					<SettingInput slug='drawFps' key={'drawFps'} title='Draw FPS'	
									  description='The target fps for rendering frames.'
									  value={project.game.draw_frequency} small={true}
									  setValue={(s:string) => { updateProjectProperty('draw_frequency', s) }} />

					<SettingBool slug='vSync' key={'vSync'} title='Enable V-Sync'
									description='Enable vertical sync.'
									checked={project.game.v_sync}
									setChecked={(v:boolean) => { updateProjectProperty('v_sync', v) }} />

					<SettingBool slug='fullScreen' key={'fullScreen'} title='Start Fullscreen'
									description='Start the game in full-screen by default.'
									checked={project.game.fullscreen}
									setChecked={(v:boolean) => { updateProjectProperty('fullscreen', v) }} />
					
					<SettingBool slug='resizable' key={'resizable'} title='Resizable'
									description='Enable to make it possible for the game window to be resized (when not in fullscreen).'
									checked={project.game.resizable}
									setChecked={(v:boolean) => { updateProjectProperty('resizable', v) }} />

				</div>

				<div className="dialog-page" style={{display:page==2?'block':'none'}}>
					<h2>Sound</h2>
					<p>Configure the audio settings for your game.</p>
					
					<SettingCombo slug='sampleRate' key={'sampleRate'} title='Sample Rate'
									  description='Change the color theme of the code editor'
									  options={sampleRates} value={project.game.audio.frequency}
									  setValue={(v:string) => {  }} />

					<SettingCombo slug='bitDepth' key={'bitDepth'} title='Bit Depth'
									  description='Change the color theme of the code editor'
									  options={bitDepths} value={project.game.audio.depth}
									  setValue={(v:string) => {  }} />

					<SettingCombo slug='channels' key={'channels'} title='Channels'
									  description='Change the color theme of the code editor'
									  options={channelList} value={project.game.audio.channels}
									  setValue={(v:string) => {  }} />
					
				</div>

				<div className="dialog-page" style={{display:page==3?'block':'none'}}>
					
					<h2>Dependencies</h2>
					<p>Configure which dependencies to use with your game.</p>
					
				</div>

			</div>
		</div>
	);
}