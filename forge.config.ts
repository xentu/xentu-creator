import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDMG, MakerDMGConfig } from '@electron-forge/maker-dmg';
import { MakerDeb, MakerDebConfig } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const execName = process.platform === "win32" ? 'Xentu Creator' : 'xentu-creator';


const debConfig:MakerDebConfig = {
	options: {
		section: 'editors',
		categories: ['Development'],
		homepage: 'https://xentu.net',
		icon: 'images/xentu-icon.png'
	}
}


const macConfig:MakerDMGConfig = {
	icon: 'images/xentu-icon.icns'
}


const config: ForgeConfig = {
	rebuildConfig: {},
	packagerConfig: {
		executableName: execName,
		icon: './images/xentu-icon' // no file extension required
	},
	makers: [
		new MakerSquirrel({}),
		new MakerDMG(macConfig, ['darwin']),
		/* new MakerZIP({},['darwin']), */
		/* new MakerRpm({}), */
		new MakerDeb(debConfig, ['linux'])
	],
	plugins: [
		new WebpackPlugin({
			mainConfig,
			renderer: {
				config: rendererConfig,
				entryPoints: [
					{
						html: './src/frontend/index.html',
						js: './src/frontend/renderer.ts',
						name: 'main_window',
						preload: {
							js: './src/main/preload.ts',
						},
					},
				],
			},
		}),
	],
};

export default config;