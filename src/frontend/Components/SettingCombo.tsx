import React, { useState } from 'react';
import Dictionary from '../../main/classes/Dictionary';

type SettingComboProps = {
	title: string,
	slug: string,
	description?: string,
	value: string,
	setValue: React.Dispatch<React.SetStateAction<string>>,
	options: Dictionary<string>
}

export default function SettingCombo({ title, slug, value, setValue, options, description = '' }: SettingComboProps) {
	const renderOptions = () => {
		const result= new Array<any>();
		let index = 0;
		options.keys().forEach((key:string) => {
			const label = options.get(key);
			result.push(<>
				<option key={`${slug}-${key}`} value={key} selected={value==key}>{label}</option>
			</>);
		});
		return result;
	};
	return (
		<div className="setting setting-boolean">
			<div className="setting-left">
				<div>{title}</div>
				<small>{description}</small>
			</div>
			<div className="setting-right">
				<select onChange={(e:any) => { setValue(e.target.value) }}>
					{renderOptions()}
				</select>
			</div>
		</div>
	);
}