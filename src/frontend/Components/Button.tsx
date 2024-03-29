import { PropsWithChildren } from 'react';
import { classList } from '../helpers';


type ComponentProps = {
	className?: string,
	tooltip?: string,
	disabled?: boolean,
	style?: any,
	onClick?: Function
};


export default function Button(props: PropsWithChildren<ComponentProps>) {
	const handleClick = () => {
		if (props.disabled == true) return;
		if (props.onClick) props.onClick();
	};
	return (
		<a className={classList([props.className, props.disabled ? 'is-disabled':''])} 
			title={props.tooltip}
			style={props.style}
			onClick={handleClick}>
			{props.children}
		</a>
	);
}