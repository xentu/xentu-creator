type MenuItemProps = {
	label: string,
	disabled?: boolean,
	active: boolean,
	click?: Function,
	children?: string | JSX.Element | JSX.Element[]
}


type MenuEntryProps = {
	label: string,
	hotKey?: string,
	disabled?: boolean,
	checked?: boolean,
	click?: Function,
	click2?: any
}


export default function MenuItem(props: MenuItemProps) {
	const c_active = props.active && !props.disabled ? 'is-active' : '';
	const c_disabled = props.disabled ? 'is-disabled' : '';
	return (
		<div className={["menu-item", c_active, c_disabled].join(' ')}>
			<a className="menu-label" onClick={(e) => props.click(e)}>{props.label}</a>
			<div className="menu-sub">{props.children}</div>
		</div>
	);
}


export function MenuEntry(props: MenuEntryProps) {
	const c_disabled = props.disabled ? 'is-disabled' : '';
	const c_checked = props.checked ? 'is-checked' : '';
	return (
		<div className={["menu-entry", c_disabled, c_checked].join(' ')} onClick={(e) => { 
			if (!props.disabled && typeof props.click !== 'undefined') props.click(e); 
			if (!props.disabled && typeof props.click2 !== 'undefined') props.click2(e); 
			}}>
			<a className="menu-entry-label">
				<span><i className="icon-ok"></i></span>
				<span>{props.label}</span>
				<span className="menu-hotkey">{props.hotKey}</span>
			</a>
		</div>
	);
}