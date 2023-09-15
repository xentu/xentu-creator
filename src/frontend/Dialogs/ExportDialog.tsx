import { useState } from 'react';
import Dictionary from '../../main/classes/Dictionary';
import SettingBool from '../Components/Settings/SettingBoolean';
import SettingButtons from '../Components/Settings/SettingButtons';
import SettingCombo from '../Components/Settings/SettingCombo';
import SettingDualInput from '../Components/Settings/SettingDualInput';
import SettingInput from '../Components/Settings/SettingInput';
import { useTranslation } from "react-i18next";


type ExportDialogProps = {
	onCancel: Function
}


export default function ExportDialog(props: ExportDialogProps) {
	const { i18n, t } = useTranslation();


	const onSubmit = async () => {

	};

	
	return (
		<div className={'dialog stretch-height'}>
			<div className={`settings-dialog`} style={{width:'600px'}}>
				<div className="dialog-main">
					
				<div className="dialog-page" style={{display:'block'}}>
						<h2>{t('export_game')}</h2>
						{ /* <p>Configure basic info about your game.</p> */ }


						<SettingButtons onSubmit={onSubmit} onCancel={props.onCancel} />

					</div>

				</div>

			</div>
			<a className="dialog-close" onClick={e => props.onCancel()}><span className="icon-cancel"></span></a>
		</div>
	);
}