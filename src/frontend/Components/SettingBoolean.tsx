import React from 'react';


type SettingBoolProps = {
	title: string,
	slug: string,
	half?: boolean,
	description?: string,
	checked: boolean,
	setChecked: React.Dispatch<React.SetStateAction<boolean>>
}


export default function SettingBool(props: SettingBoolProps) {
	const c_half = props.half ? 'half-size' : '';
	return (
		<div className={['setting setting-boolean', c_half].join(' ')} key={props.slug}>
			<div className="setting-left">
				<div>{props.title}</div>
				<small>{props.description}</small>
			</div>
			<div className="setting-right">
				<span className={`toggle-button ${props.checked?'is-toggled':''}`} onClick={() => props.setChecked(!props.checked)}></span>
			</div>
		</div>
	);
}