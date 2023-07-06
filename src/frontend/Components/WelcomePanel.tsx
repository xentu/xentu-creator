import { useContext, useEffect, useState } from 'react';
import { SettingsContext } from '../Context/SettingsManager';
import { useTranslation } from "react-i18next";
import Logo from "./Logo";


type WelcomePanelProps = {
	visible: boolean,
	removeRecent: Function
}


declare global {
	interface Window {
	  api?: any;
	}
}


export default function WelcomePanel(props: WelcomePanelProps) {
	const settings = useContext(SettingsContext);
	const { i18n, t } = useTranslation();

	const openRecent = async (path:string) => {
		const opened = await window.api.openFolderAt(path);
		if (!opened) {
			props.removeRecent(path);
			console.log('removed recent path.');
		}
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

	const c_visible = props.visible ? '' : 'is-hidden';

	return (
		<div className={`welcome-panel columns ${c_visible}`}>

			<div className="welcome-panel-left column">
				<div className="welcome-panel-inner">
					<div>
						<Logo src="../images/xentu-logo.png" size={128} />
						<h1>Xentu Creator</h1>
						<span>{t('version')} 0.0.6</span>
					</div>
					<div className="buttons">
						<a className="button" onClick={() => window.api.newGame()}>{t('new_game')}</a>
						<a className="button" onClick={() => window.api.openFolder()}>{t('open_game')}</a>
					</div>
				</div>
			</div>

			<div className="welcome-panel-right column">
				<div className="welcome-panel-inner">
					<div>
						<h3>{t('help_and_resources')}</h3>
						<ul>
							<li><a href="#" onClick={() => window.api.navigateTo('https://xentu.net')}>Xentu {t('website')}</a></li>
							<li><a href="#" onClick={() => window.api.navigateTo('https://docs.xentu.net')}>{t('documentation')}</a></li>
						</ul>
					</div>
					<div>
						<h3>{t('recent_projects')}</h3>
						<ul>
							{listRecentProjects()}
						</ul>
					</div>
				</div>
			</div>

		</div>
	);
}