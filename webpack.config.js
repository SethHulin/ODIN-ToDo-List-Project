const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "development",
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].[contenthash].js",
        clean: true,
    },
    devtool: "source-map",
    devServer: {
        port: 5173,
        open: true,
        hot: true,
    },
    module: {
        rules: [
            {test: /\.css$/, use: ["style-loader", "css-loader"]},
        ],
    },
    plugins: [
        new htmlWebpackPlugin({template: "./public/template.html",}),
    ],
};