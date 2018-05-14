const usaEco = {
  '5 to 10': 430,
  '10 to 15': 380,
  '15 to 20': 368,
  '20 to 30': 345,
  '30 to 50': 343,
  '50 to 70': 343,
  '70 to 100': 342,
  '100 to 100000': 342,
};


module.exports = ({ weight, country }) => {
  if (country !== 'US' || weight <= 5) return null;

  let baseRate;

  Object.keys(usaEco).some((fromTo) => {
    const [from, to] = fromTo.split(' to ');
    if (weight > from && weight <= to) {
      baseRate = usaEco[fromTo];
      return true;
    }
    return false;
  });

  return baseRate * weight;
};
