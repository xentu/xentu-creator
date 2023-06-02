class OpenTab {
	label?: string;
	changed: boolean;
	path: string;
	data?: any;

	constructor(label:string, path:string) {
		this.label = label;
		this.changed = false;
		this.path = path;
	}
};

export default OpenTab;