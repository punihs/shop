/***
 * factors doc will become non doc after doc limits
 * @type {string}
 */

const getPrice = require('./getPrice');

const country = 'US'; // All existing countries in DHL DB

const weight  = 30; // 0.1 - ~

const type = 'nondoc'; // doc | nondoc

const price = getPrice({
    country,
    weight,
    type
});

console.log(price)


