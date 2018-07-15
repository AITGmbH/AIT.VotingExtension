const path = require('path');

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ConcatPlugin = require('webpack-concat-plugin');
const ProgressPlugin = require("webpack/lib/ProgressPlugin");
const { NoEmitOnErrorsPlugin } = require("webpack");
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
	externals: [/^VSS\/.*/, /^TFS\/.*/, /^q$/, /^appInsights$/, /^\$$/],
	performance: { hints: false },
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'raw-loader'
			},
			{
				test: /\.ts$/,
				loader: 'ts-loader'
			},
			{
				test: /\.css$/,
				use: [
					"style-loader",
					"file-loader"
				]
			}
		]
	},
	entry: {
		voting: './src/views/votingPage.ts',
		admin: './src/views/adminPage.ts'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
		libraryTarget: "amd",
		publicPath: ""
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js"],
		modules: ["./node_modules"],
		symlinks: true
	},
	plugins: [
		new CleanWebpackPlugin(["dist"]),
		new ConcatPlugin({
			uglify: true,
			name: "vendors",
			fileName: "[name].js",
			filesToConcat: [
				".\\js\\appInsights.js",
				".\\js\\bootstrap.min.js",
				".\\js\\bootstrap-notify.min.js"
			]
		}),
		new ConcatPlugin({
			uglify: true,
			name: "vss",
			fileName: "[name].js",
			filesToConcat: [
				".\\node_modules\\vss-web-extension-sdk\\lib\\VSS.SDK.js",
			]
		}),
		new CopyPlugin([
			{ from: 'css/*.css', to: '[name].[ext]' }
		]),
		new NoEmitOnErrorsPlugin(),
		new ProgressPlugin(),
		new HtmlWebpackPlugin({
			template: "./src/views/adminPage.html",
			filename: "adminPage.html",
			inject: false
		}),
		new HtmlWebpackPlugin({
			template: "./src/views/votingPage.html",
			filename: "votingPage.html",
			inject: false
		}),
		new HtmlWebpackIncludeAssetsPlugin({
			assets: [{ path: 'dist', glob: '*.css', globPath: 'css/' }],
			append: true,
			publicPath: false
		}),
		new UglifyJSPlugin()
	]
};
