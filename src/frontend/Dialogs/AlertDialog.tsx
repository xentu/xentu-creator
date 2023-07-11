import { useState } from 'react';
import { useTranslation } from "react-i18next";


type ComponentProps = {
	message: string,
	onClose: Function
}


export default function AlertDialog(props: ComponentProps) {
	const { i18n, t } = useTranslation();
	
	return (
		<div className={'dialog pick-image-dialog'}>
			<div className={`settings-dialog`} style={{width:'400px'}}>
				<div className="dialog-main">
					<div className="dialog-page" style={{display:'block', height:'100%'}}>
						
						<h2>Alert</h2>
						<div>{props.message}</div>

						<div className="setting setting-buttons">
							<div className="setting-left">
								<div>&nbsp;</div>
								<small>&nbsp;</small>
							</div>
							<div className="setting-right">
								<div className="buttons">
									<a className="button primary" onClick={() => props.onClose(null)}>OK</a>
								</div>
							</div>
						</div>

					</div>
				</div>

			</div>
			<a className="dialog-close" onClick={e => props.onClose(null)}><span className="icon-cancel"></span></a>
		</div>
	);
}