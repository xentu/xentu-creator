import { useState, useEffect } from 'react';
import Dictionary from '../../main/classes/Dictionary';
import SettingButtons from '../Components/Settings/SettingButtons';
import { useTranslation } from "react-i18next";
import ListBox from '../Components/ListBox';


type ComponentProps = {
	onClose: Function
}


export default function PickImageDialog(props: ComponentProps) {
	const [files, setFiles] = useState([]);
	const [file, setFile] = useState('');
	const { i18n, t } = useTranslation();

	useEffect(() => {
		const fetchFiles = async (cb:Function) => {
			const images = await window.api.listImages();
			cb(images);
		};
		fetchFiles((images:any) => {
			setFiles(images);
			if (images && images.length > 0) {
				setTimeout(() => setFile(images[0]), 50);
			}
		});
	}, []);

	const onSubmit = () => {
		props.onClose(file);
	};
	
	return (
		<div className={'dialog pick-image-dialog'}>
			<div className={`settings-dialog`} style={{width:'400px'}}>
				<div className="dialog-main">
					<div className="dialog-page" style={{display:'block', height:'100%'}}>
						
						<h2>Pick Image Source</h2>

						<ListBox items={files} value={file} onSelect={setFile} />

						<SettingButtons onSubmit={onSubmit} onCancel={() => props.onClose(null)} />

					</div>
				</div>

			</div>
			<a className="dialog-close" onClick={e => props.onClose(null)}><span className="icon-cancel"></span></a>
		</div>
	);
}