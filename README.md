# Lenovo Outlet Scraper
## About
This project is a tool that fetches laptop deals from the Lenovo US Outlet and returns a JSON with data to standard output.

## Getting started
### Requirements
* [Node.js](https://nodejs.org/en/) (tested on v13.6.0)

### Setup
Clone the repository and install dependencies.
```
git clone https://github.com/hajekjiri/lenovo-outlet-scraper.git
cd lenovo-outlet-scraper
npm install
```

### Running the scraper
You can either use the incuded *app* `npm-run-script` or run main.js directly.

#### Using the `npm-run-script`
```
npm run app --silent -- <args>
```

#### Running main.js
```
node ./src/main.js <args>
```

#### Options
##### --help
Show list of options
##### --version
Show version number
##### --no-out-of-stock
Ignore laptops that are out of stock
##### --no-refurbished
Ignore refurbished laptops
##### --no-new
Ignore new laptops

### Development
#### Additional requirements
* [npx](https://www.npmjs.com/package/npx)
```
npm install -g npx
```

#### Testing
[Mocha](https://mochajs.org/) is the framework of choice for testing. All tests are located in the `test` folder. Use the *test* `npm-run-script` to run tests.
```
npm run test
```

#### Code style
This project is following the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html). Use the *lint* `npm-run-script` to check whether the code is compliant.
```
npm run lint
```

### Documentation
Documentation can be generated with the *doc* `npm-run-script` using [JSDoc](https://jsdoc.app/) and then accessed at `docs/index.html`.
```
npm run doc
```
