import React, { CSSProperties } from 'react';

type SettingInputProps = {
	title: string,
	slug: string,
	description?: string,
	value: string,
	setValue: React.Dispatch<React.SetStateAction<string>>,
	type?: string,
	small?: boolean
}

export default function SettingInput({ title, slug, value, setValue, description = '', type = 'text', small = false }: SettingInputProps) {
	const style = {} as CSSProperties;
	if (type == 'color') {
		style.width = '27px';
		style.borderRadius = '20px';
	}

	return (
		<div className="setting setting-input">
			<div className="setting-left">
				<div>{title}</div>
				<small>{description}</small>
			</div>
			<div className={["setting-right", small?'is-small':''].join(' ')}>
				<input type={type} value={value} onChange={(e:any) => { setValue(e.target.value) }} style={style} />
			</div>
		</div>
	);
}