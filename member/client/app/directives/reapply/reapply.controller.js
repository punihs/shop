(() => {
  class Reapply {
    constructor($uibModalInstance, $http, $state, applicant, moment) {
      this.$http = $http;
      this.$state = $state;
      this.moment = moment;
      this.$uibModalInstance = $uibModalInstance;

      this.applicant = applicant;
    }

    $onInit() {
      this.data = { id: this.applicant.id };
      this.today = new Date();
      this.uploading = false;
      this.dateOptions = { minDate: new Date() };
      this.scheduled_on_time = this.moment()
        .startOf('day')
        .set('hour', 10);

      this.Clients = {
        select: ($item) => {
          if ($item.id) {
            this.Clients.id = $item.id;
            this.Clients.model = $item.name;
          }
        },

        get: (search) => {
          return this.$http
            .get('/search', { params: { q: search, type: 'partner_clients' } })
            .then(({ data }) => data);
        },
        noResults: false,
        loadingClients: false,
      };

      this.Positions = {
        select: ($item) => {
          if ($item.id) {
            this.Positions.id = $item.id;
            this.Positions.model = $item.name;
            this.Positions.is_drive = $item.is_drive;
          }
        },
        get: (q) => {
          const { id: clientId } = this.Clients;
          if (!clientId) return [];

          const root = '_root_';
          return this.$http
            .get('/search', {
              params: {
                q,
                type: 'partner_jobs',
                client_id: clientId,
                is_drive: this.applicant[root].is_drive,
              },
            })
            .then(({ data: jobs }) => jobs);
        },

        noResults: false,
        loadingClients: false,
      };
    }

    setScheduledOn() {
      this.data.scheduled_on = this.moment(this.scheduled_on_date)
        .set('hour', 10)
        .set('minute', 0)
        .set('second', 0);
    }

    submit() {
      this.uploading = true;
      return this.$http
        .post(`/jobs/${this.Positions.id}/applicants/reapply`, this.data)
        .then(({ data }) => {
          this.uploading = false;
          this.$uibModalInstance.close(true);
          return this.$state.go('applicant.view', { applicantId: data.id });
        })
        .catch((error) => {
          this.uploading = false;
          this.error = (error.data && error.data.message) || error.statusText;
        });
    }
  }

  angular.module('uiGenApp')
    .controller('ReApplyController', Reapply);
})();
