import { useState } from 'react';
import Dictionary from '../../main/classes/Dictionary';
import SettingButtons from '../Components/Settings/SettingButtons';
import SettingCombo from '../Components/Settings/SettingCombo';
import { useTranslation } from "react-i18next";


type ExportDialogProps = {
	onCancel: Function
}


const platforms = new Dictionary<string>();
platforms.add('windows', 'Windows (x86-64)');
platforms.add('macos', 'MacOS (x86-64)');
platforms.add('linux', 'Linux (x86-64)');


export default function ExportDialog(props: ExportDialogProps) {
	const { i18n, t } = useTranslation();
	const [platform, setPlatform] = useState('windows');


	const onSubmit = async () => {
		const file_r = await window.api.exportGame(platform);
		props.onCancel();
	};

	
	return (
		<div className={'dialog stretch-height'}>
			<div className={`settings-dialog`} style={{width:'600px'}}>
				<div className="dialog-main">
					
				<div className="dialog-page" style={{display:'block'}}>
						<h2>{t('export_game')}</h2>
						{ /* <p>Configure basic info about your game.</p> */ }

						<SettingCombo slug='platform' key={'platform'} title={t('platform')}
										description={t('_export_game_platform_desc')}
										options={platforms} value={platform}
										setValue={(v:string) => {setPlatform(v)}} />

						<SettingButtons okText={'Export'} onSubmit={onSubmit} onCancel={props.onCancel} />

					</div>

				</div>

			</div>
			<a className="dialog-close" onClick={e => props.onCancel()}><span className="icon-cancel"></span></a>
		</div>
	);
}