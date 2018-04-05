'use strict';

function getConfig() {
  const configForEnv = require(`../configs/${process.env.NODE_ENV}.json`);
  const defaultConfig = require('../configs/default.json');
  return Object.assign({}, defaultConfig, configForEnv);
}

module.exports = getConfig;