import React from 'react';
import { classList } from '../../helpers';

type ComponentProps = {
	title: string,
	slug: string,
	description?: string,
	value: string,
	setValue: React.Dispatch<React.SetStateAction<string>>,
	type?: string,
	stack?: boolean
}


export default function SettingText(props: ComponentProps) {
	const c_stack = props.stack ? 'stacked' : '';

	return (
		<div className={classList(['setting setting-color', c_stack])}>
			<div className="setting-left">
				<div>{props.title}</div>
				<small>{props.description}</small>
			</div>
			<div className="setting-right">
				<input type={props.type} value={props.value} onChange={(e:any) => { props.setValue(e.target.value) }} />
			</div>
		</div>
	);
}