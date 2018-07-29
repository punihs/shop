class HHLeadController {
  /* @ngInject */
  constructor($state, $http, $timeout, Session, Page, URLS) {
    this.$state = $state;
    this.$http = $http;
    this.$timeout = $timeout;
    this.Session = Session;
    this.Page = Page;
    this.URLS = URLS;
    this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('HeadHonchos Services');
    this.ui = {
      alerts: {},
      colors: { error: 'bg-danger  lter', success: 'bg-success', warning: 'bg-warning lter' },
      logos: {
        error: 'fa-times-circle', success: 'fa-check-circle', warning: 'fa-exclamation-circle',
      },
    };
    this.services = [
      { id: 1, name: 'Education Courses' }, { id: 2, name: 'Linkedin' },
      { id: 3, name: 'Coaching' }, { id: 4, name: 'Personal branding' },
      { id: 5, name: 'Resume' }, { id: 6, name: 'Other' },
    ];
    this.data = { services: '' };
  }

  alert(type, msg) {
    this.loading = false;
    this.ui.alerts[type] = msg;
    this.$timeout(() => (this.ui.alerts[type] = ''), 5000);
  }

  selectService(service) {
    if (service.id === 8) this.is_other = service.checked;
    this.data.services = this.services.filter((x) => x.checked).map((y) => y.name).join(',');
  }

  reset(form) {
    this.data = null;
    this.ui.other = null;
    this.services.map((x) => Object.assign(x, { checked: null }));
    form.$setPristine();
  }

  create(form) {
    this.loading = true;

    if (this.data.services.includes('Other')) {
      this.data.services = this.data.services.replace('Other', this.ui.other);
    }

    this
      .$http
      .post('/hhleads', this.data)
      .then(() => {
        this.reset(form);
        this.alert('success', 'Successfully Submitted');
      })
      .catch(({ data: { message }, status }) => {
        if (status === 409) return this.alert('warning', message);

        return this.alert('error', message || 'An Error occured, please contact Quezx.com');
      });
  }
}

angular.module('uiGenApp')
  .controller('HHLeadController', HHLeadController);
