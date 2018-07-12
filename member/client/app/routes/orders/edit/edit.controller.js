angular.module('uiGenApp')
  .controller('JobOrderEditController', function JobOrderEditController(QuarcService, Restangular, $state, moment, Upload, URLS, $stateParams, currentJob, currentOrderToEdit, $filter, QCONFIG) {

    const Page = QuarcService.Page;

    Page.setTitle('Upload CV');
    const vm = this;
    vm.buckets = QCONFIG.ORDER_STATES;
    vm.job = currentJob;

    vm.data = currentOrderToEdit;

    vm.Regions = {
      model: currentOrderToEdit.region,
      select: function selectRegion($item) {
        vm.data.region_id = $item.id;
      },

      get: function getRegions(search) {
        return Restangular
          .all('search')
          .getList({
            type: 'regions',
            q: search,
          })
          .then(function gotRegions(response) {
            response.map(location => { location.name = location.alias; return location; })
            return response;
          });
      },

      noResults: false,
      loadingRegions: false,
    };

    vm.Degrees = {
      model: currentOrderToEdit.degree_name,
      select: function selectDegree($item) {
        if ($item.id) {
          vm.data.degree_id = $item.id;
          vm.Degrees.model = $item.name;
          vm.Degrees.previousValue = $item.name;
        } else {
          vm.Degrees.create($item);
        }
      },
      blur: function checkDegree() {
        setTimeout(function () {
          if (vm.Degrees.previousValue != vm.Degrees.model) {
            var degree = { name:vm.Degrees.model };
            vm.Degrees.create(degree);
          }
        }, 1000);
      },
      get: function getDegree(search) {
        return Restangular
          .all('search')
          .getList({ type:'degrees', q: search })
          .then(function gotDegrees(response) {
            return (_.pluck(response, 'name')).indexOf(search) == -1 ? response.concat([{ name:$filter('prefixCreate')(search, 1) }]) : response;
          });
      },

      create: function createDegree(degree, required) {
        return Restangular
          .all('degrees')
          .post({ name:$filter('prefixCreate')(degree.name) })
          .then(function (degree) {
            return vm.Degrees.select(degree);
          }).catch(function (err) {
            if (err.status === 409) {
              vm.Degrees.select(err.data);
            } else {
              console.log('Error while creating degree', err);
            }
          });
      },
      noResults: false,
      loadingDegrees: false,
    };

    vm.Employers = {
      model: currentOrderToEdit.employer_name,
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
          .then(function gotEmployers(response) {
            return (_.pluck(response, 'name')).indexOf(search) == -1 ? response.concat([{ name:$filter('prefixCreate')(search, 1) }]) : response;
          });
      },

      create: function createEmployer(employer, required) {
        return Restangular
          .all('employers')
          .post({ name:$filter('prefixCreate')(employer.name) })
          .then(function (employer) {
            return vm.Employers.select(employer);
          }).catch(function (err) {
            if (err.status === 409) {
              vm.Employers.select(err.data);
            } else {
              console.log('Error while creating employer', err);
            }
          });
      },
      noResults: false,
      loadingEmployers: false,
    };


    vm.Designations = {
      model: currentOrderToEdit.designation_name,
      select: function selectDesignation($item) {
        if ($item.id) {
          vm.data.designation_id = $item.id;
          vm.Designations.model = $item.name;
          vm.Designations.previousValue = $item.name;
        } else {
          vm.Designations.create($item);
        }
      },
      blur: function checkDesignation() {
        setTimeout(function () {
          if (vm.Designations.previousValue != vm.Designations.model) {
            var designation = { name: vm.Designations.model };
            vm.Designations.create(designation);
          }
        }, 1000);
      },
      get: function getDesignation(search) {
        return Restangular
          .all('search')
          .getList({ type:'designations', q: search })
          .then(function gotDesignations(response) {
            return (_.pluck(response, 'name')).indexOf(search) == -1 ? response.concat([{ name:$filter('prefixCreate')(search, 1) }]) : response;
          });
      },

      create: function createDesignation(designation, required) {
        return Restangular
          .all('designations')
          .post({ name:$filter('prefixCreate')(designation.name) })
          .then(function (designation) {
            return vm.Designations.select(designation);
          }).catch(function (err) {
            if (err.status === 409) {
              vm.Designations.select(err.data);
            } else {
              console.log('Error while creating designation', err);
            }
          });
      },
      noResults: false,
      loadingDesignations: false,
    };
    // Remapping Names



    vm.uploadFile = function (jobId, orderId, cvfile, payload, successCB, errorCB) {
      return vm.file = cvfile, cvfile ? (Upload.upload({
        url: URLS.API + '/jobs/' + jobId + '/orders/' + orderId,
        method: 'PUT',
        data: {
          fileUpload: cvfile,
          payload:JSON.stringify(payload),
        },
      }).then(function (response) {
        return successCB(response);
      }, function (err) {
        console.log('Error while uploading file', err);
        return errorCB(err);
        // return b.status > 0 ? vm.errorMsg = b.status + ": " + b.data : void 0
      }, function (progress) {
        // used for progressbar
        return vm.progress = Math.min(100, parseInt(100 * progress.loaded / progress.total));
      })) : Restangular.one('jobs', jobId).one('orders', orderId).customPUT(payload).then(function (response) { return successCB(response); }).catch(function (err) { errorCB(err); });
    };

    const keys = ['name', 'email_id', 'number', 'designation_id',
      'employer_id', 'salary', 'expected_ctc', 'notice_period',
      'total_exp', 'degree_id', 'region_id'];

    const values = ['Candidate Name', 'Email', 'Mobile', 'Designation',
      'Employer', 'Current CTC', 'Expected CTC', 'Notice Period',
      'Total Experiance', 'Highest Qualification', 'Location'];

    function checkOrderBody(order) {
      /* Validating data found or not */
      let notFoundKey;

      const valueNotFoundFlag = keys.some(key => {
        notFoundKey = key;
        return typeof order[key] === 'undefined' || order[key] === '';
      });

      return { flag: valueNotFoundFlag, notFoundKey };
    }

    function raiseError(errData, uploadCVForm){
      vm.errorMessage = { data: errData };
      if (errData.field) {
        if(errData.field === 'total_exp_m') {
          uploadCVForm['total_exp_m'].$setValidity('required', false);
          uploadCVForm['total_exp_y'].$setValidity('required', false);
          $('input[name="total_exp_m"]')[0].focus();
          return $('input[name="total_exp_y"]')[0].focus();
        }
        if(uploadCVForm[errData.field]){
          uploadCVForm[errData.field].$setValidity('required', false);
          $('input[name="' + errData.field + '"]')[0].focus();
          uploadCVForm[errData.field].$setViewValue(uploadCVForm[errData.field].$viewValue);
        }
      }
    }

    vm.create = function(jobId, orderId, uploadCVForm) {
      var data = _.pick(vm.data, ['id', 'name', 'email_id', 'number', 'expected_ctc', 'employer_id', 'designation_id', 'degree_id', 'salary', 'notice_period', 'region_id', 'total_exp', 'summary']);

      if(!uploadCVForm.$valid) return
      const result = checkOrderBody(data)
      if (result.flag) {
        return raiseError({
          message: `Please check ${values[keys.indexOf(result.notFoundKey)]}`, field: result.notFoundKey,
        }, uploadCVForm);
      };


      return vm.uploadFile($stateParams.jobId, orderId, vm.data.file, data, function jobCreated(response) {
        return setTimeout(function () {
          $state.go('order.view', { orderId: orderId });
        }, 1000);
      },
        function errorCB(err) {
          vm.errorMessage = err;
          return console.log('Error while uploading...', err);
        });
    };

  });
