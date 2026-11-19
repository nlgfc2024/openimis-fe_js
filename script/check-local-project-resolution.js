const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { ResolverFactory } = require("enhanced-resolve");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const configure = require("../craco.config").webpack.configure;

const root = path.resolve(__dirname, "..");
const appSrc = path.join(root, "src");
const entry = path.resolve(root, "../openimis-fe-project_social_protection_js/dist/index.es.js");
const moduleName = "@openimis/fe-project_social_protection";

function resolveWith(config) {
  // CRA receives webpack's cached absolute request after alias expansion.
  // A bare enhanced-resolve call does not populate this webpack bookkeeping.
  const requestContext = { apply(resolver) {
    resolver.hooks.file.tapAsync("WebpackRequestContext", (request, context, callback) => {
      request.__innerRequest_request = request.path;
      callback();
    });
  } };
  const resolver = ResolverFactory.createResolver({
    fileSystem: fs,
    extensions: [".js", ".json"],
    modules: [path.join(root, "node_modules"), "node_modules"],
    ...config.resolve,
    plugins: [requestContext, ...config.resolve.plugins],
  });
  return new Promise((resolve, reject) => resolver.resolve(
    { issuer: path.join(appSrc, "modules.js") }, appSrc, moduleName, {},
    (error, result) => error ? reject(error) : resolve(result),
  ));
}

async function main() {
  assert.ok(fs.existsSync(entry), "Build the local project module first");
  const blocked = { resolve: { alias: { [`${moduleName}$`]: entry }, plugins: [new ModuleScopePlugin(appSrc)] } };
  await assert.rejects(resolveWith(blocked), /outside of the project/);
  const config = configure({ output: {}, plugins: [], resolve: {
    alias: { existingAlias: "preserved" }, plugins: [new ModuleScopePlugin(appSrc)],
  } });
  assert.equal(await resolveWith(config), entry);
  assert.equal(config.resolve.alias.existingAlias, "preserved");
  assert.equal(config.resolve.plugins.length, 1);
  assert.ok(!config.resolve.plugins[0].allowedFiles.has(path.dirname(entry)));
  console.log("Local project module resolves through CRA scope checks; existing aliases and scope restrictions are preserved.");
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
