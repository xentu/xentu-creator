import { useTranslation } from "react-i18next";


type NewMenuItemProps = {
	name: string,
	disabled?: boolean,
	active: string,
	hoverIndex?: number,
	click?: any,
	mouseOver?: Function,
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

	const triggerHover = (e:any) => {
		props.mouseOver(e, props.name);
	}

	return (
		<div className={["menu-item", c_active, c_disabled].join(' ').trim()} data-name={props.name} data-index={props.hoverIndex ?? -1} onMouseEnter={triggerHover}>
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
		if (!props.disabled && typeof props.click !== 'undefined') {
			props.click(e, props.name);
		}
	}

	const hoverMenu = (e:any) => {
		const subElement = e.target.parentElement;
		const menuElement = subElement.parentElement;
		const items = [].slice.call(subElement.querySelectorAll(':scope > .menu-entry'));
		const index = items.indexOf(e.target);
		menuElement.setAttribute('data-index', index);
		//props.mouseOver(e, props.name);
	}

	return (
		<div className={["menu-entry", c_disabled, c_checked].join(' ')} onClick={triggerMenu} onMouseEnter={hoverMenu}>
			<a className="menu-entry-label">
				<span><i className="icon-ok"></i></span>
				<span>{t(props.name)}</span>
				<span className="menu-hotkey">{props.hotKey}</span>
			</a>
		</div>
	);
}