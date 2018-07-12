angular.module('uiGenApp')
  .controller('NewJobController', function NewJobCtrl(QuarcService, Restangular, $state, moment) {
    const Regions = QuarcService.Regions;
    const Degrees = QuarcService.Degrees;
    const Institutes = QuarcService.Institutes;
    const Industries = QuarcService.Industries;
    const Employers = QuarcService.Employers;
    const Skills = QuarcService.Skills;
    const Funcs = QuarcService.Funcs;
    const Page = QuarcService.Page;
    const Jobs = QuarcService.Jobs;

    const vm = this;
    Page.setTitle('Post New Position');
    vm.data = {
      days_per_week: '5',
      email: '',
      new_job: 1,
      start_work_time: '9:00 AM',
      end_work_time: '5:00 PM',
      job_nature: '1',
      preferred_genders: 'No Preference',
      direct_line_up: '0',
      whitelist: '0',
      func_id: '0',
      JobSkills: [],
      JobsDegrees: [],
      JobsInstitutes: [],
      JobsIndustries: [],
      JobsEmployers: [],
    };

    vm.ui = {
      days_per_week: [1, 2, 3, 4, 5, 6, 7],
      start_work_time: (function intervalGenerator() {
        const interval = [];
        for (let i = 0; i < 48; i++) {
          interval.push(moment().startOf('day').add(7, 'hour').add(i * 30, 'minute').format('h:mm A'));
        }

        return interval;
      })(),

      end_work_time: (function intervalGenerator() {
        const interval = [];
        for (let i = 0; i < 48; i++) {
          interval.push(moment().startOf('day').add(15, 'hour').add(i * 30, 'minute').format('h:mm A'));
        }

        return interval;
      })(),
    };
    vm.Regions = {
      select: function selectRegion($item) {
        vm.data.region_id = $item.id;
      },

      get: function getRegions(search) {
        return Restangular
            .one('regions')
            .get({ q: search })
            .then(function gotRegions(response) {
              return response.items.map(function iterate(value) {
                return value;
              });
            });
      },

      noResults: false,
      loadingRegions: false,
    };

    vm.Degrees = {
      select: function selectDegree($item) {
        vm.Degrees.model = '';
        vm.data.JobsDegrees.push({
          degree_id: $item.id,
          name: $item.name,
        });
      },

      get: function getDegrees(search) {
        return Restangular
            .one('degrees')
            .get({ q: search })
            .then(function gotDegrees(response) {
              return response.items.map(function iterate(value) {
                return value;
              });
            });
      },

      noResults: false,
      loadingRegions: false,
    };

    vm.Institutes = {
      select: function selectInstitute($item) {
        vm.Institutes.model = '';
        vm.data.JobsInstitutes.push({
          institute_id: $item.id,
          name: $item.name,
        });
      },

      get: function getInstitutes(search) {
        return Restangular
            .one('institutes')
            .get({ q: search })
            .then(function gotInstitutes(response) {
              return response.items.map(function iterate(value) {
                return value;
              });
            });
      },

      noResults: false,
      loadingRegions: false,
    };

    vm.Industries = {
      select: function selectIndustry($item) {
        vm.Industries.model = '';
        vm.data.JobsIndustries.push({
          industry_id: $item.id,
          name: $item.name,
        });

          // Removes industry from list
        angular.forEach(vm.Industries.list, function removeIndustry(value, key) {
          if (value.id === $item.id) vm.Industries.list.splice(key, 1);
        });
      },

      get: (function getIndustries() {
        return Restangular
            .one('industries')
            .get({ q: '' })
            .then(function gotIndustries(response) {
              vm.Industries.list = response.items;
            });
      })(),

      noResults: false,
      loadingRegions: false,
    };

    vm.Employers = {
      select: function selectEmployer($item) {
        vm.Employers.model = '';
        vm.data.JobsEmployers.push({
          employer_id: $item.id,
          name: $item.name,
        });
      },

      get: function getEmployer(search) {
        return Restangular
            .one('employers')
            .get({ q: search })
            .then(function gotEmployer(response) {
              return response.items.map(function iterate(value) {
                return value;
              });
            });
      },

      noResults: false,
      loadingRegions: false,
    };

    vm.Skills = {
      selectRequired: function selectSkill($item) {
        vm.Skills.modelRequired = '';
        vm.data.JobSkills.push({
          skill_id: $item.id,
          isRequired: 1,
          name: $item.name,
        });
      },

      selectOptional: function selectSkill($item) {
        vm.Skills.modelOptional = '';
        vm.data.JobSkills.push({
          skill_id: $item.id,
          isRequired: 0,
          name: $item.name,
        });
      },

      get: function getSkill(search) {
        return Restangular
            .one('skills')
            .get({ q: search })
            .then(function gotSkill(response) {
              return response.items.map(function iterate(value) {
                return value;
              });
            });
      },

      create: function createSkill(skill, required) {
        return Restangular
            .all('skills')
            .post({ name: skill })
            .then(function gotSkill(response) {
              const $item = {
                id: response.id,
                name: response.name,
              };

              if (required) {
                return vm.Skills.selectRequired($item);
              }

              return vm.Skills.selectOptional($item);
            });
      },

      noResults: false,
      loadingRegions: false,
    };

    Restangular.one('funcs')
        .get({ q: '', rows: 20 })
        .then(function gotFuncs(response) {
          vm.Funcs = response.items;
        });

    vm.create = function createJob() {
      Restangular
          .all('jobs')
          .post(vm.data)
          .then(function jobCreated(result) {
            $state.go('job.view', { jobId: result.id });
          });
    };
  });
