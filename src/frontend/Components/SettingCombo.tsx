import React from 'react';
import Dictionary from '../../main/classes/Dictionary';


type SettingComboProps = {
	title: string,
	slug: string,
	description?: string,
	value: any,
	setValue: React.Dispatch<React.SetStateAction<string>>,
	options: Dictionary<string>
}


export default function SettingCombo(props: SettingComboProps) {
	const renderOptions = () => {
		const result = new Array<any>();
		props.options.keys().forEach((key:string) => {
			const label = props.options.get(key);
			result.push(<option key={props.slug+'-'+key} value={key}>{label}</option>);
		});
		return result;
	};
	return (
		<div className="setting setting-boolean">
			<div className="setting-left">
				<div>{props.title}</div>
				<small>{props.description}</small>
			</div>
			<div className="setting-right">
				<select key={props.slug} onChange={(e:any) => { props.setValue(e.target.value) }} value={props.value}>
					{renderOptions()}
				</select>
			</div>
		</div>
	);
}