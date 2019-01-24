class PricingIndexController {
  constructor(
    $http, Page, $httpParamSerializer) {
    this.$http = $http;
    this.Page = Page;
    this.$httpParamSerializer = $httpParamSerializer;
    return this.$onInit();
  }

  $onInit() {
    this.prices = [];
    this.packageType = [{ types: 'doc' }, { types: 'nondoc' }];

    this.$http.get('/countries?limit=500')
      .then(({ data: countries }) => {
        this.countries = countries;
      });
  }
  getPrice() {
    const params = {
      country: this.data.countryCode,
      type: this.data.packageType,
      weight: this.data.weight,
      all: true,
    };

    const qs = this.$httpParamSerializer(params);

    this.$http.get(`%/api/pricing?${qs}`)
      .then(({ data: { prices } }) => {
        if (prices) {
          this.prices = prices;
        } else {
          this.prices = null;
        }
      }).catch((e) => {
        this.prices = null;
      });
  }
}

angular
  .module('uiGenApp')
  .controller('PricingIndexController', PricingIndexController);
