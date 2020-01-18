const cheerio = require('cheerio');
const axios = require('axios').default;

const PRODUCTS_PER_PAGE = 8;

async function fun(n, pageAmt) {
	let db = [];
	for (let i = 0; i < pageAmt; ++i) {
		let r = await axios.get(
			'https://www.lenovo.com/us/en/outletus/laptops/c/LAPTOPS?q=%3Aprice-asc&page=' + i.toString());

		let $ = cheerio.load(r.data);
		products = $('div.facetedResults-item');

		for (let i = 0; i < products.length; ++i) {
			obj = {}
			$ = cheerio.load(products[i])
			title = $('.facetedResults-title a').text();
			obj['title'] = title;

			oldPrice = $('.saleprice.pricingSummary-priceList-value strike').text().trim().substring(1);
			obj['oldPrice'] = parseFloat(oldPrice.replace(',', ''));

			newPrice = $('.pricingSummary-details-final-price').text().trim().substring(1);
			obj['newPrice'] = parseFloat(newPrice.replace(',', ''));

			youSave = $('.saleprice.pricingSummary-priceList-value[itemprop="youSave"]').text().trim().substring(1);
			obj['youSave'] = parseFloat(youSave.replace(',', ''));

			let features = $('.facetedResults-feature-list dl');
						
			for (let j = 0; j < features.length; ++j) {
				$ = cheerio.load(features[j]);
				param = $('dt').text().trim();
				val = $('dd').text().trim();
				obj[param] = val;
			}
			db.push(obj)
		}
	}

	return db;
}

async function main() {
	let html = await axios.get(
		'https://www.lenovo.com/us/en/outletus/laptops/c/LAPTOPS?q=%3Aprice-asc&page=0')

			const $ = cheerio.load(html.data);

			n = parseInt($('div.totalResults').first().text().trim());

			pageAmt = parseInt(n / PRODUCTS_PER_PAGE) + 1;

			let arr = await fun(n, pageAmt)
			arr.sort((lhs, rhs) => rhs.youSave - lhs.youSave);
			for (let i = 0; i < arr.length; ++i) {
				console.log(arr[i])
			}
}


main();
