import { useState, useContext } from 'react';
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


export default function ThemeEditor(props: StyleEditorProps) {
	const settings = useContext(SettingsContext);
	const [slide, isSlide] = useState(false);


	const updateSetting2 = async (group:any, subgroup:any, option:any, newValue:any) => {
		const clone = JSON.parse(JSON.stringify(settings));
		clone[group][subgroup][option] = newValue;
		props.onSettingsChanged(clone);
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
		<div className={['style-editor', slide?'is-shown':'', props.shown?'':'is-closed'].join(' ')} style={{display:props.shown?'block':''}}>
			<div>
				<span className="icon-cancel" onClick={e => props.onClose()}></span>
				<h4 onClick={e => isSlide(!slide)}>Style Editor</h4>
				<div>
					{renderSettings()}
				</div>
			</div>
		</div>
	);
}