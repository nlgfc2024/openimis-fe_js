const webpack = require("webpack");
const path = require("path");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Set publicPath to serve assets under /front/
      webpackConfig.output.publicPath = "/front/";
      // Consume the local project build while preserving existing package links.
      const localProjectEntry = path.resolve(
        __dirname, "../openimis-fe-project_social_protection_js/dist/index.es.js",
      );
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        "@openimis/fe-project_social_protection$": localProjectEntry,
      };
      // CRA checks aliased files too. Permit this built entry without removing
      // source-scope checks or allowing the entire neighbouring repository.
      for (const plugin of webpackConfig.resolve.plugins || []) {
        if (plugin.constructor.name === "ModuleScopePlugin") {
          plugin.allowedFiles.add(localProjectEntry);
        }
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
