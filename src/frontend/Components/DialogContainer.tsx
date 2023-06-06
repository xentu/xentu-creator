import React, { PropsWithChildren } from 'react'

type DialogContainerProps = {
	visible: boolean,
	onClose: Function
}

export default function DialogContainer(props:PropsWithChildren<DialogContainerProps>) {
	const c_visible = props.visible ? '' : 'is-hidden';
	return (
		<div className={`dialog-container ${c_visible}`}>
			<div className={'dialog'}>
				{props.children}
				<a className="dialog-close"><span className="icon-cancel" onClick={e => props.onClose(e)}></span></a>
			</div>
		</div>
	);
}