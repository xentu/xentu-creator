import React, { useState } from 'react';

type SettingsDialogProps = {
	
}

declare global {
	interface Window {
	  api?: any;
	}
}

export default function SettingsDialog({  }: SettingsDialogProps) {
	const [page, setPage] = useState(0);

	const renderTestData = (str:string) => {
		const res = [];
		for (var i=0; i<50; i++) {
			res.push(<div>{str}</div>);
		}
		return res;
	}

	return (
		<div className={`settings-dialog`}>
			<div className="settings-sidebar">
				
				<div>
					<h2>Options</h2>
					<ul>
						<li data-index="0" onClick={() => setPage(0)} className={page==0?'is-active':''}>Editor</li>
						<li data-index="1" onClick={() => setPage(1)} className={page==1?'is-active':''}>Debug</li>
						<li data-index="2" onClick={() => setPage(2)} className={page==2?'is-active':''}>Binaries</li>
					</ul>
				</div>
				
			</div>
			<div className="settings-main">
				<div className="settings-page" style={{display:page==0?'block':'none'}}>
					{renderTestData('a')}
				</div>
				<div className="settings-page" style={{display:page==1?'block':'none'}}>
					{renderTestData('b')}
				</div>
				<div className="settings-page" style={{display:page==2?'block':'none'}}>
					{renderTestData('c')}
				</div>
			</div>
		</div>
	);
}