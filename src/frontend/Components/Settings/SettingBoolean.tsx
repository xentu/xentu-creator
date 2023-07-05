import React from 'react';
import { classList } from '../../helpers';


type ComponentProps = {
	title: string,
	slug: string,
	half?: boolean,
	description?: string,
	checked: boolean,
	setChecked: React.Dispatch<React.SetStateAction<boolean>>,
	stack?: boolean
}


export default function SettingBool(props: ComponentProps) {
	const c_half = props.half ? 'half-size' : '';
	const c_stack = props.stack ? 'stacked' : '';
	return (
		<div className={classList(['setting setting-boolean', c_half, c_stack])} key={props.slug}>
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