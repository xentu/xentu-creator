import React, { CSSProperties, useRef, useEffect } from 'react';
import { classList } from '../../helpers';


type ComponentProps = {
	title: string,
	slug: string,
	description?: string,
	tooltip?: string,
	value: Array<string>,
	setValue: React.Dispatch<React.SetStateAction<Array<string>>>,
	small?: boolean,
	autoFocus?: boolean,
	width?: string,
	half?: boolean,
	rows: number,
	full: boolean
}


export default function SettingTextList(props: ComponentProps) {
	const inputElement = useRef(null);
	useEffect(() => {
		if (props.autoFocus == true && inputElement.current) {
			setTimeout(() => {
				inputElement.current.focus();
				inputElement.current.select();
			}, 100);
		}
	}, []);

	const doUpdateValue = (e:React.ChangeEvent<HTMLTextAreaElement>) => {
		const newText = e.target.value ?? "";
		const newValue = newText.replace("\r", "").split("\n") ?? [] as Array<string>;
		props.setValue(newValue);
	};

	const wrapStyle = {} as CSSProperties;
	const inputStyle = { resize: 'vertical', minHeight: '60px' } as CSSProperties;
	if (props.width !== null) {
		inputStyle.width = props.width;
	}

	if (props.full) {
		wrapStyle.flexDirection = 'column';
		inputStyle.width = '-webkit-fill-available';
		inputStyle.margin = '1.25em 0 0 0';
	}

	const c_half = props.half ? 'half-size' : '';
	const c_full = props.full ? 'full' : '';

	return (
		<div className={classList(['setting setting-input setting-text-list', c_half, c_full])} style={wrapStyle}>
			<div className="setting-left">
				<div>{props.title}</div>
				<small>{props.description}</small>
			</div>
			<div className={["setting-right", props.small?'is-small':''].join(' ')}>
				<textarea className="input" ref={inputElement} title={props.tooltip} rows={props.rows}
						 value={props.value.join("\n")} onChange={doUpdateValue} style={inputStyle} />
			</div>
		</div>
	);
}