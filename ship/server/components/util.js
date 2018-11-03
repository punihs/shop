const randomNumberBelow100 = parseInt(Math.random() * (100), 10);
const randomNumberBelow1000 = parseInt(Math.random() * (1000 - 100), 10);
exports.generateVirtualAddressCode = () => `SHPR${randomNumberBelow100}-${randomNumberBelow1000 + 100}`;
