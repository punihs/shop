class CompanyController {
  constructor($http, toaster, QuarcService) {
    this.$http = $http;
    this.toaster = toaster;
    this.QuarcService = QuarcService;
    this.Page = this.QuarcService.Page;
    this.Page.setTitle('Company Details - My Account');
    this.$onInit();
  }

  $onInit() {
    this
      .$http
      .get('/entityTypes')
      .then(({ data }) => (this.entityTypes = data));

    this
      .$http
      .get('/clients/company')
      .then(({ data }) => {
        this.data = data;
        this.data.regionName = this.data.Region.region;
        this.data.emp_range = (this.data.emp_range === '10000-1000000')
          ? '10000+'
          : this.data.emp_range;
      });

    this
      .$http
      .get('/clients/getEmpRange')
      .then(({ data }) => (this.emp_range = data));
  }

  create() {
    this
      .$http
      .post('/clients/company', this.data)
      .then(() => {
        this.toaster.pop(
          this.QuarcService.toast('success', 'Company details updated successfully!')
        );
      }).catch(() => {
        this.toaster.pop(
          this.QuarcService.toast('error', 'Error occurred while updating the record.')
        );
      });
  }
}

angular.module('uiGenApp')
  .controller('CompanyController', CompanyController);
