import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

// asset handling
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

export const plugins = [
	new ForkTsCheckerWebpackPlugin({
		logger: 'webpack-infrastructure',
	}),
	new CopyPlugin({
		patterns: [
			{
				from: path.resolve(__dirname, 'src/frontend/Resources', 'images'),
				to: path.resolve(__dirname, '.webpack/renderer', 'images')
			},
			{
				from: path.resolve(__dirname, 'src/frontend/Resources', 'css'),
				to: path.resolve(__dirname, '.webpack/renderer', 'css')
			},
			{
				from: path.resolve(__dirname, 'src/frontend/Resources', 'templates'),
				to: path.resolve(__dirname, '.webpack/renderer', 'templates')
			}
		]
	}),
	new MonacoWebpackPlugin({
		languages: ['javascript', 'typescript']
	})
];