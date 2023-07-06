import { newGuid } from "../helpers";


class OpenTab {
	guid: string;
	label?: string;
	changed: boolean;
	path: string;
	type: OpenTabType;
	data?: any;

	constructor(label:string, path:string, tabType:OpenTabType) {
		this.guid = newGuid();
		this.label = label;
		this.changed = false;
		this.type = tabType;
		this.path = path;
	}
};

export enum OpenTabType {
	CodeEditor,
	ConversationEditor,
	DatabaseClient,
	GraphicEditor,
	ImageViewer,
	LayoutEditor,
	SpriteFontEditor,
	SpriteMapEditor,
}

export default OpenTab;