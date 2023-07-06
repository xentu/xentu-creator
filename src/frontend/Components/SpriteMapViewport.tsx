import { PropsWithChildren } from 'react';
import { classList } from '../helpers';


type ComponentProps = {
	className?: string,
	disabled?: boolean
};


export default function SpriteMapViewport(props: PropsWithChildren<ComponentProps>) {
	return (
		<div className={classList(['sprite-map-viewport', props.className, props.disabled ? 'is-disabled':''])}>
			{props.children}
		</div>
	);
}