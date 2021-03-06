#!/usr/bin/env node

const cheerio = require('cheerio');
const axios = require('axios').default;
const argv = require('yargs')
    .options({
      'no-out-of-stock': {
        type: 'boolean',
        description: 'Ignore products that are out of stock',
      },
      'no-refurbished': {
        type: 'boolean',
        description: 'Ignore refurbished products',
      },
      'no-new': {
        type: 'boolean',
        description: 'Ignore products that are new',
      },
    }).argv;

/**
 * Max number of products per page
 */
const MAX_PRODUCTS_PER_PAGE = 8;

// extract args from argv
const INCLUDE_OUT_OF_STOCK =
    ('out-of-stock' in argv && argv['out-of-stock'] === false) ? false : true;
const INCLUDE_REFURBISHED =
    ('refurbished' in argv && argv['refurbished'] === false) ? false : true;
const INCLUDE_NEW =
    ('new' in argv && argv['new'] === false) ? false : true;

/**
 * Scrape products
 * @param {number} nPages Number of pages [integer]
 * @return {Object} Array of product objects
 */
async function scrape(nPages) {
  // product array
  const db = [];

  // iterate over pages
  for (let i = 0; i < nPages; ++i) {
    // get page
    const r = await axios.get(
        'https://www.lenovo.com/us/en/outletus/laptops/c/LAPTOPS?q=%3Aprice-asc&page=' + i.toString());

    // get products
    let $ = cheerio.load(r.data);
    products = $('div.facetedResults-item');

    // iterate over products
    for (let j = 0; j < products.length; ++j) {
      // temporary product object
      obj = {};

      // get product's title and type
      $ = cheerio.load(products[j]);
      let title = $('.facetedResults-title a').text();
      tmp = title.split('-');
      type = tmp.pop().trim();
      title = tmp.join('').trim();

      obj['title'] = title;
      obj['type'] = type;

      // get product's status
      const status = $('.rci-msg').text().trim();
      obj['status'] = status;

      // get product's image url
      let imageUrl = $('div.facetedResults-media a img').attr('src');
      imageUrl = 'https://www.lenovo.com' + imageUrl;
      obj['imageUrl'] = imageUrl;

      // get product's "shop now" url
      let shopUrl = $('div.facetedResults-footer a').attr('href');
      shopUrl = 'https://www.lenovo.com' + shopUrl;
      obj['shopUrl'] = shopUrl;

      // handle args
      if (INCLUDE_NEW === false && type === 'New') {
        continue;
      }

      if (INCLUDE_REFURBISHED === false && type === 'Refurbished') {
        continue;
      }

      if (INCLUDE_OUT_OF_STOCK === false) {
        if (status === 'Out of Stock') {
          continue;
        }

        const r2 = await axios.get(obj['shopUrl']);
        const $2 = cheerio.load(r2.data);
        const partNumber = $2('.partNumber').html();
        if (partNumber === null) {
          continue;
        }
      }

      // get pricing
      prices = $('.saleprice').text().replace(/\s/g, '');
      ind = [];
      for ( let k = 0; k < prices.length; ++k ) {
        if ( prices[k] == '$' ) {
          ind.push( k );
        }
      }

      if (ind.length < 2) {
        continue;
      }

      obj['oldPrice'] = parseFloat(
          prices.substring( ind[0] + 1, ind[1] ).replace(',', ''));
      obj['newPrice'] = parseFloat(
          prices.substring( ind[1] + 1, prices.length ).replace(',', ''));

      // get product's specs
      obj['specs'] = {};
      const specs = $('.facetedResults-feature-list dl');
      for (let l = 0; l < specs.length; ++l) {
        // extract spec
        $ = cheerio.load(specs[l]);
        param = $('dt').text().trim().replace(':', '');
        val = $('dd').text().trim();
        obj['specs'][param] = val;
      }

      // push product to product array
      db.push(obj);
    }
  }

  return db;
}

/**
 * Get number of pages
 * @return {number} Number of pages [integer]
 */
async function getNumberOfPages() {
  const html = await axios.get(
      'https://www.lenovo.com/us/en/outletus/laptops/c/LAPTOPS?q=%3Aprice-asc&page=0');

  // get number of products
  const $ = cheerio.load(html.data);
  const nProducts = parseInt($('div.totalResults').first().text().trim());

  // calculate ceiling of number of pages
  const nPages = parseInt(nProducts / MAX_PRODUCTS_PER_PAGE) + 1;

  return nPages;
}

/**
 * Main function - get JSON of products and print it to stdout
 */
async function main() {
  // get number of pages
  const nPages = await getNumberOfPages();

  // scrape products
  const arr = await scrape(nPages);

  // convert to JSON
  json = JSON.stringify(arr);

  console.log(json);
}

// run program
main();
