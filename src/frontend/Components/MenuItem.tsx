type MenuItemProps = {
	label: string,
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
	click2?: Function
}


export default function MenuItem({ label, active, click, children }: MenuItemProps) {
	const c_active = active ? 'is-active' : '';
	return (
		<div className={["menu-item", c_active].join(' ')}>
			<a className="menu-label" onClick={(e) => click(e)}>{label}</a>
			<div className="menu-sub">{children}</div>
		</div>
	);
}


export function MenuEntry({label, hotKey, disabled, checked, click, click2 }: MenuEntryProps) {
	const c_disabled = disabled ? 'is-disabled' : '';
	const c_checked = checked ? 'is-checked' : '';
	return (
		<div className={["menu-entry", c_disabled, c_checked].join(' ')} onClick={(e) => { 
			if (typeof click !== 'undefined') click(e); 
			if (typeof click2 !== 'undefined') click2(); 
			}}>
			<a className="menu-entry-label">
				<span><i className="icon-ok"></i></span>
				<span>{label}</span>
				<span className="menu-hotkey">{hotKey}</span>
			</a>
		</div>
	);
}