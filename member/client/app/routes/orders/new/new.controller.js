angular.module('uiGenApp')
  .controller('OrderNewController', function NewJobCtrl(
    Page, Restangular, $state, moment, Upload, URLS, $stateParams, currentJob, $filter,
    QCONFIG, prescreen, $timeout, $window, $http, Session, $log
  ) {
    if (!$stateParams.jobId) return;
    if (!currentJob) return $state.go('job.orders.list', { jobId: $stateParams.jobId });

    if (currentJob.job_status === 'Closed' || currentJob.job_status === 'Hold') {
      return $state.go('job.orders.list', { jobId: $stateParams.jobId });
    }

    Page.setTitle('Upload CV');
    const vm = this;
    this.Session = Session;
    vm.submitting = false;
    vm.prescreen = prescreen;
    vm.buckets = QCONFIG.ORDER_STATES;
    vm.job = currentJob;
    vm.dateOptions = { minDate: new Date() };
    vm.data = {
      total_exp: 0,
      OrderSummary: {},
    };

    vm.openOrder = (id) => $window.parent.postMessage({ type: 'TOGGLE_PANEL', id }, '*');
    $window.parent.postMessage({ type: 'GET_SCRAP' }, '*');
    $window.onmessage = (e) => {
      if (e.data.type !== 'SCRAP_DATA') return;
      const { file: { base64, filename } = {}, data } = e.data.data;
      const { degree, designation, employer, region } = data;
      [
        'email_id', 'expected_ctc', 'name', 'notice_period', 'number',
        'salary', 'total_exp_y', 'total_exp_m', 'source_url',
      ].forEach(key => (vm.data[key] = data[key]));
      vm.data.order_source_id = data.order_source_id || 9;
      vm.Degrees.model = degree;
      vm.Designations.model = designation;
      vm.Employers.model = employer;
      vm.Regions.model = region;

      const elms = [].reverse.call($('form[name="uploadCVForm"] input'));
      [].map.call(elms, elm => $timeout(() => elm.focus(), 0));
      $timeout(() => $window.scrollTo(0, 0), 0);

      if (base64) {
        const [mime, base64String] = base64.split(',');
        const type = mime.match(/:(.*?);/)[1];
        const bin = atob(base64String);
        let len = bin.length;
        const u8 = new Uint8Array(len);
        while (len--) {
          u8[len] = bin.charCodeAt(len);
        }
        vm.data.file = new File([u8], filename, { type });
      }
    };

    vm.Regions = {
      select($item) {
        vm.data.region_id = $item.id;
        vm.Regions.model = $item.name;
        vm.Regions.previousValue = $item.name;
      },

      setId() {
        const [region] = (vm.Regions.lastSearchResults || [])
          .filter(item => (item.region.toLowerCase() === vm.Regions.model.toLowerCase()));
        if (region) vm.Regions.select(region);
      },

      blur() {
        if (!vm.Regions.lastSearchResults) {
          return vm.Regions.get(vm.Regions.model).then(() => vm.Regions.setId());
        }
        return vm.Regions.setId();
      },

      get(search) {
        return Restangular
          .all('search')
          .getList({
            type: 'regions',
            q: search,
          })
          .then(response => {
            vm.Regions.lastSearchResults = response;
            return response.map(reg => {
              const region = reg;
              region.name = region.alias;
              return region;
            });
          });
      },

      noResults: false,
      loadingRegions: false,
    };

    vm.Degrees = {
      select: function selectDegree($item) {
        vm.data.degree_id = $item.id;
        vm.Degrees.model = $item.name;
        vm.Degrees.previousValue = $item.name;
      },
      blur: function checkDegree() {
        if (vm.Degrees.model === ' ') vm.Degrees.model = '';
        setTimeout(() => {
          if (vm.Degrees.previousValue !== vm.Degrees.model) {
            vm.Degrees.create(vm.Degrees.model);
          }
        }, 1000);
      },
      get: function getDegree(search, limit = 10) {
        const addNew = (list) => (list.some(l => l.toLowerCase() === search.toLowerCase())
          ? list
          : list.concat($filter('prefixCreate')(search, 1)));

        const filterLimit = (list) => $filter('filter')(list, search).slice(0, limit);

        if (vm.Degrees.list) return addNew(filterLimit(vm.Degrees.list));

        return $http
          .get('https://cdn.quezx.com/typeaheads/qualifications_020118.json', { ignoreAuthModule: true })
          .then(({ data }) => {
            vm.Session.create('qualifications_020118', data);
            vm.Degrees.list = data;
            return addNew(filterLimit(vm.Degrees.list));
          });
      },

      create: function createDegree(name) {
        return $http
          .post('/degrees', { name: name.replace('Add new: ', '') })
          .then(({ data }) => vm.Degrees.select(data))
          .catch(({ data, status }) => {
            if (status === 409) vm.Degrees.select(data);
          });
      },
      noResults: false,
      loadingDegrees: false,
      list: vm.Session.read('qualifications_020118'),
    };

    vm.Employers = {
      select: function selectEmployer($item) {
        if ($item.id) { // if item found but item.id not found, then its coming from CREATE options in autocomplete
          vm.data.employer_id = $item.id;
          vm.Employers.model = $item.name;
          vm.Employers.previousValue = $item.name;
        } else {
          vm.Employers.create($item);
        }
      },
      blur: function checkEmployer() {
        setTimeout(function () {
          if (vm.Employers.previousValue != vm.Employers.model) {
            var employer = { name:vm.Employers.model };
            vm.Employers.create(employer);
          }
        }, 1000);

      },
      get: function getEmployer(search) {
        return Restangular
          .all('search')
          .getList({ type:'employers', q: search })
          .then((response) => {
            vm.Employers.lastSearchResults = response;
            return (_.pluck(response, 'name')
              .map(i => i.toLocaleLowerCase()))
              .indexOf(search.toLowerCase()) == -1
              ? response.concat([{ name: $filter('prefixCreate')(search, 1) }])
              : response;
          });
      },

      create(employer, required) {
        if ($filter('prefixCreate')(employer.name)) {
          var existInSearch = _.filter(vm.Employers.lastSearchResults, function (item) { return item.name.toLowerCase() == employer.name.toLowerCase(); });
          if (existInSearch.length) {
            vm.Employers.select(existInSearch[0]);
          } else {
            return Restangular
              .all('employers')
              .post({ name: $filter('prefixCreate')(employer.name) })
              .then(function (employer) {
                return vm.Employers.select(employer);
              }).catch(function (err) {
                if (err.status === 409) {
                  vm.Employers.select(err.data);
                } else {
                  console.log('Error while creating employer');
                }
              });
          }
        }
      },
      noResults: false,
      loadingEmployers: false,
    };

    vm.Designations = {
      select: function selectDesignation($item) {
        vm.data.designation_id = $item.id;
        vm.Designations.model = $item.name;
        vm.Designations.previousValue = $item.name;
      },
      blur: function checkDesignation() {
        setTimeout(() => {
          if (vm.Designations.previousValue !== vm.Designations.model) {
            vm.Designations.create(vm.Designations.model);
          }
        }, 1000);
      },
      get: function getDesignation(search, limit = 10) {
        const addNew = (list) => (list.some(l => l.toLowerCase() === search.toLowerCase())
          ? list
          : list.concat($filter('prefixCreate')(search, 1)));
        const filterLimit = (list) => $filter('filter')(list, search).slice(0, limit);

        if (vm.Designations.list) return addNew(filterLimit(vm.Designations.list));

        return $http
          .get('https://cdn.quezx.com/typeaheads/designations_020118.json', { ignoreAuthModule: true })
          .then(({ data }) => {
            vm.Session.create('designations_020118', data);
            vm.Designations.list = data;
            return addNew(filterLimit(vm.Designations.list));
          });
      },

      create(name) {
        return $http
          .post('/designations', { name: name.replace('Add new: ', '') })
          .then(({ data }) => vm.Designations.select(data))
          .catch(({ data, status }) => {
            if (status === 409) vm.Designations.select(data);
          });
      },
      noResults: false,
      loadingDesignations: false,
      list: vm.Session.read('designations_020118'),
    };

    vm.uploadFile = function (jobId, cvfile, payload, successCB, errorCB) {
      return vm.file = cvfile, cvfile ? (Upload.upload({
        url: URLS.API + '/jobs/' + jobId + '/orders',
        data: {
          fileUpload: cvfile,
          payload: JSON.stringify(payload),
        },
      }).then(function (response) {
        return successCB(response);
      }, function (err) {
        return errorCB(err);
        // return b.status > 0 ? vm.errorMsg = b.status + ": " + b.data : void 0
      }, function (progress) {
        // used for progressbar
        return vm.progress = Math.min(100, parseInt(100 * progress.loaded / progress.total));
      })) : errorCB({ data: { message: 'Please choose CV', field: 'file' } });
    };

    const keys = ['name', 'email_id', 'number', 'designation_id',
      'employer_id', 'salary', 'expected_ctc', 'notice_period',
      'total_exp', 'degree_id', 'region_id'];

    const values = ['Candidate Name', 'Email', 'Mobile', 'Designation',
      'Employer', 'Current CTC', 'Expected CTC', 'Notice Period',
      'Total Experiance', 'Highest Qualification', 'Location'];

    if (this.job.is_drive) {
      keys.unshift('scheduled_on');
      values.unshift('Scheduled On');
    }

    function raiseError(errData, uploadCVForm) {
      vm.errorMessage = errData;
      if (errData && errData.field) {
        vm.errorMessage = { data: errData };
        if (errData.field === 'total_exp_m') {
          uploadCVForm.total_exp_m.$setValidity('required', false);
          uploadCVForm.total_exp_y.$setValidity('required', false);
          $('input[name="total_exp_m"]')[0].focus();
          return $('input[name="total_exp_y"]')[0].focus();
        }
        if (uploadCVForm[errData.field]) {
          uploadCVForm[errData.field].$setValidity('required', false);
          $(`input[name="${errData.field}"]`)[0].focus();
          uploadCVForm[errData.field].$setViewValue(uploadCVForm[errData.field].$viewValue);
        }
      } else if (!errData) {
        vm.errorMessage = { data: { message: 'Unexpected Error: Contact Quezx Team.'} };
      }
    }

    vm.valdiateSummary = (uploadCVForm) => {
      const content = vm.data.OrderSummary.content;
      const len = content.length;
      for (let i = 0; i < len; i++) {
        if (content.charCodeAt(i) > 255) {
          uploadCVForm.cv_summary.$setValidity('invalid', false);
          return;
        }
        uploadCVForm.cv_summary.$setValidity('invalid', true);
      }
    };

    function validateForm(form) {
      $stateParams.autofocus = '';
      Object.keys(form).filter(x => !x.startsWith('$')).forEach((f) => {
        if (form[f] && form[f].$invalid) {
          if (!$stateParams.autofocus) $stateParams.autofocus = f;
          form[f].$setDirty();
        }
      });
      return form.$valid;
    };


    vm.create = function (newTab, uploadCVForm) {
      if (vm.submitting) return;
      vm.submitting = true;
      vm.clickUpload = true;
      const form = validateForm(uploadCVForm);

      if (!uploadCVForm.email_id.$touched || !uploadCVForm.number.$touched) {
        vm.submitting = false;
        return raiseError({
          message: 'Please check Email ID & Mobile Number',
        }, uploadCVForm);
      }

      const data = Object.assign({ }, vm.data);
      if (vm.job.is_drive) {
        data.scheduled_on = moment(data.scheduled_on)
          .set('hour', 10)
          .set('minute', 0)
          .set('second', 0)
          .toISOString();
      }

      if(!form) return (vm.submitting = false);
      vm.uploadFile(
        $stateParams.jobId,
        vm.data.file,
        data,
        (response) => {
          const { id } = response.data;
          if ($state.is('extension')) return $state.go('extension', { id });
          return $state.go('order.view', { orderId: id });
        }, (err) => {
          vm.submitting = false;
          return raiseError(err.data, uploadCVForm);
        });
    };

    vm.sendJD = function (user, jobId) {
      $http
        .post(`/jobs/${jobId}/sendJD`, {
          name: user.name,
          email: user.email_id,
          jobId,
        })
        .then(() => {
          this.success = 'JD Sent to Candidate';
          $timeout(() => (this.success = ''), 5000);
        })
        .catch(() => {
          this.error = 'Could not send JD, please contact Quezx.com';
          $timeout(() => (this.error = ''), 5000);
        });
    };
  });
