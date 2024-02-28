const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const env = require("dotenv").config({ path: "variables.env" });
const nodeEnv = process.env.NODE_ENV || env.parsed.NODE_ENV;

const javascript = {
  test: /\.(js)$/,
  exclude: /(node_modules)/,
  use: {
    loader: "babel-loader",
    options: {
      presets: ["@babel/preset-env"],
    },
  },
};

const postcss = {
  loader: "postcss-loader",
  options: {
    postcssOptions: {
      plugins: { autoprefixer: true },
    },
  },
};

const styles = {
  test: /\.(scss)$/,
  use: [
    MiniCssExtractPlugin.loader,
    {
      loader: "css-loader",
      options: {
        sourceMap: true,
      },
    },
    {
      loader: "resolve-url-loader",
    },
    postcss,
    {
      loader: "sass-loader",
      options: {
        sourceMap: true,
      },
    },
  ],
};

const config = {
  mode: nodeEnv,
  devtool: "source-map",
  entry: {
    App: "./public/javascripts/public-app.js",
  },
  output: {
    path: path.resolve(__dirname, "public", "dist"),
    filename: "[name].bundle.js",
  },
  module: {
    rules: [javascript, styles],
  },
  plugins: [new MiniCssExtractPlugin({ filename: "style.css" })],
};

module.exports = config;
