import { createContext } from "react";


export type BuildSchema = {
	exe_name: string, /* the executable name */
	icon: string, /* the icon to embed (win) */
	pre_build_commands: Array<string>, /* any commands to run before build (tsc etc..) */
	assets: {
		pack: boolean, /* pack assets into game.dat? */
		ignores: Array<string> /* list of file/folder ignore rules for assets, eg "*.json" */
	}
}


export const BuildContext : React.Context<BuildSchema> = createContext({
	exe_name: "untitled", /* the executable name */
	icon: "", /* the icon to embed (win) */
	pre_build_commands: [], /* any commands to run before build (tsc etc..) */
	assets: {
		pack: false, /* pack assets into game.dat? */
		ignores: [".git", ".gitignore", "editor.json" ] /* list of file/folder ignore rules for assets, eg "*.json" */
	}
});