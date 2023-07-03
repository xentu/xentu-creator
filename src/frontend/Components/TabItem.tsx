import { MouseEventHandler } from 'react';


type TabItemProps = {
	label: string,
	active?: boolean,
	onClick?: MouseEventHandler,
	onClose?: MouseEventHandler
}


export default function TabItem(props: TabItemProps) {
	const c_active = props.active ? ' is-active' : '';
	return (
		<a className={['tab-label', c_active].join(' ')}
			onClick={e => props.onClick(e)}>
				<span>{props.label}</span> <span className="icon-cancel" onClick={e => props.onClose(e)}></span>
		</a>
	);
}