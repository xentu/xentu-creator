import { useState, useEffect } from 'react';
import MenuItem, { MenuEntry } from './MenuItem';
import { useTranslation } from "react-i18next";
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


export default function MainMenu(props: MainMenuProps) {
	const [selected, setSelected] = useState('');
	const c_active = props.enabled ? '' : ' is-disabled';
	const { i18n, t } = useTranslation();
	//const settings = useContext(SettingsContext);

	useEffect(() => {
		document.onkeyup = (e:KeyboardEvent) => {
			if (e.key == 'Escape') {
				setSelected('');
			}
		};
	}, []);

	const deselect = (e: Event) => {
		if (selected == '') return;
		setSelected('');
	};

	const kbDeselect = (e: KeyboardEvent) => {
		if (e.key == 'Escape') deselect(e);
	};

	return (
		<>
			<div id="menu-back-target" style={{ display:selected!=''?'block':'none' }}></div>
			<div id="main-menu" tabIndex={0} 
						onBlur={() => setSelected('')} 
						onClick={(e:any) => deselect(e)}
						onKeyUp={(e:any) => kbDeselect(e)}>

				<MenuItem label={t('file')} click={() => setSelected('file')} active={selected=='file'}>
					<MenuEntry click2={(e:any) => deselect(e)} label={t('new_game')} hotKey='Ctrl+N' click={() => window.api.newGame()} />
					<MenuEntry click2={(e:any) => deselect(e)} label={t('open_game')} hotKey='Ctrl+O' click={() => window.api.openFolder()} />
					<hr />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={!props.enabled} label={t('close_game')} click={(() => window.api.menuCloseProject())} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={!props.enabled || !props.canSave} label={t('save')} hotKey='Ctrl+S' click={() => window.api.menuSave()} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={!props.enabled || !props.canSave} label={t('save_copy')} hotKey='Ctrl+Shift+A' click={() => window.api.menuSaveCopy()} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={!props.enabled || !props.canSave} label={t('save_all')} hotKey='Ctrl+Shift+S' click={() => window.api.menuSaveAll()} />
					<hr />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={!props.enabled} label={t('game_properties')} click={() => window.api.menuGameProperties()} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={!props.enabled} label={t('reveal_in_explorer')} click={() => window.api.menuReveal()} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={!props.enabled} label={t('export')} click={() => window.api.menuExport()} />
					<hr />
					<MenuEntry click2={(e:any) => deselect(e)} label={t('exit')} hotKey='Alt+F4' click={() => window.api.menuExit()} />
				</MenuItem>
				{/* <MenuItem label={t('assets')} click={() => setSelected('assets')} disabled={!props.enabled} active={selected=='assets'}>
					<MenuEntry click2={(e:any) => deselect(e)} disabled={false} label={t('new_file')} click={() => window.api.menuNewFile()} />
				</MenuItem> */}
				<MenuItem label={t('edit')} disabled={!props.enabled} click={() => setSelected('edit')} active={selected=='edit'}>
					<MenuEntry click2={() => setSelected('')} label={t('undo')} hotKey='Ctrl+Z' click={() => window.api.menuUndo()} />
					<MenuEntry click2={() => setSelected('')} label={t('redo')} click={() => window.api.menuRedo()} />
					<MenuEntry click2={() => setSelected('')} label={t('cut')} hotKey='Ctrl+X' click={() => window.api.menuCut()} />
					<MenuEntry click2={() => setSelected('')} label={t('copy')} hotKey='Ctrl+C' click={() => window.api.menuCopy()} />
					<MenuEntry click2={() => setSelected('')} label={t('paste')} hotKey='Ctrl+V' click={() => window.api.menuPaste()} />
					<hr />
					<MenuEntry click2={() => setSelected('')} label={t('delete')} hotKey='Del' click={() => window.api.menuDelete()} />
					<MenuEntry click2={() => setSelected('')} label={t('select_all')} hotKey='Ctrl+A' click={() => window.api.menuSelectAll()} />
				</MenuItem>
				<MenuItem label={t('run')} disabled={!props.enabled} click={() => setSelected('run')} active={selected=='run'}>
					<MenuEntry click2={(e:any) => deselect(e)} disabled={props.debugging} label={t('start_game')} hotKey='F5' click={() => !props.debugging && window.api.menuRun()} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={props.debugging} label={t('start_without_debugging')} hotKey='F6' click={() => !props.debugging && window.api.menuRunWithoutDebug()} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={!props.debugging} label={t('stop')} click={() => props.debugging && window.api.menuStop()} />
				</MenuItem>
				<MenuItem label={t('view')} click={() => setSelected('view')} active={selected=='view'}>
					<MenuEntry click2={(e:any) => deselect(e)} label={t('sidebar')} hotKey='Ctrl+B' click={() => window.api.menuSidebar()} checked={props.showSidebar} disabled={!props.enabled} />
					<MenuEntry click2={(e:any) => deselect(e)} label={t('status_bar')} hotKey='Ctrl+Shift+B' click={() => window.api.menuStatusBar()} checked={props.showStatus} disabled={!props.enabled} />
					<MenuEntry click2={(e:any) => deselect(e)} label={t('console')} hotKey='Ctrl+Shift+C' click={() => window.api.menuConsole()} checked={props.showConsole} disabled={!props.enabled} />
					<MenuEntry click2={(e:any) => deselect(e)} label={t('theme_editor')} hotKey='Ctrl+Shift+D' click={() => window.api.menuThemeEditor()} checked={props.showThemeEditor} />
					<hr />
					<MenuEntry click2={(e:any) => deselect(e)} label={t('actual_size')} click={() => window.api.menuActualSize()} />
					<MenuEntry click2={(e:any) => deselect(e)} label={t('zoom_in')} click={() => window.api.menuZoomIn()} />
					<MenuEntry click2={(e:any) => deselect(e)} label={t('zoom_out')} click={() => window.api.menuZoomOut()} />
					<hr />
					<MenuEntry click2={(e:any) => deselect(e)} label={t('show_devtools')} click={() => window.api.menuDevTools()} />
					<MenuEntry click2={(e:any) => deselect(e)} label={t('toggle_fullscreen')} hotKey='F11' click={() => window.api.menuFullScreen()} />
				</MenuItem>
				<MenuItem label={t('tools')} click={() => setSelected('tools')} active={selected=='tools'}>
					<MenuEntry click2={(e:any) => deselect(e)} label={t('options')} hotKey='F8' click={() => window.api.menuOptions()} />
					<MenuEntry disabled={!props.enabled} click2={() => setSelected('')} label={t('clear_console')} click={() => window.api.menuClearConsole()} />
				</MenuItem>
				<MenuItem label={t('help')} click={() => setSelected('help')} active={selected=='help'}>
					<MenuEntry click2={() => setSelected('')} label={t('learn_more')} hotKey='F1' click={() => window.api.menuHelp()} />
				</MenuItem>

				<div className="buttons" style={{ flexGrow: 1, textAlign: 'right', display: props.enabled?'block':'none' }}>
					<div style={{display: 'inline-block'}}>
						<a className={["menu-item"].join(' ')} title={t('config_game')} onClick={() => window.api.menuGameProperties()}>
							<span className="menu-label"><i className='icon-cog'></i> {t('config')}</span>
						</a>
						<a className={["menu-item", props.debugging?'':'is-disabled'].join(' ')} title={t('stop_game')} onClick={() => props.debugging && window.api.menuStop()}>
							<span className="menu-label is-red"><i className='icon-stop'></i> {t('stop')}</span>
						</a>
						<a className={["menu-item", props.debugging?'is-disabled':''].join(' ')} title={t('start_game')} onClick={() => !props.debugging && window.api.menuRun()}>
							<span className="menu-label is-green"><i className='icon-play'></i> {t('start')}</span>
						</a>
					</div>
				</div>

			</div>
		</>
	);
}