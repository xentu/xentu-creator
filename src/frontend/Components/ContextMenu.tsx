import { useState, useEffect } from 'react';
import { MenuEntry } from './MenuItem';


type ContextMenuProps = {
	children?: string | JSX.Element | JSX.Element[],
	onBlur: Function
}


const readChildCount = (children: string | JSX.Element | JSX.Element[]) => {
	let count = 0;
	if (children !== null) count = 1;
	if (children && children.hasOwnProperty('length')) count = (children as JSX.Element[]).length;
	return count;
};


export default function ContextMenu(props: ContextMenuProps) {
	const childrenCount = readChildCount(props.children);
	const menuVisible = childrenCount > 0;

	const handleClick = (e:React.MouseEvent) => {
		e.stopPropagation();
		props.onBlur();
	};

	return (
		<div className='context-menu-container' 
			  onClick={(e) => handleClick(e)}
			  onBlur={() => props.onBlur()}
		     style={{ display:menuVisible?'block':'none' }}>
			{props.children}
		</div>
	);
}