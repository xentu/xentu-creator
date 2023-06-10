import React from 'react';

type SettingTextProps = {
	title: string,
	slug: string,
	description?: string,
	value: string,
	setValue: React.Dispatch<React.SetStateAction<string>>,
	type?: string
}

export default function SettingText({ title, slug, value, setValue, description = '', type = 'text' }: SettingTextProps) {
	return (
		<div className="setting setting-boolean">
			<div className="setting-left">
				<div>{title}</div>
				<small>{description}</small>
			</div>
			<div className="setting-right">
				<input type={type} value={value} onChange={(e:any) => { setValue(e.target.value) }} />
			</div>
		</div>
	);
}