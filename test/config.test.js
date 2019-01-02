const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const {Validator} = require(`jsonschema`);
const configSchema = require(`../config.schema.json`);

const mockConfig = require(`./config.test.json`);
let config;

test.beforeEach(() => {
  config = JSON.parse(JSON.stringify(mockConfig));
  tools.stubConsole();
});
test.afterEach.always(tools.restoreConsole);

test.serial(`should fail without domain`, async t => {
  delete config['domain'];
  const validator = new Validator;
  console.error(validator.validate(config, configSchema).errors[0]);
  t.deepEqual(console.error.firstCall.args[0].message, 'requires property "domain"');
});

test.serial(`should fail without startUrl`, async t => {
  delete config['startUrl'];
  const validator = new Validator;
  console.error(validator.validate(config, configSchema).errors[0]);
  t.deepEqual(console.error.firstCall.args[0].message, 'requires property "startUrl"');
});

test.serial(`should fail without projectId`, async t => {
  delete config['projectId'];
  const validator = new Validator;
  console.error(validator.validate(config, configSchema).errors[0]);
  t.deepEqual(console.error.firstCall.args[0].message, 'requires property "projectId"');
});

test.serial(`should fail without bigQuery`, async t => {
  delete config['bigQuery'];
  const validator = new Validator;
  console.error(validator.validate(config, configSchema).errors[0]);
  t.deepEqual(console.error.firstCall.args[0].message, 'requires property "bigQuery"');
});

test.serial(`should fail without bigQuery.datasetId`, async t => {
  delete config['bigQuery']['datasetId'];
  const validator = new Validator;
  console.error(validator.validate(config, configSchema).errors[0]);
  t.deepEqual(console.error.firstCall.args[0].message, 'requires property "datasetId"');
});

test.serial(`should fail without bigQuery.tableId`, async t => {
  delete config['bigQuery']['tableId'];
  const validator = new Validator;
  console.error(validator.validate(config, configSchema).errors[0]);
  t.deepEqual(console.error.firstCall.args[0].message, 'requires property "tableId"');
});

test.serial(`should fail without redis`, async t => {
  delete config['redis'];
  const validator = new Validator;
  console.error(validator.validate(config, configSchema).errors[0]);
  t.deepEqual(console.error.firstCall.args[0].message, 'requires property "redis"');
});

test.serial(`should fail without redis.active`, async t => {
  delete config['redis']['active'];
  const validator = new Validator;
  console.error(validator.validate(config, configSchema).errors[0]);
  t.deepEqual(console.error.firstCall.args[0].message, 'requires property "active"');
});

test.serial(`should fail without redis.host`, async t => {
  delete config['redis']['host'];
  const validator = new Validator;
  console.error(validator.validate(config, configSchema).errors[0]);
  t.deepEqual(console.error.firstCall.args[0].message, 'requires property "host"');
});

test.serial(`should fail without redis.port`, async t => {
  delete config['redis']['port'];
  const validator = new Validator;
  console.error(validator.validate(config, configSchema).errors[0]);
  t.deepEqual(console.error.firstCall.args[0].message, 'requires property "port"');
});

test.serial(`should fail without puppeteerArgs`, async t => {
  delete config['puppeteerArgs'];
  const validator = new Validator;
  console.error(validator.validate(config, configSchema).errors[0]);
  t.deepEqual(console.error.firstCall.args[0].message, 'requires property "puppeteerArgs"');
});

test.serial(`should fail if puppeteerArgs is not an array`, async t => {
  config['puppeteerArgs'] = '--no-sandbox';
  const validator = new Validator;
  console.error(validator.validate(config, configSchema).errors[0]);
  t.deepEqual(console.error.firstCall.args[0].message, 'is not of a type(s) array');
});

test.serial(`should fail without crawlerOptions`, async t => {
  delete config['crawlerOptions'];
  const validator = new Validator;
  console.error(validator.validate(config, configSchema).errors[0]);
  t.deepEqual(console.error.firstCall.args[0].message, 'requires property "crawlerOptions"');
});
