import { useState, useEffect } from 'react';
import MenuItem, { MenuEntry } from './MenuItem';
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
	setFileCreator: Function
	setFileCreatorOpt: Function,
	setFileCreatorExt: Function
}


export default function MainMenu(props: MainMenuProps) {
	const [selected, setSelected] = useState('');
	const c_active = props.enabled ? '' : ' is-disabled';
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

	const showCreator = (folder:boolean, extension?:string) => {
		console.log('show file creator ');
		props.setFileCreatorOpt(folder);
		props.setFileCreatorExt(extension);
		props.setFileCreator('');
	}

	return (
		<>
			<div id="menu-back-target" style={{ display:selected!=''?'block':'none' }}></div>
			<div id="main-menu" tabIndex={0} 
						onBlur={() => setSelected('')} 
						onClick={(e:any) => deselect(e)}
						onKeyUp={(e:any) => kbDeselect(e)}>

				<MenuItem label='File' click={() => setSelected('file')} active={selected=='file'}>
					<MenuEntry click2={(e:any) => deselect(e)} label='New Game' hotKey='Ctrl+N' click={() => window.api.newGame()} />
					<MenuEntry click2={(e:any) => deselect(e)} label='Open Game...' hotKey='Ctrl+O' click={() => window.api.openFolder()} />
					<hr />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={!props.enabled} label='Close Project' click={(() => window.api.menuCloseProject())} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={!props.enabled || !props.canSave} label='Save' hotKey='Ctrl+S' click={() => window.api.menuSave()} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={!props.enabled || !props.canSave} label='Save Copy...' hotKey='Ctrl+Shift+A' click={() => window.api.menuSaveCopy()} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={!props.enabled || !props.canSave} label='Save All' hotKey='Ctrl+Shift+S' click={() => window.api.menuSaveAll()} />
					<hr />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={!props.enabled} label='Game Properties' click={() => window.api.menuGameProperties()} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={!props.enabled} label='Reveal In Explorer' click={() => window.api.menuReveal()} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={!props.enabled} label='Export...' click={() => window.api.menuExport()} />
					<hr />
					<MenuEntry click2={(e:any) => deselect(e)} label='Exit' hotKey='Alt+F4' click={() => window.api.menuExit()} />
				</MenuItem>
				<MenuItem label='Edit' disabled={!props.enabled} click={() => setSelected('edit')} active={selected=='edit'}>
					<MenuEntry click2={() => setSelected('')} label='Undo' hotKey='Ctrl+Z' click={() => window.api.menuUndo()} />
					<MenuEntry click2={() => setSelected('')} label='Redo' click={() => window.api.menuRedo()} />
					<MenuEntry click2={() => setSelected('')} label='Cut' hotKey='Ctrl+X' click={() => window.api.menuCut()} />
					<MenuEntry click2={() => setSelected('')} label='Copy' hotKey='Ctrl+C' click={() => window.api.menuCopy()} />
					<MenuEntry click2={() => setSelected('')} label='Paste' hotKey='Ctrl+V' click={() => window.api.menuPaste()} />
					<hr />
					<MenuEntry click2={() => setSelected('')} label='Delete' hotKey='Del' click={() => window.api.menuDelete()} />
					<MenuEntry click2={() => setSelected('')} label='Select All' hotKey='Ctrl+A' click={() => window.api.menuSelectAll()} />
				</MenuItem>
				<MenuItem label='Assets' click={() => setSelected('assets')} disabled={!props.enabled} active={selected=='assets'}>
					<MenuEntry click2={(e:any) => deselect(e)} disabled={false} label="New Code File..." click={() => showCreator(false)} />
					<hr />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={false} label="New Conversation..." click={() => showCreator(false, '.xcf')} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={false} label="New Database..." click={() => showCreator(false, '.xdf')} />
					<hr />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={false} label="New Layout..." click={() => showCreator(false, '.xlf')} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={false} label="New Graphic..." click={() => showCreator(false, '.xgf')} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={false} label="New Sprite Sheet..." click={() => showCreator(false, '.xsf')} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={false} label="New Sprite Font..." click={() => showCreator(false, '.xff')} />
				</MenuItem>
				<MenuItem label='Run' disabled={!props.enabled} click={() => setSelected('run')} active={selected=='run'}>
					<MenuEntry click2={(e:any) => deselect(e)} disabled={props.debugging} label='Start Game' hotKey='F5' click={() => !props.debugging && window.api.menuRun()} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={props.debugging} label='Start Without Debugging' hotKey='F6' click={() => !props.debugging && window.api.menuRunWithoutDebug()} />
					<MenuEntry click2={(e:any) => deselect(e)} disabled={!props.debugging} label='Stop' click={() => props.debugging && window.api.menuStop()} />
				</MenuItem>
				<MenuItem label='View' click={() => setSelected('view')} active={selected=='view'}>
					<MenuEntry click2={(e:any) => deselect(e)} label='Sidebar' hotKey='Ctrl+B' click={() => window.api.menuSidebar()} checked={props.showSidebar} disabled={!props.enabled} />
					<MenuEntry click2={(e:any) => deselect(e)} label='Status Bar' hotKey='Ctrl+Shift+B' click={() => window.api.menuStatusBar()} checked={props.showStatus} disabled={!props.enabled} />
					<MenuEntry click2={(e:any) => deselect(e)} label='Console' hotKey='Ctrl+Shift+C' click={() => window.api.menuConsole()} checked={props.showConsole} disabled={!props.enabled} />
					<MenuEntry click2={(e:any) => deselect(e)} label='Theme Editor' hotKey='Ctrl+Shift+D' click={() => window.api.menuThemeEditor()} checked={props.showThemeEditor} />
					<hr />
					<MenuEntry click2={(e:any) => deselect(e)} label='Actual Size' click={() => window.api.menuActualSize()} />
					<MenuEntry click2={(e:any) => deselect(e)} label='Zoom In' click={() => window.api.menuZoomIn()} />
					<MenuEntry click2={(e:any) => deselect(e)} label='Zoom Out' click={() => window.api.menuZoomOut()} />
					<hr />
					<MenuEntry click2={(e:any) => deselect(e)} label='Show DevTools' click={() => window.api.menuDevTools()} />
					<MenuEntry click2={(e:any) => deselect(e)} label='Toggle FullScreen' hotKey='F11' click={() => window.api.menuFullScreen()} />
				</MenuItem>
				<MenuItem label='Tools' click={() => setSelected('tools')} active={selected=='tools'}>
					<MenuEntry click2={(e:any) => deselect(e)} label='Options' hotKey='F8' click={() => window.api.menuOptions()} />
					<MenuEntry disabled={!props.enabled} click2={() => setSelected('')} label='Clear Console' click={() => window.api.menuClearConsole()} />
				</MenuItem>
				<MenuItem label='Help' click={() => setSelected('help')} active={selected=='help'}>
					<MenuEntry click2={() => setSelected('')} label='Learn More' hotKey='F1' click={() => window.api.menuHelp()} />
				</MenuItem>

				<div className="buttons" style={{ flexGrow: 1, textAlign: 'right', display: props.enabled?'block':'none' }}>
					<div style={{display: 'inline-block'}}>
						<a className={["menu-item"].join(' ')} title="Config Game" onClick={() => window.api.menuGameProperties()}>
							<span className="menu-label"><i className='icon-cog'></i> Config</span>
						</a>
						<a className={["menu-item", props.debugging?'':'is-disabled'].join(' ')} title="Stop Game" onClick={() => props.debugging && window.api.menuStop()}>
							<span className="menu-label is-red"><i className='icon-stop'></i> Stop</span>
						</a>
						<a className={["menu-item", props.debugging?'is-disabled':''].join(' ')} title="Start Game" onClick={() => !props.debugging && window.api.menuRun()}>
							<span className="menu-label is-green"><i className='icon-play'></i> Play</span>
						</a>
					</div>
				</div>

			</div>
		</>
	);
}