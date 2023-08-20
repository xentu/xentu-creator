import { useState, useEffect } from 'react';
import NewMenuItem, { NewMenuEntry } from './NewMenuItem';
import { useTranslation } from "react-i18next";
import { classList } from '../helpers';
//import { SettingsContext } from '../Context/SettingsManager';


declare global {
	interface Window {
	  api?: any;
	  findEditor: Function
	}
}


type MainMenuProps = {
	enabled: boolean,
	canSave: boolean,
	debugging: boolean,
	showSidebar: boolean,
	showStatus: boolean,
	showConsole: boolean,
	showThemeEditor: boolean
}


export default function NewMainMenu(props: MainMenuProps) {
	const [selected, setSelected] = useState('');
	const c_active = props.enabled ? '' : ' is-disabled';
	const { i18n, t } = useTranslation();
	const [fileIndex, setFileIndex] = useState(-1);
	const [editIndex, setEditIndex] = useState(-1);
	const [runIndex, setRunIndex] = useState(-1);
	const [viewIndex, setViewIndex] = useState(-1);
	const [toolsIndex, setToolsIndex] = useState(-1);
	const [helpIndex, setHelpIndex] = useState(-1);
	//const settings = useContext(SettingsContext);
	const menuIDs = [
		'file', 'edit', 'run', 'view', 'tools', 'help'
	];

	const onDropDown = (e:any, menuName:string) => {
		setSelected(menuName);
		e.preventDefault();
		e.stopPropagation();
	};

	const onItemClick = (e:any, menuName:string) => {
		switch (menuName) {
			case 'new_game': window.api.newGame(); break;
			case 'open_game': window.api.openFolder(); break;
			case 'close_game': window.api.menuCloseProject(); break;
			case 'save': window.api.menuSave(); break;
			case 'save_copy': window.api.menuSaveCopy(); break;
			case 'save_all': window.api.menuSaveAll(); break;
			case 'game_properties': window.api.menuGameProperties(); break;
			case 'reveal_in_explorer': window.api.menuReveal(); break;
			case 'export': window.api.menuExport(); break;
			case 'exit': window.api.menuExit(); break;
			case 'undo': window.api.menuUndo(); break;
			case 'redo': window.api.menuRedo(); break;
			case 'cut': window.api.menuCut(); break;
			case 'copy': window.api.menuCopy(); break;
			case 'paste': window.api.menuPaste(); break;
			case 'delete': window.api.menuDelete(); break;
			case 'select_all': window.api.menuSelectAll(); break;
			case 'start_game': !props.debugging && window.api.menuRun(); break;
			case 'start_without_debugging': !props.debugging && window.api.menuRunWithoutDebug(); break;
			case 'stop': props.debugging && window.api.menuStop(); break;
			case 'sidebar': window.api.menuSidebar(); break;
			case 'status_bar': window.api.menuStatusBar(); break;
			case 'console': window.api.menuConsole(); break;
			case 'theme_editor': window.api.menuThemeEditor(); break;
			case 'actual_size': window.api.menuActualSize(); break;
			case 'zoom_in': window.api.menuZoomIn(); break;
			case 'zoom_out': window.api.menuZoomOut(); break;
			case 'show_devtools': window.api.menuDevTools(); break;
			case 'toggle_fullscreen': window.api.menuFullScreen(); break;
			case 'options': window.api.menuOptions(); break;
			case 'clear_console': window.api.menuClearConsole(); break;
			case 'learn_more': window.api.menuHelp(); break;
			default:
				console.log([e, menuName]);
				break;
		}
	};

	const onMenuItemHover = (e:any, menuName:string) => {
		if (selected !== '' && selected !== menuName) {
			setSelected(menuName);
		}
	}

	const deselect = (e: any) => {
		if (selected == '') return;
		setSelected('');
	};

	const onKeyUp = (e: any) => {
		if (e.key == 'Escape') deselect(e);
	};

	const incMenu = (menuName:string) => {
		let max = document.querySelectorAll('.menu-item[data-name="'+menuName+'"] > .menu-sub > .menu-entry').length;
		switch (menuName) {
			case 'file': setFileIndex(fileIndex < max - 1 ? fileIndex + 1 : 0); break;
			case 'edit': setEditIndex(editIndex < max - 1 ? editIndex + 1 : 0); break;
			case 'run': setRunIndex(runIndex < max - 1 ? runIndex + 1 : 0); break;
			case 'view': setViewIndex(viewIndex < max - 1 ? viewIndex + 1 : 0); break;
			case 'tools': setToolsIndex(toolsIndex < max - 1 ? toolsIndex + 1 : 0); break;
			case 'help': setHelpIndex(helpIndex < max - 1 ? helpIndex + 1 : 0); break;
		}
	};

	const decMenu = (menuName:string) => {
		let max = document.querySelectorAll('.menu-item[data-name="'+menuName+'"] > .menu-sub > .menu-entry').length;
		switch (menuName) {
			case 'file': setFileIndex(fileIndex > 0 ? fileIndex - 1 : max - 1); break;
			case 'edit': setEditIndex(editIndex > 0 ? editIndex - 1 : max - 1); break;
			case 'run': setRunIndex(runIndex > 0 ? runIndex - 1 : max - 1); break;
			case 'view': setViewIndex(viewIndex > 0 ? viewIndex - 1 : max - 1); break;
			case 'tools': setToolsIndex(toolsIndex > 0 ? toolsIndex - 1 : max - 1); break;
			case 'help': setHelpIndex(helpIndex > 0 ? helpIndex - 1 : max - 1); break;
		}
	};

	const onKeyDown = (e: any) => {
		if (e.key == 'ArrowRight') {
			if (selected !== '') {
				const index = menuIDs.indexOf(selected);
				const next = index < menuIDs.length - 1 ? menuIDs[index+1] : menuIDs[0];
				setSelected(next);
			}
		}
		else if (e.key == 'ArrowLeft') {
			if (selected !== '') {
				const index = menuIDs.indexOf(selected);
				const next = index > 0 ? menuIDs[index - 1] : menuIDs[menuIDs.length - 1];
				setSelected(next);
			}
		}
		else if (e.key == 'ArrowDown') {
			incMenu(selected);
		}
		else if (e.key == 'ArrowUp') {
			decMenu(selected);
		}
	}

	const findMnemonics = () : Array<string> => {
		const result = new Array<string>();
		document.querySelectorAll('.menu-item > .menu-label .nemonic').forEach( (e:HTMLElement) => {
			result.push(e.innerText);
		});
		return result;
	}

	const findMnemonicMenu = (mnemonic:string) : HTMLElement|null => {
		var result:any = null;
		document.querySelectorAll('.menu-item > .menu-label .nemonic').forEach( (e:HTMLElement) => {
			if (e.innerText.toLowerCase() == mnemonic) {
				result = e.parentElement.parentElement;
			}
		});
		return result;
	}

	useEffect(() => {
		window.onkeyup = (e:KeyboardEvent) => {
			if (e.altKey) {
				const menu = findMnemonicMenu(e.key.toLowerCase());
				if (menu) {
					document.getElementById('main-menu').focus();
					setSelected(menu.dataset['name']);
				}
			}
			if (e.key == 'Escape') {
				deselect(e);
			}
			if (e.key == 'Enter') {
				const menu = document.querySelector("#main-menu > .menu-item.is-active") as HTMLElement;
				const index = menu.dataset['index'];
				const items = [].slice.call(menu.querySelectorAll(":scope > .menu-sub > .menu-entry"));
				items[index].click();
			}
		};
	}, []);

	useEffect(() => {
		switch (selected) {
			case 'file': setFileIndex(0); break;
			case 'edit': setEditIndex(0); break;
			case 'run': setRunIndex(0); break;
			case 'view': setViewIndex(0); break;
			case 'tools': setToolsIndex(0); break;
			case 'help': setHelpIndex(0); break;
		}
	}, [selected]);

	return (
		<>
			<div id="menu-back-target" style={{ display:selected!=''?'block':'none' }}></div>
			<div id="main-menu" tabIndex={0} onBlur={deselect} onClick={deselect} onKeyUp={onKeyUp} onKeyDown={onKeyDown}>

				<NewMenuItem name="file" click={onDropDown} mouseOver={onMenuItemHover} active={selected} hoverIndex={fileIndex} disabled={false}>
					<NewMenuEntry click={onItemClick} name="new_game" hotKey='Ctrl+N' />
					<NewMenuEntry click={onItemClick} name="open_game" hotKey='Ctrl+O' />
					<hr />
					<NewMenuEntry click={onItemClick} name="close_game" disabled={!props.enabled} />
					<NewMenuEntry click={onItemClick} name="save" hotKey='Ctrl+S' disabled={!props.enabled || !props.canSave} />
					<NewMenuEntry click={onItemClick} name="save_copy" hotKey='Ctrl+Shift+A' disabled={!props.enabled || !props.canSave} />
					<NewMenuEntry click={onItemClick} name="save_all" hotKey='Ctrl+Shift+S' disabled={!props.enabled || !props.canSave} />
					<hr />
					<NewMenuEntry click={onItemClick} name="game_properties" disabled={!props.enabled} />
					<NewMenuEntry click={onItemClick} name="reveal_in_explorer" disabled={!props.enabled} />
					<NewMenuEntry click={onItemClick} name="export" disabled={!props.enabled} />
					<hr />
					<NewMenuEntry click={onItemClick} name="exit" hotKey='Alt+F4' />
				</NewMenuItem>

				<NewMenuItem name="edit" click={onDropDown} mouseOver={onMenuItemHover} active={selected} hoverIndex={editIndex} disabled={!props.enabled}>
					<NewMenuEntry click={onItemClick} name="undo" hotKey='Ctrl+Z' />
					<NewMenuEntry click={onItemClick} name="redo" />
					<NewMenuEntry click={onItemClick} name="cut" hotKey='Ctrl+X' />
					<NewMenuEntry click={onItemClick} name="copy" hotKey='Ctrl+C' />
					<NewMenuEntry click={onItemClick} name="paste" hotKey='Ctrl+V' />
					<hr />
					<NewMenuEntry click={onItemClick} name="delete" hotKey='Del' />
					<NewMenuEntry click={onItemClick} name="select_all" hotKey='Ctrl+A' />
				</NewMenuItem>

				<NewMenuItem name="run" click={onDropDown} mouseOver={onMenuItemHover} disabled={!props.enabled} active={selected} hoverIndex={runIndex}>
					<NewMenuEntry click={onItemClick} name="start_game" disabled={props.debugging} hotKey='F5' />
					<NewMenuEntry click={onItemClick} name="start_without_debugging" disabled={props.debugging} hotKey='F6' />
					<NewMenuEntry click={onItemClick} name="stop" disabled={!props.debugging} />
				</NewMenuItem>

				<NewMenuItem name="view" click={onDropDown} mouseOver={onMenuItemHover} active={selected} hoverIndex={viewIndex}>
					<NewMenuEntry click={onItemClick} name="sidebar" hotKey='Ctrl+B' checked={props.showSidebar} disabled={!props.enabled} />
					<NewMenuEntry click={onItemClick} name="status_bar" hotKey='Ctrl+Shift+B' checked={props.showStatus} disabled={!props.enabled} />
					<NewMenuEntry click={onItemClick} name="console" hotKey='Ctrl+Shift+C' checked={props.showConsole} disabled={!props.enabled} />
					<NewMenuEntry click={onItemClick} name="theme_editor" hotKey='Ctrl+Shift+D' checked={props.showThemeEditor} />
					<hr />
					<NewMenuEntry click={onItemClick} name="actual_size" />
					<NewMenuEntry click={onItemClick} name="zoom_in" />
					<NewMenuEntry click={onItemClick} name="zoom_out" />
					<hr />
					<NewMenuEntry click={onItemClick} name="show_devtools" />
					<NewMenuEntry click={onItemClick} name="toggle_fullscreen" hotKey='F11' />
				</NewMenuItem>

				<NewMenuItem name="tools" click={onDropDown} mouseOver={onMenuItemHover} active={selected} hoverIndex={toolsIndex}>
					<NewMenuEntry click={onItemClick} name="options" hotKey='F8' />
					<NewMenuEntry click={onItemClick} name="clear_console" disabled={!props.enabled} />
				</NewMenuItem>

				<NewMenuItem name="help" click={onDropDown} mouseOver={onMenuItemHover} active={selected} hoverIndex={helpIndex}>
					<NewMenuEntry click={onItemClick} name="learn_more" hotKey='F1' />
				</NewMenuItem>


				<div className="buttons" style={{ flexGrow: 1, textAlign: 'right', display: props.enabled?'block':'none' }}>
					<div style={{display: 'inline-block'}}>
						<a className="menu-item" title={t('console')} onClick={() => window.api.menuConsole()}>
							<span className="menu-label"><i className="icon-terminal" /></span>
						</a>
						<a className="menu-item" title={t('config_game')} onClick={() => window.api.menuGameProperties()}>
							<span className="menu-label"><i className='icon-cog' /></span>
						</a>
						<a className={classList(["menu-item", props.debugging?'':'is-disabled'])} title={t('stop_game')} onClick={() => props.debugging && window.api.menuStop()}>
							<span className="menu-label is-red"><i className='icon-stop' /> {t('stop')}</span>
						</a>
						<a className={classList(["menu-item", props.debugging?'is-disabled':''])} title={t('start_game')} onClick={() => !props.debugging && window.api.menuRun()}>
							<span className="menu-label is-green"><i className='icon-play' /> {t('start')}</span>
						</a>
					</div>
				</div>


			</div>
		</>
	);
}