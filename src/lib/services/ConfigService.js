'use strict';

const fs = require('fs'),
  path = require("path");

function getConfig() {
  const defaultConfig = require('../configs/default.json');
  let mergedConfig = Object.assign({}, defaultConfig);

  const envConfigFile = path.resolve(__dirname, `../configs/${process.env.NODE_ENV}.json`);
  const localConfigFile = path.resolve(__dirname, '../configs/local.json');
  if (fs.existsSync(envConfigFile)) {
    mergedConfig = Object.assign({}, defaultConfig, require(envConfigFile));
  }

  if (fs.existsSync(localConfigFile)) {
    mergedConfig = Object.assign({}, mergedConfig, require(localConfigFile));
  }

  return mergedConfig;
}

module.exports = getConfig;