import { createContext } from "react";


export type ProjectSchema = {
	game: {
		title: string,
		entry_point: string,
		version: string,
		icon: string,
		v_sync: boolean,
		fullscreen: boolean,
		resizable: boolean,
		update_frequency: number,
		draw_frequency: number,
		window: {
			width: number,
			height: number
		},
		viewport: {
			width: number,
			height: number,
			mode: number
		},
		audio: {
			frequency: number,
			channels: number,
			depth: number,
			codecs: Array<string>
		}
	}
}


export const ProjectContext : React.Context<ProjectSchema> = createContext({
	game: {
		title: "Untitled",
		entry_point: "/game.js",
		icon: "",
		version: "1.0.0",
		v_sync: true,
		fullscreen: false,
		resizable: false,
		update_frequency: 30,
		draw_frequency: 30,
		window: {
			width: 640,
			height: 400
		},
		viewport: {
			width: 640,
			height: 400,
			mode: 1
		},
		audio: {
			frequency: 44100,
			channels: 2,
			depth: 16,
			codecs: ["wav", "ogg", "flac"]
		}
	}
});