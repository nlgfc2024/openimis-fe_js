const webpack = require("webpack");
const path = require("path");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Set publicPath to serve assets under /front/
      webpackConfig.output.publicPath = "/front/";

      // Linked modules can resolve their own dev dependency copies otherwise.
      const runtimePaths = {
        react: path.resolve(__dirname, "node_modules", "react"),
        reactDom: path.resolve(__dirname, "node_modules", "react-dom"),
        reactIntl: path.resolve(__dirname, "node_modules", "react-intl"),
        reactRedux: path.resolve(__dirname, "node_modules", "react-redux"),
      };
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        "react$": runtimePaths.react,
        "react/jsx-runtime$": path.resolve(runtimePaths.react, "jsx-runtime.js"),
        "react/jsx-dev-runtime$": path.resolve(runtimePaths.react, "jsx-dev-runtime.js"),
        "react-dom$": runtimePaths.reactDom,
        "react-intl$": runtimePaths.reactIntl,
        "react-redux$": runtimePaths.reactRedux,
      };
      const moduleScopePlugin = webpackConfig.resolve.plugins?.find(
        (plugin) => plugin.constructor.name === "ModuleScopePlugin",
      );
      if (moduleScopePlugin) moduleScopePlugin.allowedPaths.push(...Object.values(runtimePaths));

      // Inject environment variables explicitly
      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          "process.env.REACT_APP_SENTRY_DSN": JSON.stringify(
            process.env.REACT_APP_SENTRY_DSN || ""
          ),
          "process.env.REACT_APP_API_URL": JSON.stringify(
            process.env.REACT_APP_API_URL || "/api"
          ),
          "process.env.PUBLIC_URL": JSON.stringify(
            process.env.PUBLIC_URL || "/front"
          ),
          "process.env.OPENIMIS_CONF_JSON": JSON.stringify(
            process.env.OPENIMIS_CONF_JSON || ""
          ),
          "process.env.NODE_ENV": JSON.stringify(
            process.env.NODE_ENV || "development"
          ),
        })
      );

      webpackConfig.ignoreWarnings = [
        {
          module: /@formatjs\/fast-memoize/,
          message: /Failed to parse source map/,
        },
        {
          module: /react-double-scrollbar/,
          message: /Failed to parse source map/,
        },
      ];

      return webpackConfig;
    },
  },
  devServer: {
  },
};
