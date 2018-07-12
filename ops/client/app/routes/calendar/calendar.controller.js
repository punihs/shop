
class CalendarCtrl {
  constructor($http, $scope, moment, $state, Session, Page) {
    this.$state = $state;
    this.$scope = $scope;
    this.$http = $http;
    this.moment = moment;
    this.Session = Session;
    this.Page = Page;
    this.$onInit();
  }

  $onInit() {
    this.clientId = this.Session.read('userinfo').client_id;
    this.states = this.Session.read('states');
    this.Page.setTitle('Scheduled Interview Calendar');
    this.colors = { 5: 'success', 8: 'warning', 17: 'info' };
    this.applicants = []; // collection of applicants
    this.ui = { lazyLoad: true, loading: false }; // ui states

    // GET query params
    this.params = {
      offset: 0, limit: 30,
      fl: 'id,name,state_id,state_name,interview_time,interview_type,_root_,owner_id',
    };

    this.calendarView = 'month';
    this.calendarDay = moment().toDate();
    // watch for change of start of month
    this.$scope
      .$watch(() => moment(this.calendarDay).startOf('month').toISOString(), () => {
        // Reset controller variables to default
        this.applicants = [];
        this.ui = { lazyLoad: true, loading: false };
        this.params.offset = 0; // Reset result offset
        this.loadApplicants();
      }, true);

    this.isCellOpen = true;
  }

  loadApplicants() {
    const root = '_root_';
    if (!this.ui.lazyLoad) return; // if no more applicants to get
    this.ui = { lazyLoad: false, loading: true };

    // set interview_time range using latest calendar day
    this.params.interview_time = [
      this.moment(this.calendarDay).startOf('month').toISOString(),
      this.moment(this.calendarDay).endOf('month').toISOString(),
    ].join(',');
    this.$http
      .get('/users', { params: { suspend_status: '0,1' } })
      .then(({ data }) => {
        const hash = {};
        data.forEach(d => (hash[d.id] = d.name));
        this.$http
          .get('/applicants', { params: this.params })
          .then(({ data: { applicants: result = [] } }) => {
            result.forEach(a => {
              const applicant = a;
              applicant.owner_name = hash[applicant.owner_id];
              this.applicants.push({
                title: [
                  `<a href=${this.$state.href('job.view', { jobId: applicant[root].id })}
 target="_blank">`,
                  `<span class="text-${this.colors[applicant.interview_type]}-lter">`,
                  `${applicant[root].role}</span></a> –`,
                  `<a href="${this.$state.href('applicant.view', { applicantId: applicant.id })}"
 target="_blank">`,
                  `<span class="text-${this.colors[applicant.interview_type]}-lter">`,
                  `${applicant.name}</span></a> &nbsp;`,
                  `<span
 style="padding: 0 3px;white-space: nowrap;">- [${applicant.owner_name}]</span>`,
                  '<span style="padding: 0 3px;white-space: nowrap;" ' +
                  'class="h6 b-a b-${this.colors[applicant.interview_type]}">',
                  `${this.states[applicant.state_id].action} &nbsp;</span> &nbsp;`,
                ].join(''),
                type: this.colors[applicant.interview_type],
                startsAt: this.moment(applicant.interview_time).toDate(),
                endsAt: this.moment(applicant.interview_time).add(1, 'hours').toDate(),
              });
            });

            // data has been loaded
            this.ui.loading = false;

            // check for returned results count and set lazy loadLoad false if less
            this.ui.lazyLoad = angular.equals(result.length, this.params.limit);

            // increment offset for next loading of results
            this.params.offset = this.params.offset + this.params.limit;
            this.loadApplicants();
          });
      });
  }
}

angular.module('uiGenApp')
  .controller('CalendarCtrl', CalendarCtrl);
