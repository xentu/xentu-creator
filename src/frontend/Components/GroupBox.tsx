import { PropsWithChildren } from 'react';
import { classList } from '../helpers';


type ComponentProps = {
	className?: string,
	header?: string,
	disabled?: boolean
};


export default function GroupBox(props: PropsWithChildren<ComponentProps>) {
	return (
		<div className={classList(['group-box', props.className, props.disabled ? 'is-disabled':''])} 
			data-header={props.header}>
			{props.children}
		</div>
	);
}