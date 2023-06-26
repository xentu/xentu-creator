import { useContext, useEffect, useState } from 'react';
import { SettingsContext } from '../Context/SettingsManager';
import Logo from "./Logo";


type WelcomePanelProps = {
	visible: boolean
}


declare global {
	interface Window {
	  api?: any;
	}
}


export default function WelcomePanel({ visible }: WelcomePanelProps) {
	const settings = useContext(SettingsContext);

	const openRecent = (path:string) => {
		window.api.openFolderAt(path);
	};

	const listRecentProjects = () => {
		const result = [];

		for (var i=0; i<settings.recentProjects.length; i++) {
			const entry = settings.recentProjects[i];
			const parts = entry.split('|');
			result.push(
				<li key={'recent'+i}>
					<a href="#" title={parts[1]} onClick={() => openRecent(parts[1])}>{parts[0]}</a>
				</li>);
		}
		
		return result;
	};

	const c_visible = visible ? '' : 'is-hidden';

	return (
		<div className={`welcome-panel columns ${c_visible}`}>

			<div className="welcome-panel-left column">
				<div className="welcome-panel-inner">
					<div>
						<Logo src="../images/xentu-logo.png" size={128} />
						<h1>Xentu Creator</h1>
						<span>Version 0.0.6</span>
					</div>
					<div className="buttons">
						<a className="button" onClick={() => window.api.newGame()}>New Game</a>
						<a className="button" onClick={() => window.api.openFolder()}>Open Project...</a>
					</div>
				</div>
			</div>

			<div className="welcome-panel-right column">
				<div className="welcome-panel-inner">
					<div>
						<h3>Help &amp; Resources</h3>
						<ul>
							<li><a href="#">Xentu Website</a></li>
							<li><a href="#">Documentation</a></li>
							<li><a href="#">Release Notes</a></li>
						</ul>
					</div>
					<div>
						<h3>Recent Projects</h3>
						<ul>
							{listRecentProjects()}
						</ul>
					</div>
				</div>
			</div>

		</div>
	);
}