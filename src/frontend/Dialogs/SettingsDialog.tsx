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

const fruitOptions = new Dictionary<string>();
fruitOptions.add('apple', 'Apple');
fruitOptions.add('banana', 'Banana');
fruitOptions.add('orange', 'Orange');


export default function SettingsDialog({ onSettingsChanged }: SettingsDialogProps) {
	const settings = useContext(SettingsContext);
	const [page, setPage] = useState(0);

	const renderTestData = (str:string) => {
		const res = [];
		for (var i=0; i<50; i++) {
			res.push(<div key={'test-data'+i}>{str}</div>);
		}
		return res;
	}

	const updateSetting = async (arr:any) => {
		const merged = { ...settings, ...arr };
		onSettingsChanged(merged);
		await window.api.setSettings(merged);
	};

	return (
		<div className={`settings-dialog`}>
			<div className="settings-sidebar">
				
				<div>
					<h2>Options</h2>
					<ul>
						<li data-index="0" onClick={() => setPage(0)} className={page==0?'is-active':''}>Editor</li>
						<li data-index="1" onClick={() => setPage(1)} className={page==1?'is-active':''}>Debug</li>
						<li data-index="2" onClick={() => setPage(2)} className={page==2?'is-active':''}>Binaries</li>
					</ul>
				</div>
					
			</div>
			<div className="settings-main">
				<div className="settings-page" style={{display:page==0?'block':'none'}}>

					<h2>Editor</h2>

					<SettingBool slug='enableCodeLens' key='enableCodeLens' title='Enable CodeLens'
									description='This is the right-hand bar'
									checked={settings.editor.enableCodeLens}
									setChecked={(v:boolean) => { updateSetting({ editor: { enableCodeLens:v } }) }} />
				</div>
				<div className="settings-page" style={{display:page==1?'block':'none'}}>
					{renderTestData('b')}
				</div>
				<div className="settings-page" style={{display:page==2?'block':'none'}}>
					{renderTestData('c')}
				</div>
			</div>
		</div>
	);
}