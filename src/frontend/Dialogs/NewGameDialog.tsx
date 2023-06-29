import { useState } from 'react';

import SettingInput from '../Components/SettingInput';
import SettingDualInput from '../Components/SettingDualInput';
import SettingBool from '../Components/SettingBoolean';
import Dictionary from '../../main/classes/Dictionary';
import SettingCombo from '../Components/SettingCombo';
import SettingButtons from '../Components/SettingButtons';


type NewGameDialogProps = {
	createGameCallback: Function
	onCancel: Function
}


const codeLanguages = new Dictionary<string>();
codeLanguages.add('js', 'JavaScript');
codeLanguages.add('lua', 'Lua');
codeLanguages.add('py', 'Python');


const gameTemplates = new Dictionary<string>();
gameTemplates.add('', 'Blank Game');
gameTemplates.add('platformer', 'Platformer');
gameTemplates.add('platformer', 'Visual Novel');


class ConfPreset {
	name: string = "";
	language: string = "js";
	template: string = '';
	vp_width: number = 800;
	vp_height: number = 600;
	target_fps: number = 60;
	v_sync: boolean = true;
	fullscreen: boolean = false;

	constructor(clone?:ConfPreset) {
		if (clone) {
			this.name = clone.name;
			this.language = clone.language;
			this.template = clone.template;
			this.vp_width = clone.vp_width;
			this.vp_height = clone.vp_height;
			this.target_fps = clone.target_fps;
			this.v_sync = clone.v_sync;
			this.fullscreen = clone.fullscreen;
		}
	}
};


export default function NewGameDialog({ createGameCallback, onCancel }: NewGameDialogProps) {
	const [conf, setConf] = useState(new ConfPreset());

	const updateSetting = async (option:any, newValue:any) => {
		const clone = new ConfPreset(conf);
		switch (option) {
			case 'name': clone.name = newValue; break;
			case 'language': clone.language = newValue; break;
			case 'template': clone.template = newValue; break;
			case 'vp_width': clone.vp_width = newValue; break;
			case 'vp_height': clone.vp_height = newValue; break;
			case 'target_fps': clone.target_fps = newValue; break;
			case 'v_sync': clone.v_sync = newValue; break;
			case 'fullscreen': clone.fullscreen = newValue; break;
		}
		setConf(clone);
	};

	const onSubmit = () => {
		if (!conf.name || conf.name.length <= 3) {
			window.api.showAlert('Please choose a name longer than 3 characters');
			return;
		}

		if (conf.vp_width < 128) {
			window.api.showAlert('Please enter a viewport width larger than 128px');
			return;
		}

		if (conf.vp_height < 128) {
			window.api.showAlert('Please enter a viewport height larger than 128px');
			return;
		}
		
		onCancel();
	};

	
	return (
		<div className={`settings-dialog`} style={{width:'600px'}}>
			<div className="dialog-main">
				
			<div className="dialog-page" style={{display:'block'}}>
					<h2>New Game</h2>
					{ /* <p>Configure basic info about your game.</p> */ }

					<SettingInput slug='gameName' key={'gameName'} title='Game Name'
									  description='The name of your game'
									  value={conf.name} autoFocus={true}
									  setValue={(s:string) => {updateSetting('name', s)}} />

					<SettingCombo slug='codeLanguage' key={'codeLanguage'} title='Coding Language'
									  description='Change the code language you would like to use.'
									  options={codeLanguages} value={conf.language}
									  setValue={(v:string) => {updateSetting('language', v)}} />

					<SettingCombo slug='gameTemplate' key={'gameTemplate'} title='Game Template'
									  description='Choose a starter template.'
									  options={gameTemplates} value={conf.template}
									  setValue={(v:string) => {updateSetting('template', v)}} />

					<SettingDualInput slug='viewport' key={'viewport'} title='Viewport (width, height)'
									  description='The size of your rendered viewport' type={'number'}
									  value1={conf.vp_width} minimum1={128} setValue1={(s:string) => {updateSetting('vp_width', s)}}
									  value2={conf.vp_height} minimum2={128} setValue2={(s:string) => {updateSetting('vp_height', s)}} />

					<SettingInput slug='drawFps' key={'drawFps'} title='Draw FPS'	
									  description='The target fps for rendering frames.'
									  value={conf.target_fps} small={true} minimum={1} type={'number'}
									  setValue={(s:string) => {updateSetting('target_fps', s)}} />

					<SettingBool slug='vSync' key={'vSync'} title='Enable V-Sync'
									description='Enable vertical sync.' half={true}
									checked={conf.v_sync}
									setChecked={(v:boolean) => {updateSetting('v_sync', v)}} />

					<SettingBool slug='fullScreen' key={'fullScreen'} title='Start Fullscreen'
									description='Start the game in full-screen by default.'
									checked={conf.fullscreen}
									setChecked={(v:boolean) => {updateSetting('fullscreen', v)}} />

					<SettingButtons onSubmit={onSubmit} onCancel={onCancel} />

				</div>

			</div>

		</div>
	);
}