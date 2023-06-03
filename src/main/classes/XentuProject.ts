const fs = require( 'fs-extra' );


class ProjectWindowSize { 
	width: number;
	height: number; 
	constructor(width:number = 1280, height:number = 720) {
		this.width = width;
		this.height = height;
	}
}


class ProjectViewport {
	width: number;
	height: number;
	mode: number;
	constructor(width:number = 1280, height:number = 720, mode:number = 0) {
		this.width = width;
		this.height = height;
		this.mode = mode;
	}
}


class ProjectAudio {
	frequency: number;
	channels: number;
	depth: number;
	codecs: Array<string>;
	constructor(freq:number = 44100, channels:number = 2, depth:number = 16, 
					codecs:Array<string> = ["wav", "ogg", "flac"]) {
		this.frequency = freq;
		this.channels = channels;
		this.depth = depth;
		this.codecs = codecs;
	}
}


class XentuProject {
	path?: string;
	title: string;
	entry_point: string;
	version: string;
	v_sync: boolean;
	fullscreen: boolean;
	update_frequency: number;
	draw_frequency: number;
	window: ProjectWindowSize;
	viewport: ProjectViewport;
	audio: ProjectAudio;


	constructor() {
		this.path = null;
		this.title = 'Untitled';
		this.entry_point = '/game.js';
		this.version = '0.0.0';
		this.v_sync = true;
		this.fullscreen = false;
		this.update_frequency = 60;
		this.draw_frequency = 60;
		this.window = new ProjectWindowSize();
		this.viewport = new ProjectViewport();
		this.audio = new ProjectAudio();
	}

	static async Load(filePath:string) : Promise<XentuProject> {
		const project = new XentuProject();
		const data = await fs.readJson(filePath);

		project.title = data.game.title;
		project.entry_point = data.game.entry_point;
		project.version = data.game.version;
		project.v_sync = data.game.v_sync;

		return project;
	}
}


export { ProjectWindowSize, ProjectViewport, ProjectAudio };
export default XentuProject;