import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { getFileNameInfo } from '../helpers';

type ComponentProps = {
	data: any,
	onClose: Function
}


export default function ConvoOptionDialog(props: ComponentProps) {
	const [data, setData] = useState(props.data);
	const { i18n, t } = useTranslation();

	const setTarget = (newTarget:string) => {
		const clone = {...data};
		clone.target = newTarget;
		setData(clone);
	};
	
	return (
		<div className={'dialog pick-image-dialog prompt-dialog'}>
			<div className={`settings-dialog`} style={{width:'400px'}}>
				<div className="dialog-main">
					<div className="dialog-page" style={{display:'block', height:'100%'}}>
						
						<div style={{padding: '0 0 20px 0'}}>Change Option Target</div>

						<input className="input" type="text" value={data.target}
								 style={{margin: '20px 0',	width: 'calc(100% - 40px)'}}
								 onChange={(e:any) => setTarget(e.target.value)} />

						<div className="setting setting-buttons">
							<div className="setting-left">
								<div>&nbsp;</div>
								<small>&nbsp;</small>
							</div>
							<div className="setting-right">
								<div className="buttons">
									<a className="button primary" onClick={() => props.onClose(data)}>Rename</a>
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