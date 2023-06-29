import React from 'react';


type SettingBoolProps = {
	title: string,
	slug: string,
	half?: boolean,
	description?: string,
	checked: boolean,
	setChecked: React.Dispatch<React.SetStateAction<boolean>>
}


export default function SettingBool({ title, slug, half, checked, setChecked, description = '' }: SettingBoolProps) {
	const c_half = half ? 'half-size' : '';
	return (
		<div className={['setting setting-boolean', c_half].join(' ')} key={slug}>
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