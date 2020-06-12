/**
 * MIT License
 *
 * Copyright (c) 2018 Simo Ahava
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const HCCrawler = require(`headless-chrome-crawler`);
const RedisCache = require(`headless-chrome-crawler/cache/redis`);
const extend = require(`lodash/extend`);
const {Validator} = require(`jsonschema`);

const {BigQuery} = require(`@google-cloud/bigquery`);

const config = require(`./config.json`);
const configSchema = require(`./config.schema.json`);
const bigQuerySchema = require(`./bigquery-schema.json`);

// Initialize new BigQuery client
const bigquery = new BigQuery({
  projectId: config.projectId
});

const validator = new Validator;

// Only set cache if the configuration file has redis set to active
let cache = null;

let count = 0;
let start = null;

/**
 * Checks if given URL is external.
 *
 * @param {string} urlString The URL string to check.
 * @returns {boolean} Returns true if external.
 */
function checkIfUrlExternal(urlString) {
  const domain = new RegExp(`^https?://${config.domain}/`);
  return domain.test(urlString);  
}

/**
 * Writes the crawl result to a BigQuery table.
 *
 * @param {object} result The object returned for each crawled page.
 */
async function writeToBigQuery(result) {
  console.log(`Crawled ${result.response.url}`);
  count += 1;

  let item = {
    requested_url: result.options.url,
    cookies: !!checkIfUrlExternal(result.response.url) ? [] : result.cookies.map(c => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      expires: new Date(c.expires * 1000).toISOString(),
      size: c.size,
      httpOnly: c.httpOnly,
      secure: c.secure,
      session: c.session,
      sameSite: c.sameSite || null
    }))
  };

  if (!config.cookiesOnly) {
    item.final_url = result.response.url;
    item.http_status = result.response.status;
    item.content_type = result.response.headers['content-type'];
    item.external = checkIfUrlExternal(result.response.url);
    item.previous_url = result.previousUrl;
    item.document_title = result.result.title;
    item.meta_description= result.result.metaDescription;
  }

  await bigquery
    .dataset(config.bigQuery.datasetId)
    .table(config.bigQuery.tableId)
    .insert([item]);
}

/**
 * Checks if the crawled URL is external. if it is, only crawl the current page but not any of its links.
 *
 * @param {object} options The options object for each crawled page.
 * @returns {boolean} Returns true after setting the new maxDepth.
 */
function preRequest(options) {
    if (checkIfUrlExternal(options.url)) {
    if (config.skipExternal) return false;
    options.maxDepth = 1;
  }
  return true;
}

/**
 * Use jQuery to return title and Meta Description content of each crawled page.
 *
 * Ignored from tests due to use of jQuery.
 *
 * @returns {object} The object containing title and metaDescription data.
 */
/* istanbul ignore next */
function evaluatePage() {
  return {
    title: $('title').text(),
    metaDescription: $('meta[name="description"]').attr('content')
  };
}

/**
 * Launches the crawler.
 *
 * @returns {Promise<void>}
 */
async function launchCrawler() {
  try {
    start = new Date().getTime();
    console.log(`Creating table ${config.bigQuery.tableId} in dataset ${config.bigQuery.datasetId}`);

    try {
      await bigquery.createDataset(config.bigQuery.datasetId);
    } catch(e) {}
    try {
      await bigquery
        .dataset(config.bigQuery.datasetId)
        .createTable(config.bigQuery.tableId, {
          schema: {
            fields: bigQuerySchema
          },
          timePartitioning: {
            type: 'DAY'
          }
        });
    } catch(e) {}

    console.log(`Starting crawl from ${config.startUrl}`);

    const options = extend({
      args: config.puppeteerArgs,
      onSuccess: writeToBigQuery,
      preRequest,
      evaluatePage,
      cache,
      skipRequestedRedirect: true
    }, config.crawlerOptions);

    const crawler = await HCCrawler.launch(options);

    await crawler.queue({url: config.startUrl, maxDepth: 9999999});

    await crawler.onIdle();
    const finish = new Date().getTime();
    console.log(`Crawl took ${finish - start} milliseconds.`);
    console.log(`Crawled ${count} files.`);
    await crawler.close();
  } catch(e) {
    console.error(e);
  }
}

/**
 * Validates the configuration file.
 */
function init() {
  const result = validator.validate(config, configSchema);
  if (result.errors.length) {
    throw new Error(`Error(s) in configuration file: ${JSON.stringify(result.errors, null, " ")}`);
  } else {
    cache = config.redis.active ? new RedisCache({ host: config.redis.host, port: config.redis.port }) : null;
    console.log(`Configuration validated successfully`);
  }
}

/**
 * Runs the intiialization and crawler unless in test, in which case only the module exports are done for the test suite.
 *
 * Ignored from test coverage.
 */
/* istanbul ignore next */
(async () => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      init();
      await launchCrawler();
    } else {
      // For testing
      module.exports = {
        _init: init,
        _createBigQueryTable: createBigQueryTable,
        _createBigQueryDataset: createBigQueryDataset,
        _writeToBigQuery: writeToBigQuery,
        _preRequest: preRequest,
        _evaluatePage: evaluatePage
      };
    }
    module.exports.launchCrawler = launchCrawler;
  } catch(e) {
    console.error(e);
  }
})();
