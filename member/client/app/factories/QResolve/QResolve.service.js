(() => {
  class QResolveService {
    constructor($http, $log, Restangular, JobSuggest) {
      this.$http = $http;
      this.$log = $log;
      this.Restangular = Restangular;
      this.JobSuggest = JobSuggest;
    }

    currentJob(jobId, paramsobj) {
      const params = paramsobj || {};
      if (params.fl && params.fl.split().length === 1 && ~params.fl.split().indexOf('id')) {
        return this.Restangular.one('jobs', jobId);
      }

      params.auto = this.JobSuggest.enabled;
      return this.$http
        .get(`/jobs/${jobId}`, { params })
        .then(({ data }) => data)
        .catch(err => this.$log.error('Failed to get Job', err));
    }

    currentApplicant(applicantId, params = {}) {
      if (params.fl && params.fl.split().length === 1 && ~params.fl.split().indexOf('id')) {
        return this.Restangular.one('applicants', applicantId);
      }

      return this.$http
        .get(`/applicants/${applicantId}`, { params })
        .then(({ data }) => data)
        .catch(err => this.$log.error('Failed to get Applicant', err));
    }

    currentApplicantToEdit(jobId, applicantId, params = {}) {
      if (params.fl && params.fl.split().length === 1 && ~params.fl.split().indexOf('id')) {
        return this.Restangular.one('applicants', applicantId);
      }

      return this.$http
        .get(`/jobs/${jobId}/applicants/${applicantId}`, { params })
        .then(({ data }) => data)
        .catch(err => this.$log.error('Failed to get Applicant', err));
    }
  }

  angular
    .module('uiGenApp')
    .service('QResolve', QResolveService);
})();
