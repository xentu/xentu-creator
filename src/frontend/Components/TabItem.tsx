import { MouseEventHandler } from 'react';

type TabItemProps = {
	label: string,
	active?: boolean,
	onClick?: MouseEventHandler,
	onClose?: MouseEventHandler
}

export default function TabItem({ label, active, onClick, onClose }: TabItemProps) {
	const c_active = active ? ' is-active' : '';
	return (
		<a className={['tab-label', c_active].join(' ')}
			onClick={e => onClick(e)}>
				<span>{label}</span> <span className="icon-cancel" onClick={e => onClose(e)}></span>
		</a>
	);
}