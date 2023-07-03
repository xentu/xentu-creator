import { useContext, useEffect, useState } from 'react';
import Dictionary from '../../main/classes/Dictionary';
import SettingBlank from '../Components/Settings/SettingBlank';
import SettingBool from '../Components/Settings/SettingBoolean';
import SettingCombo from '../Components/Settings/SettingCombo';
import SettingInput from '../Components/Settings/SettingInput';
import { SettingsContext } from '../Context/SettingsManager';


type SettingsDialogProps = {
	onSettingsChanged: Function
}


declare global {
	interface Window {
	  api?: any;
	}
}


const colorThemes = new Dictionary<string>();
colorThemes.add('dark', 'Dark');
colorThemes.add('light', 'Light');
//colorThemes.add('os-decides', 'OS Decides');

const fontFamilies = new Dictionary<string>();
fontFamilies.add('default', 'Default (System Defined)');
fontFamilies.add('roboto', 'Roboto');

const fontSizes = new Dictionary<string>();
fontSizes.add('16', '16');

const platformList = new Dictionary<string>();
platformList.add('x86', 'x86');
platformList.add('x64', 'x64');
platformList.add('Arm64', 'Arm64');


export default function SettingsDialog(props: SettingsDialogProps) {
	const settings = useContext(SettingsContext);
	const [page, setPage] = useState(0);
	const [binaryReport, setBinaryReport] = useState('');


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
	};

	const updateSetting2 = async (group:any, subgroup:any, option:any, newValue:any) => {
		const clone = JSON.parse(JSON.stringify(settings));
		clone[group][subgroup][option] = newValue;
		props.onSettingsChanged(clone);
		await window.api.setSettings(clone);
	};

	const themeOpts = {
		mainBackground:			'Main Background',
		mainText:					'Main Text',
		sidebarBackground:		'Sidebar Background',
		sidebarText:				'Sidebar Text',
		hoverBackground:			'Hover Background',
		hoverText:					'Hover Text',
		activeBackground:			'Active Background',
		activeText:					'Active Text',
		editorBackground:			'Editor Background',
		editorText:					'Editor Text',
		terminalBackground:     'Terminal Background',
		terminalText:     		'Terminal Text',
		footerBackground:			'Footer Background',
		footerText:					'Footer Text'
	};
	

	const resetTheme = async () => {
		if (await window.api.showConfirm('Are you sure?')) {
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
					  description={`Change the color of ${label}.`}
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
			await window.api.showAlert('Export Successful');
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
			await window.api.showAlert('Import Successful');
		}		
	};

	const doClearRecents = async () => {
		const clone = JSON.parse(JSON.stringify(settings));
		clone.recentProjects = [];
		props.onSettingsChanged(clone);
		await window.api.setSettings(clone);
		await window.api.showAlert("Recent's Cleared");
	};

	
	return (
		<div className={`settings-dialog`} style={{width:'900px', minHeight:'600px'}}>
			<div className="dialog-sidebar">
				
				<div>
					<h2>Options</h2>
					<ul>
						<li data-index="0" onClick={() => setPage(0)} className={page==0?'is-active':''}>Editor</li>
						<li data-index="1" onClick={() => setPage(1)} className={page==1?'is-active':''}>Theme</li>
						<li data-index="2" onClick={() => setPage(2)} className={page==2?'is-active':''}>Tools</li>
						<li data-index="3" onClick={() => setPage(3)} className={page==3?'is-active':''}>Binaries</li>
					</ul>
				</div>
					
			</div>
			<div className="dialog-main">


				<div className="dialog-page" style={{display:page==0?'block':'none'}}>

					<h2>Editor</h2>
					<p>Settings for the code editor.</p>

					<SettingCombo slug='fontFamily' key={'fontFamily'} title='UI Font Family'
									  description='Change the font family for the UI'
									  options={fontFamilies} value={settings.editor.fontFamily}
									  setValue={(v:string) => { updateSetting('editor', 'fontFamily', v) }} />

					<SettingInput slug='fontSize' key={'fontSize'} title='Font Size'
									  description='Change the default font size for the code editor'
									  type='number' value={settings.editor.fontSize}
									  setValue={(v:string) => { updateSetting('editor', 'fontSize', v ) }} />

					<SettingBool slug='enableCodeLens' key={'enableCodeLens'} title='Enable CodeLens'
									description='Enable the code-lens feature in Monaco'
									checked={settings.editor.enableCodeLens}
									setChecked={(v:boolean) => { updateSetting('editor', 'enableCodeLens', v) }} />

					<SettingBool slug='enableLineNumbers' key={'enableLineNumbers'} title='Enable Line Numbers'
									description='Show or hide the line numbers'
									checked={settings.editor.enableLineNumbers}
									setChecked={(v:boolean) => { updateSetting('editor', 'enableLineNumbers', v) }} />

					<SettingBool slug='enableMinimap' key={'enableMinimap'} title='Enable Mini Map'
									description='This is the right-hand bar'
									checked={settings.editor.enableMinimap}
									setChecked={(v:boolean) => { updateSetting('editor', 'enableMinimap', v) }} />

				</div>


				<div className="dialog-page" style={{display:page==1?'block':'none'}}>
					<h2>Theme</h2>
					<p>Customize the visual theme for Xentu Creator.</p>

					<SettingCombo slug='colorTheme' key={'colorTheme'} title='Color Theme'
									  description='Change the color theme of the app'
									  options={colorThemes} value={settings.editor.colorTheme}
									  setValue={(v:string) => { updateSetting('editor', 'colorTheme', v) }} />

					<SettingBlank wrapClass='settings-buttons'>
						<div className="buttons">
							<a className="button" onClick={() => doImportTheme()}>Import</a>
							<a className="button" onClick={() => doExportTheme()}>Export</a>
							<a className="button" onClick={() => resetTheme()}>Restore Defaults</a>
						</div>
					</SettingBlank>

					{renderSettings()}
				</div>
				
				<div className="dialog-page" style={{display:page==2?'block':'none'}}>
					<h2>Tools</h2>
					<p>
						Various tools for managing things in app.
					</p>

					<SettingBlank wrapClass='settings-buttons' title="Clear Recent Projects" description="Clear the list of projects on the welcome screen.">
						<div className="buttons">
							<a className="button" onClick={() => doClearRecents()}>Clear</a>
						</div>
					</SettingBlank>

				</div>

				<div className="dialog-page" style={{display:page==3?'block':'none'}}>
					<h2>Binaries</h2>
					<p>
						Use this page to download the engine binaries you need to test, 
						play or deploy your games.
					</p>

					<SettingInput slug='alternateBinaryPath' key={'alternateBinaryPath'} title='Alternate Binary Path'
									  description='Custom location for debugging binaries (empty to disable).'
									  value={settings.debugging.alternateBinaryPath??""}
									  setValue={(s:string) => { updateSetting('debugging', 'alternateBinaryPath', s) }} />

					<div>
						<div className="buttons">
							<a className="button" onClick={(e:any) => doUpdateBinaries(false)}>Refresh Binaries</a>
							<a className="button" onClick={(e:any) => doUpdateBinaries(true)}>Force Refresh Binaries (slower)</a>
						</div>
					</div>

					<div className="setting" style={{borderTop: 0, paddingTop: 0}}>
						<pre className="binary-report">{binaryReport}</pre>
					</div>

				</div>

			</div>
		</div>
	);
}