import { useContext, useEffect, useState } from 'react';
import Dictionary from '../../main/classes/Dictionary';
import SettingBlank from '../Components/Settings/SettingBlank';
import SettingBool from '../Components/Settings/SettingBoolean';
import SettingCombo from '../Components/Settings/SettingCombo';
import SettingInput from '../Components/Settings/SettingInput';
import { SettingsContext } from '../Context/SettingsManager';
import { useTranslation } from "react-i18next";


type SettingsDialogProps = {
	onSettingsChanged: Function,
	onCancel: Function
}


declare global {
	interface Window {
	  api?: any;
	}
}


export default function SettingsDialog(props: SettingsDialogProps) {
	const settings = useContext(SettingsContext);
	const [page, setPage] = useState(0);
	const [binaryReport, setBinaryReport] = useState('');
	const { i18n, t } = useTranslation();


	const colorThemes = new Dictionary<string>();
	colorThemes.add('dark', t('dark'));
	colorThemes.add('light', t('light'));
	//colorThemes.add('os-decides', 'OS Decides');

	const fontFamilies = new Dictionary<string>();
	fontFamilies.add('default', t('_setting_default_font_family'));
	fontFamilies.add('roboto', 'Roboto');

	const fontSizes = new Dictionary<string>();
	fontSizes.add('16', '16');

	const platformList = new Dictionary<string>();
	platformList.add('x86', 'x86');
	platformList.add('x64', 'x64');
	platformList.add('Arm64', 'Arm64');


	const uiLanguages = new Dictionary<string>();
	uiLanguages.add('en', 'EN - English (International)');
	uiLanguages.add('fr', 'FR - Français (France)');
	uiLanguages.add('it', 'IT - Italiano (Italy)')
	uiLanguages.add('de', 'DE - German (Germany)');
	uiLanguages.add('de', 'NL - Dutch (Netherlands)');
	uiLanguages.add('jp', 'JP - 日本語 (Japan)');


	useEffect(() => {
		const fetchReport = async() => {
			const rawReport = await window.api.listBinaries();
			setBinaryReport(JSON.stringify(rawReport, null, "\t"));
		};
		fetchReport().catch(console.error);
	}, []);


	const updateSetting = async (group:any, option:any, newValue:any) => {
		const clone = JSON.parse(JSON.stringify(settings));
		clone[group][option] = newValue;
		props.onSettingsChanged(clone);
		await window.api.setSettings(clone);

		if (group == 'editor' && option == 'locale') {
			i18n.changeLanguage(newValue);
		}
	};

	const updateSetting2 = async (group:any, subgroup:any, option:any, newValue:any) => {
		const clone = JSON.parse(JSON.stringify(settings));
		clone[group][subgroup][option] = newValue;
		props.onSettingsChanged(clone);
		await window.api.setSettings(clone);
	};

	const themeOpts = {
		mainBackground: t('_color_main_bg'),
		mainText: t('_color_main_text'),
		sidebarBackground: t('_color_sidebar_bg'),
		sidebarText: t('_color_sidebar_text'),
		hoverBackground: t('_color_hover_bg'),
		hoverText: t('_color_hover_text'),
		activeBackground: t('_color_active_bg'),
		activeText: t('_color_active_text'),
		editorBackground: t('_color_editor_bg'),
		editorText: t('_color_editor_text'),
		terminalBackground: t('_color_terminal_bg'),
		terminalText: t('_color_terminal_text'),
		footerBackground: t('_color_footer_bg'),
		footerText:	t('_color_footer_text'),
	};
	

	const resetTheme = async () => {
		if (await window.api.showConfirm(t('are_you_sure'))) {
			const clone = JSON.parse(JSON.stringify(settings));
			if (settings.editor.colorTheme == 'dark') {
				const templateJson = await window.api.getDefaultThemeDark();
				clone.theme.dark = JSON.parse(templateJson);
			}
			else {
				const templateJson = await window.api.getDefaultThemeLight();
				clone.theme.light = JSON.parse(templateJson);
			}
			props.onSettingsChanged(clone);
			await window.api.setSettings(clone);
		}
	};


	const renderSettings = () => {
		const darkOrLight = settings.editor.colorTheme;
		const res = new Array<any>();
		
		for (const [key, label] of Object.entries(themeOpts)) {
			res.push(
				<SettingInput slug={key} key={key} title={label}
					  description={t('change_the_color_of') + ` ${label}.`}
					  type='color' value={settings.theme[darkOrLight][key]}
					  setValue={(v:string) => { updateSetting2('theme', darkOrLight, key, v) }} />
			)
		}

		return res;
	};


	const doUpdateBinaries = async (overwrite:boolean) => {
		const result = await window.api.refreshBinaries(overwrite);
		alert(result.message);
		if (result.updated) {
			const rawReport = await window.api.listBinaries();
			setBinaryReport(JSON.stringify(rawReport, null, "\t"));
		}
	}


	const doExportTheme = async () => {
		const resultJson = await window.api.exportTheme();
		const result = JSON.parse(resultJson);
		if (result.success) {
			await window.api.showAlert(t('export_successful'));
		}
	};


	const doImportTheme = async () => {
		const resultJson = await window.api.importTheme();
		const result = JSON.parse(resultJson);
		if (result.success) {
			const clone = JSON.parse(JSON.stringify(settings));
			clone.theme = result.theme;
			props.onSettingsChanged(clone);
			await window.api.setSettings(clone);
			await window.api.showAlert(t('import_successful'));
		}		
	};

	const doClearRecentProjects = async () => {
		const clone = JSON.parse(JSON.stringify(settings));
		clone.recentProjects = [];
		props.onSettingsChanged(clone);
		await window.api.setSettings(clone);
		await window.api.showAlert(t('recent_projects_cleared'));
	};

	
	return (
		<div className={'dialog stretch-height'}>
			<div className={`settings-dialog`} style={{width:'900px', minHeight:'600px'}}>
				<div className="dialog-sidebar">
					
					<div>
						<h2>{t('options')}</h2>
						<ul>
							<li data-index="0" onClick={() => setPage(0)} className={page==0?'is-active':''}>{t('general')}</li>
							<li data-index="1" onClick={() => setPage(1)} className={page==1?'is-active':''}>{t('code_editor')}</li>
							<li data-index="2" onClick={() => setPage(2)} className={page==2?'is-active':''}>{t('theme')}</li>
							<li data-index="3" onClick={() => setPage(3)} className={page==3?'is-active':''}>{t('tools')}</li>
							<li data-index="4" onClick={() => setPage(4)} className={page==4?'is-active':''}>{t('binaries')}</li>
						</ul>
					</div>
						
				</div>
				<div className="dialog-main">


					<div className="dialog-page" style={{display:page==0?'block':'none'}}>
						<h2>{t('general')}</h2>
						<p>{t('_tab_settings_general_desc')}</p>

						<SettingCombo slug='uiLanguage' key={'uiLanguage'} title={t('ui_language')}
										description={t('_setting_ui_language_desc')} collapsible={true}
										options={uiLanguages} value={settings.editor.locale ?? 'en'}
										setValue={(v:string) => { updateSetting('editor', 'locale', v) }} />

						<SettingCombo slug='colorTheme' key={'colorTheme'} title={t('color_theme')}
										description={t('_setting_color_theme')} collapsible={true}
										options={colorThemes} value={settings.editor.colorTheme}
										setValue={(v:string) => { updateSetting('editor', 'colorTheme', v) }} />

						<SettingCombo slug='fontFamily' key={'fontFamily'} title={t('ui_font_family')}
										description={t('_setting_font_family_desc')} collapsible={true}
										options={fontFamilies} value={settings.editor.fontFamily}
										setValue={(v:string) => { updateSetting('editor', 'fontFamily', v) }} />

					</div>


					<div className="dialog-page" style={{display:page==1?'block':'none'}}>
						<h2>{t('code_editor')}</h2>
						<p>{t('_tab_code_editor_desc')}</p>

						<SettingInput slug='fontSize' key={'fontSize'} title={t('font_size')}
										description={t('_setting_font_size_desc')} collapsible={true}
										type='number' value={settings.editor.fontSize}
										setValue={(v:string) => { updateSetting('editor', 'fontSize', v ) }} />

						<SettingBool slug='enableCodeLens' key={'enableCodeLens'} title={t('enable_code_lens')}
										description={t('_setting_enable_code_lens_desc')}
										checked={settings.editor.enableCodeLens}
										setChecked={(v:boolean) => { updateSetting('editor', 'enableCodeLens', v) }} />

						<SettingBool slug='enableLineNumbers' key={'enableLineNumbers'} title={t('enable_line_numbers')}
										description={t('_setting_enable_line_numbers_desc')}
										checked={settings.editor.enableLineNumbers}
										setChecked={(v:boolean) => { updateSetting('editor', 'enableLineNumbers', v) }} />

						<SettingBool slug='enableMinimap' key={'enableMinimap'} title={t('enable_mini_map')}
										description={t('_setting_enable_minimap_desc')}
										checked={settings.editor.enableMinimap}
										setChecked={(v:boolean) => { updateSetting('editor', 'enableMinimap', v) }} />

					</div>


					<div className="dialog-page" style={{display:page==2?'block':'none'}}>
						<h2>{t('theme')}</h2>
						<p>{t('_tab_theme_desc')}</p>

						<SettingBlank wrapClass='settings-buttons'>
							<div className="buttons">
								<a className="button" onClick={() => doImportTheme()}>{t('import')}</a>
								<a className="button" onClick={() => doExportTheme()}>{t('export')}</a>
								<a className="button" onClick={() => resetTheme()}>{t('restore_defaults')}</a>
							</div>
						</SettingBlank>

						{renderSettings()}
					</div>
					
					<div className="dialog-page" style={{display:page==3?'block':'none'}}>
						<h2>{t('tools')}</h2>
						<p>{t('_tab_tools_desc')}</p>

						<SettingBlank wrapClass='settings-buttons' title={t('clear_recent_projects')}
										description={t('_setting_clear_recent_projects_desc')}>
							<div className="buttons">
								<a className="button" onClick={() => doClearRecentProjects()}>{t('clear')}</a>
							</div>
						</SettingBlank>

					</div>

					<div className="dialog-page" style={{display:page==4?'block':'none'}}>
						<h2>{t('binaries')}</h2>
						<p>{t('_tab_binaries_desc')}</p>

						<SettingInput slug='alternateBinaryPath' key={'alternateBinaryPath'} title={t('alternative_binary_path')}
										description={t('_setting_alt_binary_path_desc')} width={'300px'}
										value={settings.debugging.alternateBinaryPath??""} collapsible={true}
										setValue={(s:string) => { updateSetting('debugging', 'alternateBinaryPath', s) }} />

						<div>
							<div className="buttons">
								<a className="button" onClick={(e:any) => doUpdateBinaries(false)}>{t('refresh_binaries')}</a>
								<a className="button" onClick={(e:any) => doUpdateBinaries(true)}>{t('force_refresh_binaries')}</a>
							</div>
						</div>

						<div className="setting" style={{borderTop: 0, paddingTop: 0}}>
							<pre className="binary-report">{binaryReport}</pre>
						</div>

					</div>

				</div>
			</div>
			<a className="dialog-close" onClick={e => props.onCancel()}><span className="icon-cancel"></span></a>
		</div>
		
	);
}