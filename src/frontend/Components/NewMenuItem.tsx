import { useTranslation } from "react-i18next";


type NewMenuItemProps = {
	name: string,
	disabled?: boolean,
	active: string,
	hoverIndex?: number,
	click?: any,
	children?: string | JSX.Element | JSX.Element[]
}


type NewMenuEntryProps = {
	name: string,
	hotKey?: string,
	disabled?: boolean,
	checked?: boolean,
	click?: Function
}


export default function NewMenuItem(props: NewMenuItemProps) {
	const { t } = useTranslation();
	const c_active = props.active == props.name ? 'is-active' : '';
	const c_disabled = props.disabled ? 'is-disabled' : '';

	const label = t(props.name);
	const mnemonic = label[0];
	const label2 = label.substring(1);

	const triggerMenu = (e:any) => {
		props.click(e, props.name);
	}

	return (
		<div className={["menu-item", c_active, c_disabled].join(' ').trim()} data-name={props.name} data-index={props.hoverIndex ?? -1}>
			<a className="menu-label" onClick={triggerMenu}>
				<span className="nemonic">{mnemonic}</span>
				<span>{label2}</span>
			</a>
			<div className="menu-sub">{props.children}</div>
		</div>
	);
}


export function NewMenuEntry(props: NewMenuEntryProps) {
	const { t } = useTranslation();
	const c_disabled = props.disabled ? 'is-disabled' : '';
	const c_checked = props.checked ? 'is-checked' : '';

	const triggerMenu = (e:any) => {
		props.click(e, props.name);
	}

	return (
		<div className={["menu-entry", c_disabled, c_checked].join(' ')} onClick={(e) => { 
			if (!props.disabled && typeof props.click !== 'undefined') triggerMenu(e);
			}}>
			<a className="menu-entry-label">
				<span><i className="icon-ok"></i></span>
				<span>{t(props.name)}</span>
				<span className="menu-hotkey">{props.hotKey}</span>
			</a>
		</div>
	);
}