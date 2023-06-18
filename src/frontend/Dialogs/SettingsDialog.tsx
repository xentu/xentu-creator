import { useContext, useState } from 'react';
import SettingBool from '../Components/SettingBoolean';
import SettingCombo from '../Components/SettingCombo';
import Dictionary from '../../main/classes/Dictionary';
import SettingInput from '../Components/SettingInput';
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
fontFamilies.add('default', 'Default');

const fontSizes = new Dictionary<string>();
fontSizes.add('16', '16');

const platformList = new Dictionary<string>();
platformList.add('x86', 'x86');
platformList.add('x64', 'x64');
platformList.add('Arm64', 'Arm64');


export default function SettingsDialog({ onSettingsChanged }: SettingsDialogProps) {
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
		const clone = JSON.parse(JSON.stringify(settings));
		clone[group][option] = newValue;
		onSettingsChanged(clone);
		await window.api.setSettings(clone);
	};

	const updateSetting2 = async (group:any, subgroup:any, option:any, newValue:any) => {
		const clone = JSON.parse(JSON.stringify(settings));
		clone[group][subgroup][option] = newValue;
		onSettingsChanged(clone);
		await window.api.setSettings(clone);
	};

	const themeOpts = {
		mainBackground:			'Main Background',
		mainText:					'Main Text',
		sidebarBackground:		'Sidebar Background',
		sidebarText:				'Sidebar Text',
		sidebarHoverBackground:	'Sidebar Hover Background',
		sidebarHoverText:			'Sidebar Hover Text',
		sidebarActiveBackground:'Sidebar Hover Background',
		sidebarActiveText:		'Sidebar Hover Text',
		editorBackground:			'Editor Background',
		editorText:					'Editor Text',
		terminalBackground:     'Terminal Background',
		terminalText:     		'Terminal Text',
		footerBackground:			'Footer Background',
		footerText:					'Footer Text'
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

	return (
		<div className={`settings-dialog`}>
			<div className="settings-sidebar">
				
				<div>
					<h2>Options</h2>
					<ul>
						<li data-index="0" onClick={() => setPage(0)} className={page==0?'is-active':''}>Editor</li>
						<li data-index="1" onClick={() => setPage(1)} className={page==1?'is-active':''}>Theme</li>
						<li data-index="2" onClick={() => setPage(2)} className={page==2?'is-active':''}>Debug</li>
						<li data-index="3" onClick={() => setPage(3)} className={page==3?'is-active':''}>Updates</li>
					</ul>
				</div>
					
			</div>
			<div className="settings-main">


				<div className="settings-page" style={{display:page==0?'block':'none'}}>

					<h2>Editor</h2>
					<p>Settings for the code editor.</p>

					<SettingCombo slug='colorTheme' key={'colorTheme'} title='Color Theme'
									  description='Change the color theme of the code editor'
									  options={colorThemes} value={settings.editor.colorTheme}
									  setValue={(v:string) => { updateSetting('editor', 'colorTheme', v) }} />

					<SettingCombo slug='fontFamily' key={'fontFamily'} title='Color Theme'
									  description='Change the font family of the code editor'
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


				<div className="settings-page" style={{display:page==1?'block':'none'}}>
					<h2>Theme</h2>
					<p>Customize the visual theme for Xentu Creator.</p>
					{renderSettings()}
				</div>


				<div className="settings-page" style={{display:page==2?'block':'none'}}>

					<h2>Debugging</h2>
					<p>Settings for running &amp; debugging your games.</p>
					<SettingBool slug='enableDebugging' key={'enableDebugging'} title='Enable Debugging'
									description='This is the right-hand bar'
									checked={settings.debugging.enableDebugging}
									setChecked={(v:boolean) => { updateSetting('debugging', 'enableDebugging', v) }} />
					<SettingInput slug='mainBinary' key={'mainBinary'} title='Main Binary'
									  description='Provide a path to the game engine binary'
									  value={settings.debugging.mainBinary}
									  setValue={(s:string) => { updateSetting('debugging', 'mainBinary', s) }} />
				</div>
				

				<div className="settings-page" style={{display:page==3?'block':'none'}}>
					<h2>Updates</h2>
					<p>Check for updates to the IDE and game binaries.</p>
				</div>

			</div>
		</div>
	);
}