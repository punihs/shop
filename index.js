const fs = require('fs');
const csv = require('csvtojson')
const output = [];
let last = 0;

csv()
    .fromString(fs.readFileSync('./doc.json-pricing.csv').toString())
    .on('json', (kgrow) => { // this func will be called 3 times
        // console.log(kgrow)
        const to = kgrow.DOC;
        delete kgrow.DOC;

        Object.keys(kgrow).forEach(zone => output.push({
            from: Number(last),
            to: Number(to),
            zone: Number(zone),
            rate: Number(kgrow[zone]),
        }))
        last = to;
    })
    .on('done', () => {
        //parsing finished
        console.log(output)
    })


