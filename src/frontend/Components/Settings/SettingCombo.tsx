import React, { CSSProperties } from 'react';
import Dictionary from '../../../main/classes/Dictionary';
import { classList } from '../../helpers';


type ComponentProps = {
	title: string,
	slug: string,
	description?: string,
	tooltip?: string,
	value: any,
	setValue: React.Dispatch<React.SetStateAction<string>>,
	options: Dictionary<string>,
	stack?: boolean,
	collapsible?: boolean,
	width?: string
}


export default function SettingCombo(props: ComponentProps) {
	const renderOptions = () => {
		const result = new Array<any>();
		props.options.keys().forEach((key:string) => {
			const label = props.options.get(key);
			result.push(<option key={props.slug+'-'+key} value={key}>{label}</option>);
		});
		return result;
	};

	const style = {} as CSSProperties;
	if (props.width !== null) {
		style.width = props.width;
	}

	const c_stack = props.stack ? 'stacked' : '';
	const c_collapsible = props.collapsible ? 'collapsible' : '';

	return (
		<div className={classList(['setting setting-combo', c_stack, c_collapsible])}>
			<div className="setting-left">
				<div>{props.title}</div>
				<small>{props.description}</small>
			</div>
			<div className="setting-right">
				<select style={style} key={props.slug} onChange={(e:any) => { props.setValue(e.target.value) }} value={props.value} title={props.tooltip}>
					{renderOptions()}
				</select>
			</div>
		</div>
	);
}