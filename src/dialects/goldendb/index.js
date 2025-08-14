'use strict';

const _ = require('lodash');
const AbstractDialect = require('../abstract');
const ConnectionManager = require('./connection-manager');
const Query = require('./query');
const QueryGenerator = require('./query-generator');
const DataTypes = require('../../data-types').goldendb;
const { GoldenDBQueryInterface } = require('./query-interface');

class GoldenDBDialect extends AbstractDialect {
  constructor(sequelize) {
    super();
    this.sequelize = sequelize;
    this.connectionManager = new ConnectionManager(this, sequelize);
    this.queryGenerator = new QueryGenerator({
      _dialect: this,
      sequelize
    });
    this.queryInterface = new GoldenDBQueryInterface(
      sequelize,
      this.queryGenerator
    );
  }
}

GoldenDBDialect.prototype.supports = _.merge(
  _.cloneDeep(AbstractDialect.prototype.supports),
  {
    'VALUES ()': true,
    'LIMIT ON UPDATE': true,
    lock: true,
    forShare: 'LOCK IN SHARE MODE',
    settingIsolationLevelDuringTransaction: false,
    inserts: {
      ignoreDuplicates: ' IGNORE',
      updateOnDuplicate: ' ON DUPLICATE KEY UPDATE'
    },
    index: {
      collate: false,
      length: true,
      parser: true,
      type: true,
      using: 1
    },
    constraints: {
      dropConstraint: false,
      check: false
    },
    indexViaAlter: true,
    indexHints: true,
    NUMERIC: true,
    GEOMETRY: true,
    JSON: true,
    REGEXP: true
  }
);

GoldenDBDialect.prototype.defaultVersion = '5.7.0'; // minimum supported version
GoldenDBDialect.prototype.Query = Query;
GoldenDBDialect.prototype.QueryGenerator = QueryGenerator;
GoldenDBDialect.prototype.DataTypes = DataTypes;
GoldenDBDialect.prototype.name = 'goldendb';
GoldenDBDialect.prototype.TICK_CHAR = '`';
GoldenDBDialect.prototype.TICK_CHAR_LEFT = GoldenDBDialect.prototype.TICK_CHAR;
GoldenDBDialect.prototype.TICK_CHAR_RIGHT = GoldenDBDialect.prototype.TICK_CHAR;

module.exports = GoldenDBDialect;
