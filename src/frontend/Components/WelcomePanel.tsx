import React from 'react';
import Logo from "./Logo";

type WelcomePanelProps = {
	visible: boolean
}

export default function WelcomePanel({ visible }: WelcomePanelProps) {
	const c_visible = visible ? '' : 'hidden';
	return (
		<div className={`welcome-panel columns ${c_visible}`}>

			<div className="welcome-panel-left column">
				<div className="welcome-panel-inner">
					<div>
						<Logo src="/images/xentu-logo.png" size={128} />
						<h1>Xentu Creator</h1>
						<span>Version 0.0.6</span>
					</div>
					<div className="buttons">
						<a className="button">New Game</a>
						<a className="button">Open Project...</a>
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
							<li><a href="#">Hello World</a></li>
						</ul>
					</div>
				</div>
			</div>

		</div>
	);
}