const path = require("path");
const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Set publicPath to serve assets under /front/
      webpackConfig.output.publicPath = "/front/";

      // Local modules are linked during development. Always resolve shared React
      // packages from the host application: linked modules can otherwise bundle
      // their own React copy, which breaks hooks and provider contexts.
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        react: path.resolve(__dirname, "node_modules/react"),
        "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
        "react-redux": path.resolve(__dirname, "node_modules/react-redux"),
        "react-intl": path.resolve(__dirname, "node_modules/react-intl"),
      };

      const sharedPackagePaths = [
        "react",
        "react-dom",
        "react-redux",
        "react-intl",
      ].map((packageName) => path.resolve(__dirname, `node_modules/${packageName}`));
      const moduleScopePlugin = webpackConfig.resolve.plugins?.find(
        (plugin) => plugin.constructor.name === "ModuleScopePlugin",
      );
      if (moduleScopePlugin) {
        moduleScopePlugin.allowedPaths.push(...sharedPackagePaths);
      }

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
