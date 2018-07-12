class EmpanelmentController {
  constructor($http, $stateParams, URLS, $sce, $state, Page, $timeout,
              Session, Auth, toaster, $uibModal) {
    this.URLS = URLS;
    this.$sce = $sce;
    this.$http = $http;
    this.$state = $state;
    this.Page = Page;
    this.Session = Session;
    this.$uibModal = $uibModal;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.Auth = Auth;
    this.$timeout = $timeout;
    this.onInit();
  }

  onInit() {
    this.branch_details = [];
    this.nonItSource = [];
    this.itSource = [];
    this.functionList = [];
    this.forms = [];
    this.activeTab = 0;
    this.steps = [false, false, false, false];
    this.user = this.Session.read('userinfo');

    this.ui = Object.assign({
      ctc: true,
      pref: true,
      industry: true,
      func: true,
      pullSave: true,
      accounts: true,
      redirect: true,
      city: true,
    }, this.uiConf || {});

    this.EmployeeRange = [
      { name: '1', value: '1' },
      { name: '2-10', value: '2-10' },
      { name: '11-50', value: '11-50' },
      { name: '51-200', value: '51-200' },
      { name: '201-500', value: '201-500' },
      { name: '501-1000', value: '501-1000' },
      { name: '1001-5000', value: '1001-5000' },
      { name: '5001-10000', value: '5001-10000' },
      { name: '10000+', value: '10001-100000' },
    ];

    this.PortalSource = [
      { name: 'Naukri', selected: false },
      { name: 'Monster', selected: false },
      { name: 'Shine', selected: false },
      { name: 'Times', selected: false },
      { name: 'Indeed', selected: false },
      { name: 'Quikr', selected: false },
    ];

    this.showLink = 0;
    this.showConfirm = false;
    this.data = {};

    this.regions = {
      select: ($item, flag) => ($item.id
        ? this
          .select('branch_details', 'location_id', 'regions', $item, { isRequired: flag })
        : ''),
      getList: (q, form) => this
        .$http
        .get('/search/regions', { params: { q } })
        .then(({ data: { items = [] } }) => {
          if (!items.length) {
            this.$timeout(() => {
              this.region_id = '';
              form.$setValidity('required', false);
            }, 0);
          }

          return items;
        }),
    };

    this.industries = {
      list: [],
      select: (industryId, type) => {
        this.industries[type] = false;
        if (!industryId) return;

        if (this[type].length === 3) {
          this.industries[type] = true;
          return;
        }

        this.industries.list.forEach((value) => {
          if (value.id === industryId) {
            this
              .select(type, 'industries_id', 'industries', value);
          }
        });
      },
      nonItSource: false,
      itSource: false,
    };

    this.functions = {
      list: [],
      select: (functionId, type) => {
        this.functions.error = false;
        if (!functionId) return;

        if (this[type].length === 3) {
          this.functions.error = true;
          return;
        }

        this.functions.list.forEach((value) => {
          if (value.id === functionId) {
            this
              .select(type, 'function_id', 'functions', value);
          }
        });
      },
      error: false,
    };

    this
      .$http
      .get('/clients/preferences')
      .then(({ data }) => {
        const { functionList, industryList } = data;
        this.functions.list = functionList;
        this.industries.list = industryList;
      });

    return this
      .$http.get('/clients/empanelment')
      .then(({ data }) => {
        this.data = data || {};
        this.data.uploadedFiles = [];
      })
      .catch(() => this
        .toaster.pop('info', 'Please fill out empanelment form'));
  }

  select(model, field, endpoint, $item, extend = {}) {
    this[endpoint].model = '';
    const data = { name: $item.name };
    data[field] = $item.id;
    data.selected = !$item.selected;

    this[model].push(Object.assign(data, extend));
  }

  update() {
    this.reload = false;
    const [minEmp, maxEmp] = this.employee_strength.split('-');
    const { company_name, number } = this.user;
    Object.assign(this.data, {
      min_emp: minEmp,
      max_emp: maxEmp,
      company_reg_name: company_name,
      contact_number: number,
    });
    if (this.data.entity_type === 'Freelancer') {
      this.data.client_ref_1 =
        `${this.reference_name1},${this.reference_number1},${this.reference_email_id1}`;
      this.data.client_ref_2 =
        `${this.reference_name2},${this.reference_number2},${this.reference_email_id2}`;
    }
    if (this.nonItSource) {
      this.data.non_it_industries = this.nonItSource.map((y) => y.name).join(',');
    }
    if (this.itSource) {
      this.data.it_industries = this.itSource.map((y) => y.name).join(',');
    }
    if (this.functionList) {
      this.data.non_it_functions = this.functionList.map((y) => y.name).join(',');
    }
    if (this.PortalSource) {
      this.data.portal_source = this
        .PortalSource.filter((x) => x.selected).map((y) => y.name).join(',');
    }

    if (this.branch_details) {
      this.data.number_of_branch = this.branch_details.length;
      this.data.branch_details = this
        .branch_details.filter((x) => x.selected).map((y) => y.name).join(',');
    }

    this
      .$http.post('/clients/empanelment', this.data)
      .then(() => this
        .Auth
        .setSessionData()
        .then(() => {
          this.toaster.pop('success', 'Thank you for providing details.');
          this.reload = true;
          if (!document.getElementById('qx-installed')) {
            return this.$state.go('accounts.download-extension');
          }
          return this.$state.go('customers.list', { status: 'New' });
        })
      )
      .catch(() => this
        .toaster.pop('error', 'Error occurred while updating record, please contact ShoppRe.com.'));
  }

  stepNext(currentStep) {
    const nextStep = currentStep + 1;
    this.steps[nextStep] = true;
    this.activeTab = nextStep;
  }

  uploadToDrive(id) {
    const driveModal = this.$uibModal.open({
      templateUrl: 'app/directives/drive/drive.html',
      controller: 'DriveController',
      controllerAs: '$ctrl',
      windowTopClass: 'm-t-xxl',
      size: 'md m-t-xxl',
      bindToController: true,
      resolve: {
        id() {
          return id;
        },
      },
    });
    driveModal.result.then(file => this.data.uploadedFiles.push(file));
  }
}

angular.module('uiGenApp')
  .controller('EmpanelmentController', EmpanelmentController);
