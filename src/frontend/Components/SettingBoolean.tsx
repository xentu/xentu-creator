import React, { useState } from 'react';

type SettingBoolProps = {
	title: string,
	slug: string,
	description?: string,
	checked: boolean,
	setChecked: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SettingBool({ title, slug, checked, setChecked, description = '' }: SettingBoolProps) {
	return (
		<div className="setting setting-boolean" key={slug}>
			<div className="setting-left">
				<div>{title}</div>
				<small>{description}</small>
			</div>
			<div className="setting-right">
				<span className={`toggle-button ${checked?'is-toggled':''}`} onClick={() => setChecked(!checked)}></span>
			</div>
		</div>
	);
}