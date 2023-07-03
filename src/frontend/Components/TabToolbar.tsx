import { useContext, PropsWithChildren } from 'react';
import { SettingsContext } from '../Context/SettingsManager';


type TabToolbarProps = {
	isVertical?: boolean
};


export default function TabToolbar(props: PropsWithChildren<TabToolbarProps>) {
	const settings = useContext(SettingsContext);

	return (
		<div className={['toolbar', props.isVertical?'vertical':''].join(' ')}>
			{!props.children && <div className="toolbar-group">
				<a className="toolbar-button"><i className='icon-stop'></i></a>
				<a className="toolbar-button"><i className='icon-stop'></i></a>
				<a className="toolbar-button"><i className='icon-stop'></i></a>
				<a className="toolbar-button"><i className='icon-stop'></i></a>
				<a className="toolbar-button"><i className='icon-stop'></i></a>
				<a className="toolbar-button"><i className='icon-stop'></i></a>
			</div>}
			{props.children}
		</div>
	);
}