'use strict';

const proxyquire = require('proxyquire').noPreserveCache(),
  chai = require("chai");
const defaultConfig = {
  "uniqueKeyA": "default",
  "override": "default"
}, envConfig = {
  "uniqueKeyB": "env",
  "override": "env"
}, localConfig = {
  "uniqueKeyC": "local",
  "override": "local"
};
let originalNodeEnv;

describe('ConfigService', function () {
  before(function () {
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
  });

  after(function () {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should read default config', function () {
    let getConfig = getConfigServiceWithMockDependencies(() => false);
    const config = getConfig();
    config.override.should.equal('default');
    config.uniqueKeyA.should.equal('default');
  });

  it('should merge config for $NODE_ENV into default config', function () {
    let getConfig = getConfigServiceWithMockDependencies((filepath) => {
      return filepath === "../configs/test.json"
    });
    const config = getConfig();
    config.override.should.equal('env');
    config.uniqueKeyA.should.equal('default');
    config.uniqueKeyB.should.equal('env');
  });

  it('should merge local config last', function() {
    let getConfig = getConfigServiceWithMockDependencies((filepath) => {
      return filepath === "../configs/test.json" || filepath === "../configs/local.json"
    });
    const config = getConfig();
    config.override.should.equal('local');
    config.uniqueKeyA.should.equal('default');
    config.uniqueKeyB.should.equal('env');
    config.uniqueKeyC.should.equal('local');
  })
});

function getConfigServiceWithMockDependencies(mockFSExistsSync) {
  return proxyquire('./ConfigService', {
    "../configs/default.json": defaultConfig,
    "../configs/test.json": envConfig,
    "../configs/local.json": localConfig,
    "path": {
      resolve: function(dirName, filepath) { return filepath; }
    },
    "fs": {
      existsSync: mockFSExistsSync
    }
  });
}