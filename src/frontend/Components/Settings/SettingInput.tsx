import React, { CSSProperties, useRef, useEffect } from 'react';
import { classList } from '../../helpers';


type ComponentProps = {
	title: string,
	slug: string,
	description?: string,
	tooltip?: string,
	value: any,
	setValue: React.Dispatch<React.SetStateAction<string>>,
	minimum?: number,
	type?: string,
	small?: boolean,
	autoFocus?: boolean,
	stack?: boolean,
	collapsible?: boolean,
	width?: string
}


export default function SettingInput(props: ComponentProps) {
	const inputElement = useRef(null);
	useEffect(() => {
		if (props.autoFocus == true && inputElement.current) {
			setTimeout(() => {
				inputElement.current.focus();
				inputElement.current.select();
			}, 100);
		}
	}, []);

	const style = {} as CSSProperties;
	if (props.type == 'color') {
		style.width = '27px';
		style.borderRadius = '20px';
	}
	if (props.width !== null) {
		style.width = props.width;
	}

	const c_stack = props.stack ? 'stacked' : '';
	const c_collapsible = props.collapsible ? 'collapsible' : '';

	return (
		<div className={classList(['setting setting-input', c_stack, c_collapsible])}>
			<div className="setting-left">
				<div>{props.title}</div>
				<small>{props.description}</small>
			</div>
			<div className={["setting-right", props.small?'is-small':''].join(' ')}>
				<input className="input" ref={inputElement} type={props.type??'text'} title={props.tooltip} 
						 value={props.value} min={props.minimum} onChange={(e:any) => { props.setValue(e.target.value) }} style={style} />
			</div>
		</div>
	);
}