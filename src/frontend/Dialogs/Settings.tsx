import React from 'react';
import Logo from "./Logo";

type SettingsDialogProps = {
	
}

declare global {
	interface Window {
	  api?: any;
	}
}

export default function SettingsDialog({  }: SettingsDialogProps) {
	return (
		<div className={`settings-dialog`}>

			&nbsp;

		</div>
	);
}