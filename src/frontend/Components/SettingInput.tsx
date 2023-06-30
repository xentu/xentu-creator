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


export default function SettingInput({ title, slug, value, setValue, minimum, description = '', type = 'text', small = false, autoFocus }: SettingInputProps) {
	const inputElement = useRef(null);
	useEffect(() => {
		if (autoFocus == true && inputElement.current) {
			setTimeout(() => {
				inputElement.current.focus();
				inputElement.current.select();
			}, 100);
		}
	}, []);

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
				<input ref={inputElement} type={type} value={value} min={minimum} onChange={(e:any) => { setValue(e.target.value) }} style={style} />
			</div>
		</div>
	);
}