class OpenTab {
	guid: string;
	label?: string;
	changed: boolean;
	path: string;
	data?: any;

	constructor(label:string, path:string) {
		this.guid = Math.floor(Date.now() / 1000).toString(36);
		this.label = label;
		this.changed = false;
		this.path = path;
	}
};

export default OpenTab;