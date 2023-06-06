import React, { useState } from 'react';
import SettingBool from '../Components/SettingBoolean';
import SettingCombo from '../Components/SettingCombo';
import Dictionary from '../../main/classes/Dictionary';
import SettingInput from '../Components/SettingInput';

type SettingsDialogProps = {
	
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


export default function SettingsDialog({  }: SettingsDialogProps) {
	const [page, setPage] = useState(0);
	const [myBool, setMyBool] = useState(false);
	const [combo1, setCombo1] = useState('apple');
	const [text1, setText1] = useState('');
	const [text2, setText2] = useState('');

	const renderTestData = (str:string) => {
		const res = [];
		for (var i=0; i<50; i++) {
			res.push(<div>{str}</div>);
		}
		return res;
	}

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

					<SettingBool slug="bool-1" title='Test Setting' description='And a test description.' checked={myBool} setChecked={setMyBool} />
					<SettingCombo slug="combo-1" title="Combo Box 1" 
									  description='Gives dropdown to pick from one of many options.'
									  options={fruitOptions}
									  value={combo1} setValue={setCombo1} />

					<SettingInput slug="text-1" type="color" title="Another Setting" description='This one uses a text box' value={text1} setValue={setText1} />

					<SettingInput slug="text-2" type="text" title="Another Setting" description='This one uses a text box' value={text2} setValue={setText2} />

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