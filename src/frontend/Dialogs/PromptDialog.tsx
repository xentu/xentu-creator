import { useState } from 'react';
import { useTranslation } from "react-i18next";


type ComponentProps = {
	message: string,
	defaultText: string,
	onClose: Function
}


export default function PromptDialog(props: ComponentProps) {
	const [data, setData] = useState(props.defaultText);
	const { i18n, t } = useTranslation();
	
	return (
		<div className={'dialog pick-image-dialog prompt-dialog'}>
			<div className={`settings-dialog`} style={{width:'400px'}}>
				<div className="dialog-main">
					<div className="dialog-page" style={{display:'block', height:'100%'}}>
						
						<div style={{padding: '0 0 20px 0'}}>{props.message}</div>

						<input className="input" type="text" value={data}
								 style={{margin: '20px 0',	width: 'calc(100% - 40px)'}}
								 onChange={(e:any) => setData(e.target.value)} />

						<div className="setting setting-buttons">
							<div className="setting-left">
								<div>&nbsp;</div>
								<small>&nbsp;</small>
							</div>
							<div className="setting-right">
								<div className="buttons">
									<a className="button primary" onClick={() => props.onClose(data)}>OK</a>
									<a className="button" onClick={() => props.onClose(null)}>Cancel</a>
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