const countries = require('./data/fedex.country_codes');

const data = {
  doc: [
    {
      weight: 0.5,
      A: 902,
      B: 889,
      C: 1080,
      D: 1060,
      E: 1084,
      F: 969,
      G: 1004,
      H: 1179,
      I: 1203,
      J: 1352,
      K: 1559,
      L: 1142,
      M: 936,
      N: 1727,
      O: 1727,
      P: 1727,
      Q: 1727,
    },
    {
      weight: 1,
      A: 1032,
      B: 1117,
      C: 1311,
      D: 1269,
      E: 1322,
      F: 1121,
      G: 1157,
      H: 1420,
      I: 1441,
      J: 1651,
      K: 1749,
      L: 1317,
      M: 1071,
      N: 1938,
      O: 1938,
      P: 1938,
      Q: 1938,
    },
    {
      weight: 1.5,
      A: 1178,
      B: 1346,
      C: 1542,
      D: 1497,
      E: 1559,
      F: 1273,
      G: 1311,
      H: 1662,
      I: 1746,
      J: 1931,
      K: 1939,
      L: 1491,
      M: 1222,
      N: 2148,
      O: 2148,
      P: 2148,
      Q: 2148,
    },
    {
      weight: 2,
      A: 1324,
      B: 1574,
      C: 1774,
      D: 1725,
      E: 1808,
      F: 1425,
      G: 1464,
      H: 1904,
      I: 2046,
      J: 2198,
      K: 2128,
      L: 1682,
      M: 1373,
      N: 2358,
      O: 2358,
      P: 2358,
      Q: 2358,
    },
    {
      weight: 2.5,
      A: 1470,
      B: 1803,
      C: 2005,
      D: 1953,
      E: 2072,
      F: 1578,
      G: 1617,
      H: 2146,
      I: 2345,
      J: 2400,
      K: 2318,
      L: 1906,
      M: 1524,
      N: 2569,
      O: 2569,
      P: 2569,
      Q: 2569,
    },
  ],
  nondoc: [
    {
      weight: 0.5,
      A: 987,
      B: 1018,
      C: 1184,
      D: 1122,
      E: 1249,
      F: 1029,
      G: 1040,
      H: 1277,
      I: 1380,
      J: 1559,
      K: 1711,
      L: 1176,
      M: 1046,
      N: 1880,
      O: 1880,
      P: 1880,
      Q: 1880,
    },
    {
      weight: 1,
      A: 1134,
      B: 1120,
      C: 1356,
      D: 1288,
      E: 1322,
      F: 1128,
      G: 1206,
      H: 1424,
      I: 1602,
      J: 1871,
      K: 1888,
      L: 1349,
      M: 1193,
      N: 2039,
      O: 2039,
      P: 2039,
      Q: 2039,
    },
    {
      weight: 1.5,
      A: 1299,
      B: 1355,
      C: 1595,
      D: 1519,
      E: 1547,
      F: 1281,
      G: 1366,
      H: 1674,
      I: 1914,
      J: 2116,
      K: 2103,
      L: 1528,
      M: 1367,
      N: 2271,
      O: 2271,
      P: 2271,
      Q: 2271,
    },
    {
      weight: 2,
      A: 1465,
      B: 1589,
      C: 1834,
      D: 1749,
      E: 1772,
      F: 1434,
      G: 1525,
      H: 1924,
      I: 2223,
      J: 2329,
      K: 2318,
      L: 1707,
      M: 1542,
      N: 2503,
      O: 2503,
      P: 2503,
      Q: 2503,
    },
    {
      weight: 2.5,
      A: 1631,
      B: 1824,
      C: 2074,
      D: 1979,
      E: 1996,
      F: 1587,
      G: 1685,
      H: 2174,
      I: 2531,
      J: 2543,
      K: 2533,
      L: 1885,
      M: 1716,
      N: 2810,
      O: 2735,
      P: 2735,
      Q: 2735,
    },
    {
      weight: 3,
      A: 2015,
      B: 2118,
      C: 2250,
      D: 2113,
      E: 2426,
      F: 1854,
      G: 1881,
      H: 2081,
      I: 2526,
      J: 2916,
      K: 2467,
      L: 1958,
      M: 1788,
      N: 3206,
      O: 2518,
      P: 2518,
      Q: 2518,
    },
    {
      weight: 3.5,
      A: 2156,
      B: 2210,
      C: 2382,
      D: 2246,
      E: 2629,
      F: 2001,
      G: 2027,
      H: 2269,
      I: 2724,
      J: 3120,
      K: 2755,
      L: 2111,
      M: 1899,
      N: 3504,
      O: 2752,
      P: 2752,
      Q: 2752,
    },
    {
      weight: 4,
      A: 2296,
      B: 2302,
      C: 2509,
      D: 2379,
      E: 2827,
      F: 2141,
      G: 2174,
      H: 2456,
      I: 2923,
      J: 3324,
      K: 3041,
      L: 2263,
      M: 2010,
      N: 3801,
      O: 2985,
      P: 2985,
      Q: 2985,
    },
    {
      weight: 4.5,
      A: 2435,
      B: 2394,
      C: 2633,
      D: 2512,
      E: 3022,
      F: 2251,
      G: 2320,
      H: 2644,
      I: 3122,
      J: 3528,
      K: 3325,
      L: 2416,
      M: 2120,
      N: 4099,
      O: 3219,
      P: 3219,
      Q: 3219,
    },
    {
      weight: 5,
      A: 2575,
      B: 2519,
      C: 2754,
      D: 2644,
      E: 3183,
      F: 2445,
      G: 'hu',
      H: 2831,
      I: 3320,
      J: 3732,
      K: 3607,
      L: 2568,
      M: 2231,
      N: 4396,
      O: 3453,
      P: 3453,
      Q: 3453,
    },
    {
      weight: 5.5,
      A: 2936,
      B: 3547,
      C: 3446,
      D: 3490,
      E: 3919,
      F: 2545,
      G: 2808,
      H: 3522,
      I: 3938,
      J: 4790,
      K: 5388,
      L: 2892,
      M: 2604,
      N: 5952,
      O: 4960,
      P: 4960,
      Q: 4960,
    },
    {
      weight: 6,
      A: 3081,
      B: 3735,
      C: 3615,
      D: 3635,
      E: 4087,
      F: 2569,
      G: 2938,
      H: 3624,
      I: 4161,
      J: 5052,
      K: 5703,
      L: 3026,
      M: 2721,
      N: 6239,
      O: 5199,
      P: 5199,
      Q: 5199,
    },
    {
      weight: 6.5,
      A: 3226,
      B: 3923,
      C: 3783,
      D: 3779,
      E: 4255,
      F: 2690,
      G: 3068,
      H: 3727,
      I: 4384,
      J: 5314,
      K: 6016,
      L: 3160,
      M: 2838,
      N: 6525,
      O: 5438,
      P: 5438,
      Q: 5438,
    },
    {
      weight: 7,
      A: 3505,
      B: 4274,
      C: 4110,
      D: 4080,
      E: 4422,
      F: 2811,
      G: 3198,
      H: 3982,
      I: 4791,
      J: 5799,
      K: 6580,
      L: 3425,
      M: 3074,
      N: 7085,
      O: 5904,
      P: 5904,
      Q: 5904,
    },
    {
      weight: 7.5,
      A: 3646,
      B: 4469,
      C: 4285,
      D: 4229,
      E: 4590,
      F: 3023,
      G: 3328,
      H: 4089,
      I: 5023,
      J: 6071,
      K: 6902,
      L: 3565,
      M: 3196,
      N: 7383,
      O: 6153,
      P: 6153,
      Q: 6153,
    },
    {
      weight: 8,
      A: 3785,
      B: 4663,
      C: 4460,
      D: 4379,
      E: 4758,
      F: 3148,
      G: 3458,
      H: 4195,
      I: 5254,
      J: 6344,
      K: 7205,
      L: 3704,
      M: 3318,
      N: 7682,
      O: 6401,
      P: 6401,
      Q: 6401,
    },
    {
      weight: 8.5,
      A: 3924,
      B: 4838,
      C: 4627,
      D: 4529,
      E: 4925,
      F: 3272,
      G: 3588,
      H: 4302,
      I: 5486,
      J: 6616,
      K: 7482,
      L: 3843,
      M: 3440,
      N: 7980,
      O: 6650,
      P: 6650,
      Q: 6650,
    },
    {
      weight: 9,
      A: 4063,
      B: 5014,
      C: 4794,
      D: 4679,
      E: 5093,
      F: 3266,
      G: 3718,
      H: 4408,
      I: 5718,
      J: 6889,
      K: 7759,
      L: 3982,
      M: 3561,
      N: 8278,
      O: 6899,
      P: 6899,
      Q: 6899,
    },
    {
      weight: 9.5,
      A: 4202,
      B: 5189,
      C: 4961,
      D: 4829,
      E: 5261,
      F: 3386,
      G: 3848,
      H: 4515,
      I: 5950,
      J: 7161,
      K: 8036,
      L: 4121,
      M: 3683,
      N: 8577,
      O: 7147,
      P: 7147,
      Q: 7147,
    },
    {
      weight: 10,
      A: 4342,
      B: 5365,
      C: 5128,
      D: 4979,
      E: 5428,
      F: 3615,
      G: 3978,
      H: 4621,
      I: 6182,
      J: 7434,
      K: 8313,
      L: 4260,
      M: 3805,
      N: 8875,
      O: 7396,
      P: 7396,
      Q: 7396,
    },
    {
      weight: 10.5,
      A: 4505,
      B: 5517,
      C: 5261,
      D: 5152,
      E: 5606,
      F: 3785,
      G: 4477,
      H: 5180,
      I: 6464,
      J: 7832,
      K: 8558,
      L: 4848,
      M: 3950,
      N: 9249,
      O: 7707,
      P: 7707,
      Q: 7707,
    },
    {
      weight: 11,
      A: 4600,
      B: 5616,
      C: 5362,
      D: 5277,
      E: 5780,
      F: 3796,
      G: 4643,
      H: 5354,
      I: 6687,
      J: 8139,
      K: 8740,
      L: 5028,
      M: 4060,
      N: 9537,
      O: 7948,
      P: 7948,
      Q: 7948,
    },
    {
      weight: 11.5,
      A: 4695,
      B: 5711,
      C: 5464,
      D: 5403,
      E: 5954,
      F: 3953,
      G: 4810,
      H: 5528,
      I: 6909,
      J: 8447,
      K: 8919,
      L: 5209,
      M: 4171,
      N: 9826,
      O: 8188,
      P: 8188,
      Q: 8188,
    },
    {
      weight: 12,
      A: 4789,
      B: 5862,
      C: 5565,
      D: 5528,
      E: 6128,
      F: 4110,
      G: 4977,
      H: 5702,
      I: 7132,
      J: 8754,
      K: 9095,
      L: 5390,
      M: 4281,
      N: 10114,
      O: 8429,
      P: 8429,
      Q: 8429,
    },
    {
      weight: 12.5,
      A: 4881,
      B: 6025,
      C: 5667,
      D: 5653,
      E: 6303,
      F: 4266,
      G: 5144,
      H: 5876,
      I: 7355,
      J: 9062,
      K: 9267,
      L: 5570,
      M: 4391,
      N: 10403,
      O: 8669,
      P: 8669,
      Q: 8669,
    },
    {
      weight: 13,
      A: 4973,
      B: 6188,
      C: 5768,
      D: 5778,
      E: 6477,
      F: 4410,
      G: 5311,
      H: 6050,
      I: 7577,
      J: 9369,
      K: 9407,
      L: 5751,
      M: 4501,
      N: 10691,
      O: 8909,
      P: 8909,
      Q: 8909,
    },
    {
      weight: 13.5,
      A: 5063,
      B: 6352,
      C: 5869,
      D: 5904,
      E: 6651,
      F: 4553,
      G: 5477,
      H: 6224,
      I: 7800,
      J: 9676,
      K: 9571,
      L: 5932,
      M: 4612,
      N: 10980,
      O: 9150,
      P: 9150,
      Q: 9150,
    },
    {
      weight: 14,
      A: 5153,
      B: 6515,
      C: 5970,
      D: 6029,
      E: 6825,
      F: 4697,
      G: 5644,
      H: 6398,
      I: 8023,
      J: 9984,
      K: 9733,
      L: 6112,
      M: 4722,
      N: 11268,
      O: 9390,
      P: 9390,
      Q: 9390,
    },
    {
      weight: 14.5,
      A: 5241,
      B: 6678,
      C: 6071,
      D: 6154,
      E: 6999,
      F: 4840,
      G: 5811,
      H: 6572,
      I: 8245,
      J: 10291,
      K: 9891,
      L: 6293,
      M: 4832,
      N: 11557,
      O: 9631,
      P: 9631,
      Q: 9631,
    },
    {
      weight: 15,
      A: 5329,
      B: 6842,
      C: 6172,
      D: 6284,
      E: 7173,
      F: 4919,
      G: 5978,
      H: 6746,
      I: 8468,
      J: 10599,
      K: 10046,
      L: 6474,
      M: 4942,
      N: 11845,
      O: 9871,
      P: 9871,
      Q: 9871,
    },
    {
      weight: 15.5,
      A: 5547,
      B: 7072,
      C: 6435,
      D: 6497,
      E: 7347,
      F: 5060,
      G: 6145,
      H: 6986,
      I: 8773,
      J: 11010,
      K: 10482,
      L: 6718,
      M: 5101,
      N: 12249,
      O: 10208,
      P: 10208,
      Q: 10208,
    },
    {
      weight: 16,
      A: 5713,
      B: 7237,
      C: 6633,
      D: 6650,
      E: 7521,
      F: 5202,
      G: 6312,
      H: 7161,
      I: 8998,
      J: 11320,
      K: 10852,
      L: 6900,
      M: 5212,
      N: 12541,
      O: 10451,
      P: 10451,
      Q: 10451,
    },
    {
      weight: 16.5,
      A: 5877,
      B: 7402,
      C: 6827,
      D: 6803,
      E: 7695,
      F: 5344,
      G: 6478,
      H: 7337,
      I: 9223,
      J: 11631,
      K: 11217,
      L: 7082,
      M: 5324,
      N: 12832,
      O: 10693,
      P: 10693,
      Q: 10693,
    },
    {
      weight: 17,
      A: 6039,
      B: 7567,
      C: 7016,
      D: 6956,
      E: 7870,
      F: 5485,
      G: 6645,
      H: 7513,
      I: 9448,
      J: 11941,
      K: 11578,
      L: 7265,
      M: 5435,
      N: 13123,
      O: 10936,
      P: 10936,
      Q: 10936,
    },
    {
      weight: 17.5,
      A: 6200,
      B: 7731,
      C: 7201,
      D: 7108,
      E: 8044,
      F: 5627,
      G: 6812,
      H: 7688,
      I: 9673,
      J: 12252,
      K: 11935,
      L: 7447,
      M: 5546,
      N: 13414,
      O: 11179,
      P: 11179,
      Q: 11179,
    },
    {
      weight: 18,
      A: 6360,
      B: 7896,
      C: 7332,
      D: 7260,
      E: 8218,
      F: 5769,
      G: 6979,
      H: 7864,
      I: 9898,
      J: 12562,
      K: 12290,
      L: 7629,
      M: 5658,
      N: 13705,
      O: 11421,
      P: 11421,
      Q: 11421,
    },
    {
      weight: 18.5,
      A: 6519,
      B: 8061,
      C: 7452,
      D: 7412,
      E: 8392,
      F: 5910,
      G: 7146,
      H: 8040,
      I: 10122,
      J: 12872,
      K: 12641,
      L: 7812,
      M: 5769,
      N: 13997,
      O: 11664,
      P: 11664,
      Q: 11664,
    },
    {
      weight: 19,
      A: 6677,
      B: 8252,
      C: 7573,
      D: 7564,
      E: 8566,
      F: 6052,
      G: 7312,
      H: 8216,
      I: 10347,
      J: 13183,
      K: 12990,
      L: 7994,
      M: 5880,
      N: 14288,
      O: 11907,
      P: 11907,
      Q: 11907,
    },
    {
      weight: 19.5,
      A: 6834,
      B: 8479,
      C: 7693,
      D: 7715,
      E: 8740,
      F: 6194,
      G: 7479,
      H: 8391,
      I: 10572,
      J: 13493,
      K: 13337,
      L: 8177,
      M: 5992,
      N: 14579,
      O: 12149,
      P: 12149,
      Q: 12149,
    },
    {
      weight: 20,
      A: 6963,
      B: 8704,
      C: 7813,
      D: 7866,
      E: 8914,
      F: 6335,
      G: 7646,
      H: 8567,
      I: 10797,
      J: 13803,
      K: 13681,
      L: 8359,
      M: 6103,
      N: 14870,
      O: 12392,
      P: 12392,
      Q: 12392,
    },
  ],
};
module.exports = function getPrice({ country, type, weight }) {
  const ctry = countries.find(x => (x.country_code === country));

  const priceRow = data[type].find(x => (x.weight === weight));

  return priceRow[ctry.fedex];
};
