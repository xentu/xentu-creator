import { useContext, useState } from 'react';
import Dictionary from '../../main/classes/Dictionary';
import SettingBool from '../Components/Settings/SettingBoolean';
import SettingCombo from '../Components/Settings/SettingCombo';
import SettingDualInput from '../Components/Settings/SettingDualInput';
import SettingInput from '../Components/Settings/SettingInput';
import { SettingsContext } from '../Context/SettingsManager';
import { ProjectContext, ProjectSchema } from '../Context/ProjectManager';
import { useTranslation } from "react-i18next";


type GamePropertiesDialogProps = {
	onPropertiesChanged: Function,
	onCancel: Function
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


export default function GamePropertiesDialog(props: GamePropertiesDialogProps) {
	const settings = useContext(SettingsContext);
	const project = useContext(ProjectContext);
	const { i18n, t } = useTranslation();
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
		props.onPropertiesChanged(clone);
		await window.api.setProject(clone);
	};

	const updateProjectSubProperty = async (group:any, option:any, newValue:any) => {
		const clone = JSON.parse(JSON.stringify(project));
		clone.game[group][option] = newValue;
		props.onPropertiesChanged(clone);
		await window.api.setProject(clone);
	};

	return (
		<div className={'dialog stretch-height'}>
			<div className={`settings-dialog`} style={{width:'900px',minHeight:'500px'}}>
				<div className="dialog-sidebar">
					
					<div>
						<h2>{t('game_properties')}</h2>
						<ul>
							<li data-index="0" onClick={() => setPage(0)} className={page==0?'is-active':''}>{t('general')}</li>
							<li data-index="1" onClick={() => setPage(1)} className={page==1?'is-active':''}>{t('graphics')}</li>
							<li data-index="2" onClick={() => setPage(2)} className={page==2?'is-active':''}>{t('sound')}</li>
							{/*<li data-index="3" onClick={() => setPage(3)} className={page==3?'is-active':''}>{t('dependencies')}</li>*/}
						</ul>
					</div>
						
				</div>
				<div className="dialog-main">
					
					<div className="dialog-page scrollable" style={{display:page==0?'block':'none'}}>
						<h2>{t('general')}</h2>
						<p>{t('_tab_general_desc')}</p>

						<SettingInput slug='gameTitle' key={'gameTitle'} title={t('game_title')}
										description={t('_setting_game_title_desc')}
										value={project.game.title}
										setValue={(s:string) => { updateProjectProperty('title', s) }} />

						<SettingInput slug='entryPoint' key={'entryPoint'} title={t('entry_point')}
										description={t('_setting_game_entry_point_desc')}
										value={project.game.entry_point}
										setValue={(s:string) => { updateProjectProperty('entry_point', s) }} />

						<SettingInput slug='icon' key={'icon'} title={t('icon_file')}
										description={t('_setting_game_icon_file_desc')}
										value={project.game.icon}
										setValue={(s:string) => { updateProjectProperty('icon', s) }}  />

						<SettingInput slug='version' key={'version'} title={t('version')}
										description={t('_setting_game_version_desc')}
										value={project.game.version}
										setValue={(s:string) => { updateProjectProperty('version', s) }} />

					</div>

					<div className="dialog-page scrollable" style={{display:page==1?'block':'none'}}>
						<h2>{t('graphics')}</h2>
						<p>{t('_tab_graphics_desc')}</p>

						<SettingDualInput slug='viewport' key={'viewport'} title={t('viewport_w_h')}
										description={t('_setting_game_viewport_w_h_desc')}
										value1={project.game.viewport.width} setValue1={(s:string) => { updateProjectSubProperty('viewport', 'width', s) }}
										value2={project.game.viewport.height} setValue2={(s:string) => { updateProjectSubProperty('viewport', 'height', s) }} />

						<SettingDualInput slug='windowSize' key={'windowSize'} title={t('window_size_w_h')}
										description={t('_setting_game_window_size_w_h_desc')}
										value1={project.game.window.width} setValue1={(s:string) => { updateProjectSubProperty('viewport', 'width', s) }}
										value2={project.game.window.height} setValue2={(s:string) => { updateProjectSubProperty('viewport', 'height', s) }} />

						<SettingInput slug='updateFps' key={'updateFps'} title={t('update_fps')}
										description={t('_setting_game_update_fps_desc')}
										value={project.game.update_frequency} small={true}
										setValue={(s:string) => { updateProjectProperty('update_frequency', s) }} />

						<SettingInput slug='drawFps' key={'drawFps'} title={t('draw_fps')}
										description={t('_setting_game_draw_fps_desc')}
										value={project.game.draw_frequency} small={true}
										setValue={(s:string) => { updateProjectProperty('draw_frequency', s) }} />

						<SettingBool slug='vSync' key={'vSync'} title={t('enable_v_sync')}
										description={t('_setting_game_enable_v_sync_desc')}
										checked={project.game.v_sync}
										setChecked={(v:boolean) => { updateProjectProperty('v_sync', v) }} />

						<SettingBool slug='fullScreen' key={'fullScreen'} title={t('start_fullscreen')}
										description={t('_setting_game_start_fullscreen_desc')}
										checked={project.game.fullscreen}
										setChecked={(v:boolean) => { updateProjectProperty('fullscreen', v) }} />
						
						<SettingBool slug='resizable' key={'resizable'} title={t('resizable')}
										description={t('_setting_game_resizable_desc')}
										checked={project.game.resizable}
										setChecked={(v:boolean) => { updateProjectProperty('resizable', v) }} />

					</div>

					<div className="dialog-page scrollable" style={{display:page==2?'block':'none'}}>
						<h2>{t('sound')}</h2>
						<p>{t('_tab_sound_desc')}</p>
						
						<SettingCombo slug='sampleRate' key={'sampleRate'} title={t('sample_rate')}
										description={t('_setting_game_sample_rate_desc')}
										options={sampleRates} value={project.game.audio.frequency}
										setValue={(v:string) => {  }} />

						<SettingCombo slug='bitDepth' key={'bitDepth'} title={t('bit_depth')}
										description={t('_setting_game_bit_depth_desc')}
										options={bitDepths} value={project.game.audio.depth}
										setValue={(v:string) => {  }} />

						<SettingCombo slug='channels' key={'channels'} title={t('channels')}
										description={t('_setting_game_channels_desc')}
										options={channelList} value={project.game.audio.channels}
										setValue={(v:string) => {  }} />
						
					</div>

					<div className="dialog-page scrollable" style={{display:page==3?'block':'none'}}>
						
						<h2>{t('dependencies')}</h2>
						<p>{t('_tab_dependencies_desc')}</p>
						
					</div>

				</div>
			</div>
			<a className="dialog-close" onClick={e => props.onCancel()}><span className="icon-cancel"></span></a>
		</div>
	);
}