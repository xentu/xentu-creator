class OpenTab {
	guid: string;
	label?: string;
	changed: boolean;
	path: string;
	type: OpenTabType;
	data?: any;

	constructor(label:string, path:string, tabType:OpenTabType) {
		this.guid = Math.floor(Date.now() / 1000).toString(36);
		this.label = label;
		this.changed = false;
		this.type = tabType;
		this.path = path;
	}
};

export enum OpenTabType {
	Editor,
	ImageViewer
}

export default OpenTab;