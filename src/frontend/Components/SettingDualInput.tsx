import React, { CSSProperties } from 'react';


type SettingDualInputProps = {
	title: string,
	slug: string,
	description?: string,
	value1: any,
	setValue1: React.Dispatch<React.SetStateAction<string>>,
	minimum1?: number,
	value2: any,
	setValue2: React.Dispatch<React.SetStateAction<string>>,
	minimum2?: number,
	type?: string
}


export default function SettingDualInput(props: SettingDualInputProps) {
	const style = {} as CSSProperties;
	if (props.type == 'color') {
		style.width = '27px';
		style.borderRadius = '20px';
	}

	return (
		<div className="setting dual-input">
			<div className="setting-left">
				<div>{props.title}</div>
				<small>{props.description}</small>
			</div>
			<div className="setting-right">
				<input className="input" type={props.type??"text"} value={props.value1} min={props.minimum1} onChange={(e:any) => { props.setValue1(e.target.value) }} style={style} />
				<input className="input" type={props.type??"text"} value={props.value2} min={props.minimum2} onChange={(e:any) => { props.setValue2(e.target.value) }} style={style} />
			</div>
		</div>
	);
}