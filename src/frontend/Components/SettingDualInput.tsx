import React, { CSSProperties } from 'react';

type SettingDualInputProps = {
	title: string,
	slug: string,
	description?: string,
	value1: any,
	setValue1: React.Dispatch<React.SetStateAction<string>>,
	value2: any,
	setValue2: React.Dispatch<React.SetStateAction<string>>,
	type?: string
}

export default function SettingDualInput({ title, slug, value1, setValue1, value2, setValue2, description = '', type = 'text' }: SettingDualInputProps) {
	const style = {} as CSSProperties;
	if (type == 'color') {
		style.width = '27px';
		style.borderRadius = '20px';
	}

	return (
		<div className="setting setting-dual-input">
			<div className="setting-left">
				<div>{title}</div>
				<small>{description}</small>
			</div>
			<div className="setting-right">
				<input type={type} value={value1} onChange={(e:any) => { setValue1(e.target.value) }} style={style} />
				<input type={type} value={value2} onChange={(e:any) => { setValue2(e.target.value) }} style={style} />
			</div>
		</div>
	);
}