import { useState } from 'react';
import Dictionary from '../../main/classes/Dictionary';
import SettingBool from '../Components/Settings/SettingBoolean';
import SettingButtons from '../Components/Settings/SettingButtons';
import SettingCombo from '../Components/Settings/SettingCombo';
import SettingDualInput from '../Components/Settings/SettingDualInput';
import SettingInput from '../Components/Settings/SettingInput';
import { useTranslation } from "react-i18next";


type NewGameDialogProps = {
	onCancel: Function
}


const codeLanguages = new Dictionary<string>();
codeLanguages.add('js', 'JavaScript');
codeLanguages.add('lua', 'Lua');
codeLanguages.add('py', 'Python');





class ConfPreset {
	title: string = "Untitled";
	language: string = "js";
	template: string = '';
	vp_width: number = 800;
	vp_height: number = 600;
	target_fps: number = 60;
	v_sync: boolean = true;
	fullscreen: boolean = false;

	constructor(clone?:ConfPreset) {
		if (clone) {
			this.title = clone.title;
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


export default function NewGameDialog(props: NewGameDialogProps) {
	const [conf, setConf] = useState(new ConfPreset());
	const { i18n, t } = useTranslation();


	const gameTemplates = new Dictionary<string>();
	gameTemplates.add('', t('blank_game'));
	gameTemplates.add('platformer', t('platformer'));
	gameTemplates.add('visual_novel', t('visual_novel'));
	gameTemplates.add('top_down', t('top_down'));


	const updateSetting = async (option:any, newValue:any) => {
		const clone = new ConfPreset(conf);
		switch (option) {
			case 'title': clone.title = newValue; break;
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

	const onSubmit = async () => {
		if (!conf.title || conf.title.length <= 3) {
			window.api.showAlert(t('_new_game_title_len_warning'));
			return;
		}

		if (conf.vp_width < 128) {
			window.api.showAlert(t('_new_game_vp_width_warning'));
			return;
		}

		if (conf.vp_height < 128) {
			window.api.showAlert(t('_new_game_vp_height_warning'));
			return;
		}
		
		const r = await window.api.createGame(JSON.stringify(conf));
		const response = JSON.parse(r);
		if (response.success == true) {
			props.onCancel();
			window.api.openFolderAt(response.path);
		}
	};

	
	return (
		<div className={'dialog stretch-height'}>
			<div className={`settings-dialog`} style={{width:'600px'}}>
				<div className="dialog-main">
					
				<div className="dialog-page" style={{display:'block'}}>
						<h2>{t('new_game')}</h2>
						{ /* <p>Configure basic info about your game.</p> */ }

						<SettingInput slug='gameTitle' key={'gameTitle'} title={t('game_title')}
										description={t('_setting_game_title_desc')}
										value={conf.title} autoFocus={true}
										setValue={(s:string) => {updateSetting('title', s)}} />

						<SettingCombo slug='codeLanguage' key={'codeLanguage'} title={t('coding_language')}
										description={t('_new_game_coding_language_desc')}
										options={codeLanguages} value={conf.language}
										setValue={(v:string) => {updateSetting('language', v)}} />

						<SettingCombo slug='gameTemplate' key={'gameTemplate'} title={t('game_template')}
										description={t('_new_game_template_desc')}
										options={gameTemplates} value={conf.template}
										setValue={(v:string) => {updateSetting('template', v)}} />

						<SettingDualInput slug='viewport' key={'viewport'} title={t('viewport_w_h')}
										description={t('_setting_game_viewport_w_h_desc')} type={'number'}
										value1={conf.vp_width} minimum1={128} setValue1={(s:string) => {updateSetting('vp_width', s)}}
										value2={conf.vp_height} minimum2={128} setValue2={(s:string) => {updateSetting('vp_height', s)}} />

						<SettingInput slug='drawFps' key={'drawFps'} title={t('draw_fps')} 
										description={t('_setting_game_draw_fps_desc')} 
										value={conf.target_fps} small={true} minimum={1} type={'number'} 
										setValue={(s:string) => {updateSetting('target_fps', s)}} />

						<SettingBool slug='vSync' key={'vSync'} title={t('enable_v_sync')}
										description={t('_setting_game_enable_v_sync_desc')} half={true}
										checked={conf.v_sync}
										setChecked={(v:boolean) => {updateSetting('v_sync', v)}} />

						<SettingBool slug='fullScreen' key={'fullScreen'} title={t('start_fullscreen')}
										description={t('_setting_game_start_fullscreen_desc')}
										checked={conf.fullscreen}
										setChecked={(v:boolean) => {updateSetting('fullscreen', v)}} />

						<SettingButtons onSubmit={onSubmit} onCancel={props.onCancel} />

					</div>

				</div>

			</div>
			<a className="dialog-close" onClick={e => props.onCancel()}><span className="icon-cancel"></span></a>
		</div>
	);
}