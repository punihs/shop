class ApplicantViewController {
  /* @ngInject */
  constructor(
    $http, $stateParams, URLS, $sce, $state, $window, Page, Session, $q, prescreen, ChangeState,
    ReApply, applicant, JobModal, ListModal, toaster, QuarcService, PaymentTracker
  ) {
    this.Number = Number;
    this.URLS = URLS;
    this.$sce = $sce;
    this.$http = $http;
    this.$state = $state;
    this.Page = Page;
    this.Session = Session;
    this.$q = $q;
    this.QuarcService = QuarcService;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.prescreen = prescreen;
    this.ChangeState = ChangeState;
    this.ReApply = ReApply;
    this.applicant = applicant;
    this.JobModal = JobModal;
    this.ListModal = ListModal;
    this.PaymentTracker = PaymentTracker;

    this.editAllowedStates = [27, 6, 13, 32, 43, 44, 7];
    this.data = {};
    this.location = $window.location;
    this.user = Session.read('userinfo');
    this.access = this.location.href.replace('partner.quezx', 'access.quezx');
    this.$onInit();
  }

  $onInit() {
    this.root = '_root_';
    this.modal = {};
    this.states = this.Session.read('states');
    this.user = this.Session.read('userinfo');
    this.showAssesmentScore = false;
    this.getApplicant();

    this
      .$http
      .get('/applicantDocuments', {
        params: { applicantId: this.$stateParams.applicantId }
      })
      .then(({ data: { data } }) => (this.document = data));
  }

  getApplicant() {
    // if (applicant[root].is_drive) this.ShowApplicant.open(applicant, applicant[root]);
    this.data = this.applicant;
    const state = this.states[this.data.state_id];
    if (state.description) this.setMessage(state.description);
    const data = this.data;
    [data.total_exp_y, data.total_exp_m] = data.total_exp.toFixed(2).split('.').map(Number);
    this.data = data;
    this.Page.setTitle(this.data.name);
    this.resumeSrc = `${this.URLS.API}/applicants/${this.$stateParams.applicantId}/` +
      `resume?access_token=${this.Session.getAccessToken()}`;
    if (this.data && this.data.assessment_score >= 0) this.showAssesmentScore = true;
  }

  setMessage(description) {
    this.modal = {
      modalButtons: [{ name: 'OK', type: 'default' }],
      title: 'Action Required',
      description,
    };
    this.ListModal.open(this.modal, 'popup');
  }

  initiateChat() {
    const url = `${this.URLS.CHAT_SERVER}/quezxLogin?to=${this.data.mobile}&` +
      `email=${this.data.email}&name=${this.data.name}`;
    window.open(url);
  }

  trustSrc(src) {
    if (!src) return '';
    const arrSkills = this.data[this.root].required_skills || [];
    const skills = arrSkills.join('$|$');
    return this.$sce.trustAsResourceUrl(`${this.URLS.PDF_JS}?file=${
      encodeURIComponent(src)}#page=1&search=${encodeURIComponent(skills)}&zoom=page-width`);
  }

  chatHoverText() {
    return `Initiate chat with ${this.data.name}`;
  }

  awfTime() {
    const [time] = this.data.comments.filter(c => c.state_id === 1);
    return time;
  }

  toggleBookmark(status) {
    this
      .$http
      .post(`/applicants/${this.$stateParams.applicantId}/bookmarks`, { status })
      .then(() => {
        this.data.is_bookmarked = status;
        this.toaster
          .pop(this.QuarcService.toast('success',
            (status
              ? 'Bookmarked Successfully'
              : 'Unbookmarked Successfully'
            )));
      })
      .catch(() => {
        this.toaster
          .pop(this
            .QuarcService
            .toast('error', 'There was problem loading data. Please contact QuezX team')
          );
      });
  }

  sendAssessmentToApplicant() {
        this.$http
          .post(`/applicants/${this.$stateParams.applicantId}/sendAssessment`)
         .then(() => alert(`Assessment sent to ${this.data.name}<${this.data.email}>`))
      .catch(() => alert(`Unable to send assessment mail to  ${this.data.email} right now.`));
  }

  uploadFiles(files) {
    this.$q
      .all(files.map((file) => this.$http.post('/applicantDocuments', {
        applicant_id: this.$stateParams.applicantId,
        documentFile: file,
      })))
      .then((docs) => {
        const data = docs.map(file => {
          const { id, filename, link } = file.data;
          return { id, filename, link };
        });
        this.document = [...this.document, ...data];
        }
      );
  }

  deleteDocument(id, key) {
    this
      .$http
      .delete(`/applicantDocuments/${id}`)
      .then(() => this.document.splice(key, 1));
  }
}

angular.module('uiGenApp')
  .controller('ApplicantViewController', ApplicantViewController);
