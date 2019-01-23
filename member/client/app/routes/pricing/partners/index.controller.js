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
        console.log(prices);
        this.prices = prices;
      });
  }
}

angular
  .module('uiGenApp')
  .controller('PricingIndexController', PricingIndexController);
