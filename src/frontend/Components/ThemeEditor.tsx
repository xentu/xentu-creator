import { MouseEventHandler, useState, useContext, ChangeEventHandler } from 'react';
import SettingInput from '../Components/SettingInput';
import { SettingsContext } from '../Context/SettingsManager';

type StyleEditorProps = {
	shown?: boolean,
	onClose?: Function,
	onSettingsChanged?: Function
}

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

export default function ThemeEditor({ shown, onClose, onSettingsChanged }: StyleEditorProps) {
	const settings = useContext(SettingsContext);
	const [slide, isSlide] = useState(true);


	const updateSetting2 = async (group:any, subgroup:any, option:any, newValue:any) => {
		const clone = JSON.parse(JSON.stringify(settings));
		clone[group][subgroup][option] = newValue;
		onSettingsChanged(clone);
		await window.api.setSettings(clone);
	};


	const renderSettings = () => {
		const res = new Array<any>();
		const darkOrLight = settings.editor.colorTheme;
		
		for (const [key, label] of Object.entries(themeOpts)) {
			res.push(
				<label key={key}>
					<span>{label}</span>
					<input type="color" value={settings.theme[darkOrLight][key]}
							 onChange={(v:any) => { updateSetting2('theme', darkOrLight, key, v.target.value) }} />
				</label>
			)
		}
	
		return res;
	};

	return (
		<div className={['style-editor', slide?'is-shown':'', shown?'':'is-closed'].join(' ')} style={{display:shown?'block':''}}>
			<div>
				<span className="icon-cancel" onClick={e => onClose()}></span>
				<h4 onClick={e => isSlide(!slide)}>Style Editor</h4>
				<div>
					{/* <label>
						<span>Header Background</span>
						<input type="color" />
					</label>
					<label>
						<span>Header Text</span>
						<input type="color" />
					</label> */}
					{renderSettings()}
				</div>
			</div>
		</div>
	);
}