module.exports = {
  addressStringify(address) {
    let toAddress = address.line1;
    if (address.line2) toAddress += `, ${address.line2}`;

    toAddress += `, ${address.city}`;
    toAddress += `, ${address.state}`;
    toAddress += `, ${address.Country.name}`;
    if (address.pincode) toAddress += `, ${address.pincode}`;
    return toAddress;
  },
};
