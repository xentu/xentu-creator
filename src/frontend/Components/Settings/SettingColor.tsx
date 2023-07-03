import React from 'react';


type SettingTextProps = {
	title: string,
	slug: string,
	description?: string,
	value: string,
	setValue: React.Dispatch<React.SetStateAction<string>>,
	type?: string
}


export default function SettingText(props: SettingTextProps) {
	return (
		<div className="setting setting-boolean">
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