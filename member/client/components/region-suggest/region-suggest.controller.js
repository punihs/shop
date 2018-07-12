class RegionSuggestController {
  /* @ngInject */
  constructor($state, $http) {
    this.$state = $state;
    this.$http = $http;
    this.$onInit();
  }

  $onInit() {
    this.noResults = false;
    this.loadingRegions = false;
  }


  select($item) {
    this.regionId = $item.id;
    this.regionName = $item.name;
    this.previousValue = $item.name;
  }

  setId() {
    const [region] = (this.lastSearchResults || [])
      .filter(item => (item.region.toLowerCase() === this.regionName.toLowerCase()));
    if (region) this.select(region);
  }

  blur() {
    if (!this.lastSearchResults) {
      return this.get(this.regionName).then(() => this.setId());
    }
    return this.setId();
  }

  getList(search, form) {
    return this.$http
      .get('/search?type=regions', { params: { q: search } })
      .then(({ data }) => {
        if (!data.length) {
          this.regionId = '';
          form.$setValidity('required', false);
        }
        this.lastSearchResults = data;
        return data.map(reg => {
          const region = reg;
          region.name = region.alias;
          return region;
        });
      });
  }
}

angular
  .module('uiGenApp')
  .controller('RegionSuggestController', RegionSuggestController);
