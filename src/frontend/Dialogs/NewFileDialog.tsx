import { useState } from 'react';
import Dictionary from '../../main/classes/Dictionary';
import SettingBool from '../Components/Settings/SettingBoolean';
import SettingButtons from '../Components/Settings/SettingButtons';
import SettingCombo from '../Components/Settings/SettingCombo';
import SettingDualInput from '../Components/Settings/SettingDualInput';
import SettingInput from '../Components/Settings/SettingInput';
import { useTranslation } from "react-i18next";


type ComponentProps = {
	folderFirst: boolean,
	selectedFolder: string,
	projectFolder: string,
	onCancel: Function
}


class NewFileInfo {
	file_name: string = "Untitled";
	file_type: string = "code_js";
	folder: string = "";

	constructor(clone?:NewFileInfo, folderFirst?:boolean) {
		if (clone) {
			this.file_name = clone.file_name;
			this.file_type = clone.file_type;
			this.folder = clone.folder;
		}
		else {
			this.file_type = folderFirst ? 'folder' :  'code_js';
		}
	}
};


export default function NewFileDialog(props: ComponentProps) {
	const [info, setInfo] = useState(new NewFileInfo(null, props.folderFirst));
	const { i18n, t } = useTranslation();

	const codeTypes = new Dictionary<string>();
	const codeLabel = t('_filetype_label_code');

	codeTypes.add('code_js', `${codeLabel} (JavaScript)`);
	codeTypes.add('code_py', `${codeLabel} (Python)`);
	codeTypes.add('code_lua', `${codeLabel} (Lua)`);
	codeTypes.add('conversation', t('_filetype_label_conversation'));
	codeTypes.add('layout', t('_filetype_label_layout'));
	codeTypes.add('graphic', t('_filetype_label_graphic'));
	codeTypes.add('sprite_map', t('_filetype_label_sprite_map'));
	codeTypes.add('sprite_font', t('_filetype_label_sprite_font'));
	codeTypes.add('database', t('_filetype_label_database'));
	codeTypes.add('folder', t('folder'));
	
	var rootLabel = props.selectedFolder == props.projectFolder ? '/' : props.selectedFolder.substring(props.projectFolder.length);
	// force convert backslash into forward slash.
	rootLabel = (String.raw`${rootLabel}`).replace(/\\/g, "/");

	const folders = new Dictionary<string>();
	folders.add('', rootLabel.replace("\\", '/'));

	const updateSetting = async (option:any, newValue:any) => {
		const clone = new NewFileInfo(info);
		switch (option) {
			case 'file_name': clone.file_name = newValue; break;
			case 'file_type': clone.file_type = newValue; break;
		}
		setInfo(clone);
		console.log(clone);
	};

	const onSubmit = async () => {

		const path = `${props.selectedFolder}/${info.file_name}`;
		let ext = '.js';

		if (info.file_type == 'folder') {
			const d_res = await window.api.createFolder(path);
			console.log("FolderCreateResult", [path, d_res]);
			props.onCancel();
			return;
		}

		switch (info.file_type) {
			case 'code_js': ext = '.js'; break;
			case 'code_py': ext = '.py'; break;
			case 'code_lua': ext = '.lua'; break;
			case 'conversation': ext = '.xcf'; break;
			case 'layout': ext = '.xlf'; break;
			case 'graphic': ext = '.xgf'; break;
			case 'sprite_map': ext = '.xsf'; break;
			case 'sprite_font': ext = '.xff'; break;
			case 'database': ext = '.xdf'; break;
		}

		const file_r = await window.api.createFile(path, ext);
		console.log("FileCreateResult", [path, file_r]);
		props.onCancel();
	};

	
	return (
		<div className={`settings-dialog`} style={{width:'400px'}}>
			<div className="dialog-main">
				
			<div className="dialog-page" style={{display:'block'}}>
					<h2>{t('new_file')}</h2>
					{ /* <p>Configure basic info about your game.</p> */ }

					<SettingInput slug='fileName' key={'fileName'} title={t('file_name')}
									  tooltip={t('_new_file_name_desc')} width='200px'
									  value={info.file_name} autoFocus={true}
									  setValue={(s:string) => {updateSetting('file_name', s)}} />

					<SettingCombo slug='fileType' key={'fileType'} title={t('file_type')}
					              tooltip={t('_new_file_type_desc')} width='218px'
									  options={codeTypes} value={info.file_type}
									  setValue={(v:string) => {updateSetting('file_type', v)}} />

					<SettingCombo slug='folder' key={'folder'} title={t('folder')}
									  tooltip={t('_new_file_folder_desc')} width='218px'
									  options={folders} value={info.folder}
									  setValue={(s:string) => {updateSetting('folder', s)}} />

					<SettingButtons onSubmit={onSubmit} onCancel={props.onCancel} />

				</div>
			</div>

		</div>
	);
}