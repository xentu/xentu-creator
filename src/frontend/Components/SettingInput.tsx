import React, { CSSProperties, useRef, useEffect } from 'react';


type SettingInputProps = {
	title: string,
	slug: string,
	description?: string,
	value: any,
	setValue: React.Dispatch<React.SetStateAction<string>>,
	minimum?: number,
	type?: string,
	small?: boolean,
	autoFocus?: boolean
}


export default function SettingInput(props: SettingInputProps) {
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

	return (
		<div className="setting setting-input">
			<div className="setting-left">
				<div>{props.title}</div>
				<small>{props.description}</small>
			</div>
			<div className={["setting-right", props.small?'is-small':''].join(' ')}>
				<input className="input" ref={inputElement} type={props.type??'text'} value={props.value} min={props.minimum} onChange={(e:any) => { props.setValue(e.target.value) }} style={style} />
			</div>
		</div>
	);
}