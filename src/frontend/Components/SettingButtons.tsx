import React from 'react';
import Dictionary from '../../main/classes/Dictionary';


type SettingButtonsProps = {
	onSubmit?: Function,
	onCancel?: Function
}


export default function SettingButtons({ onSubmit, onCancel }: SettingButtonsProps) {
	return (
		<div className="setting setting-buttons">
			<div className="setting-left">
				<div>&nbsp;</div>
				<small>&nbsp;</small>
			</div>
			<div className="setting-right">
				<div className="buttons">
					<a className="button primary" onClick={() => onSubmit()}>OK</a>
					<a className="button" onClick={() => onCancel()}>Cancel</a>
				</div>
			</div>
		</div>
	);
}