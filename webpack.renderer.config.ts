import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
	test: /\.css$/,
	use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

rules.push({
	test: /\.scss$/,
	use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'sass-loader' }],
})

export const rendererConfig: Configuration = {
	devtool: "nosources-source-map",
	module: {
		rules,
	},
	plugins,
	resolve: {
		extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.scss', '.jpg', '.ico', '.eot', '.svg', '.ttf', '.woff', '.woff2'],
	},
};