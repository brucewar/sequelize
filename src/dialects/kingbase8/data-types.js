'use strict';

const _ = require('lodash');
const wkx = require('wkx');

module.exports = BaseTypes => {
  const warn = BaseTypes.ABSTRACT.warn.bind(undefined, 'http://www.postgresql.org/docs/9.4/static/datatype.html');

  /**
   * Removes unsupported Postgres options, i.e., LENGTH, UNSIGNED and ZEROFILL, for the integer data types.
   *
   * @param {object} dataType The base integer data type.
   * @private
   */
  function removeUnsupportedIntegerOptions(dataType) {
    if (dataType._length || dataType.options.length || dataType._unsigned || dataType._zerofill) {
      warn(`KingbaseES does not support '${dataType.key}' with LENGTH, UNSIGNED or ZEROFILL. Plain '${dataType.key}' will be used instead.`);
      dataType._length = undefined;
      dataType.options.length = undefined;
      dataType._unsigned = undefined;
      dataType._zerofill = undefined;
    }
  }

  /**
   * types:
   * {
   *   oids: [oid],
   *   array_oids: [oid]
   * }
   *
   * @see oid here https://github.com/lib/pq/blob/master/oid/types.go
   */

  BaseTypes.UUID.types.kingbase8 = ['uuid'];
  BaseTypes.CIDR.types.kingbase8 = ['cidr'];
  BaseTypes.INET.types.kingbase8 = ['inet'];
  BaseTypes.MACADDR.types.kingbase8 = ['macaddr'];
  BaseTypes.TSVECTOR.types.kingbase8 = ['tsvector'];
  BaseTypes.JSON.types.kingbase8 = ['json'];
  BaseTypes.JSONB.types.kingbase8 = ['jsonb'];
  BaseTypes.TIME.types.kingbase8 = ['time'];

  class DATEONLY extends BaseTypes.DATEONLY {
    _stringify(value, options) {
      if (value === Infinity) {
        return 'Infinity';
      }
      if (value === -Infinity) {
        return '-Infinity';
      }
      return super._stringify(value, options);
    }
    _sanitize(value, options) {
      if ((!options || options && !options.raw) && value !== Infinity && value !== -Infinity) {
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          if (lower === 'infinity') {
            return Infinity;
          }
          if (lower === '-infinity') {
            return -Infinity;
          }
        }
        return super._sanitize(value);
      }
      return value;
    }
    static parse(value) {
      if (value === 'infinity') {
        return Infinity;
      }
      if (value === '-infinity') {
        return -Infinity;
      }
      return value;
    }
  }

  BaseTypes.DATEONLY.types.kingbase8 = ['date'];

  class DECIMAL extends BaseTypes.DECIMAL {
    static parse(value) {
      return value;
    }
  }

  // numeric
  BaseTypes.DECIMAL.types.kingbase8 = ['numeric'];

  class STRING extends BaseTypes.STRING {
    toSql() {
      if (this._binary) {
        return 'BYTEA';
      }
      return super.toSql();
    }
  }

  BaseTypes.STRING.types.kingbase8 = ['varchar'];

  class TEXT extends BaseTypes.TEXT {
    toSql() {
      if (this._length) {
        warn('KingbaseES does not support TEXT with options. Plain `TEXT` will be used instead.');
        this._length = undefined;
      }
      return 'TEXT';
    }
  }

  BaseTypes.TEXT.types.kingbase8 = ['text'];

  class CITEXT extends BaseTypes.CITEXT {
    static parse(value) {
      return value;
    }
  }

  BaseTypes.CITEXT.types.kingbase8 = ['citext'];

  class CHAR extends BaseTypes.CHAR {
    toSql() {
      if (this._binary) {
        return 'BYTEA';
      }
      return super.toSql();
    }
  }

  BaseTypes.CHAR.types.kingbase8 = ['char', 'bpchar'];

  class BOOLEAN extends BaseTypes.BOOLEAN {
    toSql() {
      return 'BOOLEAN';
    }
    _sanitize(value) {
      if (value !== null && value !== undefined) {
        if (Buffer.isBuffer(value) && value.length === 1) {
          // Bit fields are returned as buffers
          value = value[0];
        }
        if (typeof value === 'string') {
          // Only take action on valid boolean strings.
          return ['true', 't'].includes(value) ? true : ['false', 'f'].includes(value) ? false : value;
        }
        if (typeof value === 'number') {
          // Only take action on valid boolean integers.
          return value === 1 ? true : value === 0 ? false : value;
        }
      }
      return value;
    }
  }

  BOOLEAN.parse = BOOLEAN.prototype._sanitize;

  BaseTypes.BOOLEAN.types.kingbase8 = ['bool'];

  class DATE extends BaseTypes.DATE {
    toSql() {
      return 'TIMESTAMP WITH TIME ZONE';
    }
    validate(value) {
      if (value !== Infinity && value !== -Infinity) {
        return super.validate(value);
      }
      return true;
    }
    _stringify(value, options) {
      if (value === Infinity) {
        return 'Infinity';
      }
      if (value === -Infinity) {
        return '-Infinity';
      }
      return super._stringify(value, options);
    }
    _sanitize(value, options) {
      if ((!options || options && !options.raw) && !(value instanceof Date) && !!value && value !== Infinity && value !== -Infinity) {
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          if (lower === 'infinity') {
            return Infinity;
          }
          if (lower === '-infinity') {
            return -Infinity;
          }
        }
        return new Date(value);
      }
      return value;
    }
  }

  BaseTypes.DATE.types.kingbase8 = ['timestamptz'];

  class TINYINT extends BaseTypes.TINYINT {
    constructor(length) {
      super(length);
      removeUnsupportedIntegerOptions(this);
    }
  }
  // int2
  BaseTypes.TINYINT.types.kingbase8 = ['int2'];

  class SMALLINT extends BaseTypes.SMALLINT {
    constructor(length) {
      super(length);
      removeUnsupportedIntegerOptions(this);
    }
  }
  // int2
  BaseTypes.SMALLINT.types.kingbase8 = ['int2'];

  class INTEGER extends BaseTypes.INTEGER {
    constructor(length) {
      super(length);
      removeUnsupportedIntegerOptions(this);
    }
  }
  INTEGER.parse = function parse(value) {
    return parseInt(value, 10);
  };

  // int4
  BaseTypes.INTEGER.types.kingbase8 = ['int4'];

  class BIGINT extends BaseTypes.BIGINT {
    constructor(length) {
      super(length);
      removeUnsupportedIntegerOptions(this);
    }
  }
  // int8
  BaseTypes.BIGINT.types.kingbase8 = ['int8'];

  class REAL extends BaseTypes.REAL {
    constructor(length) {
      super(length);
      removeUnsupportedIntegerOptions(this);
    }
  }
  // float4
  BaseTypes.REAL.types.kingbase8 = ['float4'];

  class DOUBLE extends BaseTypes.DOUBLE {
    constructor(length) {
      super(length);
      removeUnsupportedIntegerOptions(this);
    }
  }
  // float8
  BaseTypes.DOUBLE.types.kingbase8 = ['float8'];

  class FLOAT extends BaseTypes.FLOAT {
    constructor(length, decimals) {
      super(length, decimals);
      // POSTGRES does only support lengths as parameter.
      // Values between 1-24 result in REAL
      // Values between 25-53 result in DOUBLE PRECISION
      // If decimals are provided remove these and print a warning
      if (this._decimals) {
        warn('KingbaseES does not support FLOAT with decimals. Plain `FLOAT` will be used instead.');
        this._length = undefined;
        this.options.length = undefined;
        this._decimals = undefined;
      }
      if (this._unsigned) {
        warn('KingbaseES does not support FLOAT unsigned. `UNSIGNED` was removed.');
        this._unsigned = undefined;
      }
      if (this._zerofill) {
        warn('KingbaseES does not support FLOAT zerofill. `ZEROFILL` was removed.');
        this._zerofill = undefined;
      }
    }
  }
  delete FLOAT.parse; // Float has no separate type in PG

  class BLOB extends BaseTypes.BLOB {
    toSql() {
      if (this._length) {
        warn('KingbaseES does not support BLOB (BYTEA) with options. Plain `BYTEA` will be used instead.');
        this._length = undefined;
      }
      return 'BYTEA';
    }
    _hexify(hex) {
      // bytea hex format http://www.postgresql.org/docs/current/static/datatype-binary.html
      return `E'\\\\x${hex}'`;
    }
  }

  BaseTypes.BLOB.types.kingbase8 = ['bytea'];

  class GEOMETRY extends BaseTypes.GEOMETRY {
    toSql() {
      let result = this.key;
      if (this.type) {
        result += `(${this.type}`;
        if (this.srid) {
          result += `,${this.srid}`;
        }
        result += ')';
      }
      return result;
    }
    static parse(value) {
      const b = Buffer.from(value, 'hex');
      return wkx.Geometry.parse(b).toGeoJSON({ shortCrs: true });
    }
    _stringify(value, options) {
      return `ST_GeomFromGeoJSON(${options.escape(JSON.stringify(value))})`;
    }
    _bindParam(value, options) {
      return `ST_GeomFromGeoJSON(${options.bindParam(value)})`;
    }
  }

  BaseTypes.GEOMETRY.types.kingbase8 = ['geometry'];


  class GEOGRAPHY extends BaseTypes.GEOGRAPHY {
    toSql() {
      let result = 'GEOGRAPHY';
      if (this.type) {
        result += `(${this.type}`;
        if (this.srid) {
          result += `,${this.srid}`;
        }
        result += ')';
      }
      return result;
    }
    static parse(value) {
      const b = Buffer.from(value, 'hex');
      return wkx.Geometry.parse(b).toGeoJSON({ shortCrs: true });
    }
    _stringify(value, options) {
      return `ST_GeomFromGeoJSON(${options.escape(JSON.stringify(value))})`;
    }
    bindParam(value, options) {
      return `ST_GeomFromGeoJSON(${options.bindParam(value)})`;
    }
  }

  BaseTypes.GEOGRAPHY.types.kingbase8 = ['geography'];

  let hstore;

  class HSTORE extends BaseTypes.HSTORE {
    constructor() {
      super();
      if (!hstore) {
        // All datatype files are loaded at import - make sure we don't load the hstore parser before a hstore is instantiated
        hstore = require('./hstore');
      }
    }
    _value(value) {
      if (!hstore) {
        // All datatype files are loaded at import - make sure we don't load the hstore parser before a hstore is instantiated
        hstore = require('./hstore');
      }
      return hstore.stringify(value);
    }
    _stringify(value) {
      return `'${this._value(value)}'`;
    }
    _bindParam(value, options) {
      return options.bindParam(this._value(value));
    }
    static parse(value) {
      if (!hstore) {
        // All datatype files are loaded at import - make sure we don't load the hstore parser before a hstore is instantiated
        hstore = require('./hstore');
      }
      return hstore.parse(value);
    }
  }

  HSTORE.prototype.escape = false;

  BaseTypes.HSTORE.types.kingbase8 = ['hstore'];

  class RANGE extends BaseTypes.RANGE {
    _value(values, options) {
      if (!Array.isArray(values)) {
        return this.options.subtype.stringify(values, options);
      }
      const valueInclusivity = [true, false];
      const valuesStringified = values.map((value, index) => {
        if (_.isObject(value) && Object.prototype.hasOwnProperty.call(value, 'value')) {
          if (Object.prototype.hasOwnProperty.call(value, 'inclusive')) {
            valueInclusivity[index] = value.inclusive;
          }
          value = value.value;
        }
        if (value === null || value === -Infinity || value === Infinity) {
          // Pass through "unbounded" bounds unchanged
          return value;
        }
        if (this.options.subtype.stringify) {
          return this.options.subtype.stringify(value, options);
        }
        return options.escape(value);
      });
      // Array.map does not preserve extra array properties
      valuesStringified.inclusive = valueInclusivity;
      return range.stringify(valuesStringified);
    }
    _stringify(values, options) {
      const value = this._value(values, options);
      if (!Array.isArray(values)) {
        return `'${value}'::${this.toCastType()}`;
      }
      return `'${value}'`;
    }
    _bindParam(values, options) {
      const value = this._value(values, options);
      if (!Array.isArray(values)) {
        return `${options.bindParam(value)}::${this.toCastType()}`;
      }
      return options.bindParam(value);
    }
    toSql() {
      return BaseTypes.RANGE.types.kingbase8.subtypes[this._subtype.toLowerCase()];
    }
    toCastType() {
      return BaseTypes.RANGE.types.kingbase8.castTypes[this._subtype.toLowerCase()];
    }
    static parse(value, options = { parser: val => val }) {
      return range.parse(value, options.parser);
    }
  }
  const range = require('./range');

  RANGE.prototype.escape = false;

  BaseTypes.RANGE.types.kingbase8 = {
    subtypes: {
      integer: 'int4range',
      decimal: 'numrange',
      date: 'tstzrange',
      dateonly: 'daterange',
      bigint: 'int8range'
    },
    castTypes: {
      integer: 'int4',
      decimal: 'numeric',
      date: 'timestamptz',
      dateonly: 'date',
      bigint: 'int8'
    }
  };

  // TODO: Why are base types being manipulated??
  BaseTypes.ARRAY.prototype.escape = false;
  BaseTypes.ARRAY.prototype._value = function _value(values, options) {
    return values.map(value => {
      if (options && options.bindParam && this.type && this.type._value) {
        return this.type._value(value, options);
      }
      if (this.type && this.type.stringify) {
        value = this.type.stringify(value, options);

        if (this.type.escape === false) {
          return value;
        }
      }
      return options.escape(value);
    }, this);
  };
  BaseTypes.ARRAY.prototype._stringify = function _stringify(values, options) {
    let str = `ARRAY[${this._value(values, options).join(',')}]`;

    if (this.type) {
      const Utils = require('../../utils');
      let castKey = this.toSql();

      if (this.type instanceof BaseTypes.ENUM) {
        const table = options.field.Model.getTableName();
        const useSchema = table.schema !== undefined;
        const schemaWithDelimiter = useSchema ? `${Utils.addTicks(table.schema, '"')}${table.delimiter}` : '';

        castKey = `${Utils.addTicks(
          Utils.generateEnumName(useSchema ? table.tableName : table, options.field.field),
          '"'
        ) }[]`;

        str += `::${schemaWithDelimiter}${castKey}`;
      } else {
        str += `::${castKey}`;
      }
    }

    return str;
  };
  BaseTypes.ARRAY.prototype._bindParam = function _bindParam(values, options) {
    return options.bindParam(this._value(values, options));
  };

  class ENUM extends BaseTypes.ENUM {
    static parse(value) {
      return value;
    }
  }

  BaseTypes.ENUM.types.kingbase8 = [null];

  return {
    DECIMAL,
    BLOB,
    STRING,
    CHAR,
    TEXT,
    CITEXT,
    TINYINT,
    SMALLINT,
    INTEGER,
    BIGINT,
    BOOLEAN,
    DATE,
    DATEONLY,
    REAL,
    'DOUBLE PRECISION': DOUBLE,
    FLOAT,
    GEOMETRY,
    GEOGRAPHY,
    HSTORE,
    RANGE,
    ENUM
  };
};