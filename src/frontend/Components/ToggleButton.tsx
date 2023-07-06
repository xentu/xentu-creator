import { PropsWithChildren } from 'react';
import { classList } from '../helpers';


type ComponentProps = {
	className?: string,
	tooltip?: string,
	toggle: boolean,
	disabled?: boolean,
	onClick?: Function
};


export default function ToggleButton(props: ComponentProps) {
	const handleClick = () => {
		if (props.disabled == true) return;
		if (props.onClick) props.onClick();
	};
	const c_disabled = props.disabled ? 'is-disabled':'';
	const c_toggle = props.toggle ? 'is-toggled':'';
	return (
		<a className={classList(['toggle-button', props.className, c_disabled, c_toggle])} 
			title={props.tooltip}
			onClick={handleClick} />
	);
}