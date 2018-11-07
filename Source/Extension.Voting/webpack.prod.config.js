const path = require('path');

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ConcatPlugin = require('webpack-concat-plugin');
const ProgressPlugin = require("webpack/lib/ProgressPlugin");
const { NoEmitOnErrorsPlugin, SourceMapDevToolPlugin, DefinePlugin } = require("webpack");
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
	externals: [/^VSS\/.*/, /^TFS\/.*/, /^q$/, /^appInsights$/, /^\$$/],
	performance: { hints: false },
	module: {
		rules: [
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
		voting: './src/votingPage/votingPage.ts',
		admin: './src/adminPage/adminPage.ts'
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
		symlinks: true,
		alias: {
			'vue$': 'vue/dist/vue.esm.js' 
		}
	},
	plugins: [
		new CleanWebpackPlugin(["dist"]),
		new DefinePlugin({
		  'process.env.NODE_ENV': JSON.stringify('production')
		}),
		new SourceMapDevToolPlugin({
            filename: '[file].map'
        }),
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
			template: "./src/adminPage/adminPage.html",
			filename: "adminPage.html",
			inject: false
		}),
		new HtmlWebpackPlugin({
			template: "./src/votingPage/votingPage.html",
			filename: "votingPage.html",
			inject: false
		}),
		new HtmlWebpackIncludeAssetsPlugin({
			assets: [{ path: 'dist', glob: '*.css', globPath: 'css/' }],
			append: true,
			publicPath: false
		}),
		new UglifyJSPlugin({
			sourceMap: true
		})
	]
};
