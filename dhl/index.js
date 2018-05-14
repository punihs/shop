const doc = require('./doc.json')
const nondoc = require('./nondoc.json')


let last = 0;

const getDb = (doc) => {
    return doc.reduce((nxt, kgrow) => {
        const { weight } = kgrow;
        delete kgrow.weight;
        delete kgrow.type;
        return nxt.concat(Object.keys(kgrow).map(zone => ({
            from: Number(last),
            to: Number(weight),
            zone: Number(zone),
            rate: Number(kgrow[zone]),
        })))
    }, [])
}

const docout = getDb(doc)
const nondocout = getDb(nondoc)

console.log(docout.concat(nondocout))