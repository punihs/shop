const randomNumber = parseInt(Math.random() * (1000 - 100), 10);
// Todo: length of code
exports.generateVirtualAddressCode = () => `SHPR${randomNumber}${randomNumber + 100}`;
