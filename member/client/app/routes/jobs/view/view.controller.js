class JobViewController {
  /* @ngInject */
  constructor(URLS, $http, Page, $stateParams, $sce, $window, QCONFIG, currentJob, sampleCvs,
              $state, $log, Session, JobModal, $uibModal, PromoteJdDialog) {
    this.URLS = URLS;
    this.$http = $http;
    this.Page = Page;
    this.$stateParams = $stateParams;
    this.trustAsHtml = $sce.trustAsHtml;
    this.trustSrc = $sce.trustAsResourceUrl;
    this.$window = $window;
    this.QCONFIG = QCONFIG;
    this.currentJob = currentJob;
    this.sampleCvs = sampleCvs;
    this.$state = $state;
    this.$log = $log;
    this.Session = Session;
    this.JobModal = JobModal;
    this.user = this.Session.read('userinfo');
    this.pdfPath = `${this.URLS.API}/jobs/${this.$stateParams.jobId}`;
    this.$uibModal = $uibModal;
    this.PromoteJdDialog = PromoteJdDialog;

    if (!this.currentJob) {
      this.$state.go('jobs.list');
      return;
    }
    this.job = this.currentJob;
    this.modalData = {
      title: 'Client Contact',
      list: [
        { name: 'Name', val: `${this.job.contact_name}` },
        { name: 'Contact Number', val: `${this.job.mobile}` },
        { name: 'Email', val: `${this.job.email || ' - '}` },
      ],
      modalButtons: [
        { name: 'Close', bool: false, type: 'default' },
      ],
    };
    this.soundSrc = this.trustSrc(this.currentJob.briefSoundPath);
    this.videoSrc = this.trustSrc(this.currentJob.briefVideoPath);

    this.job.jdSrc = this.jdSrc = this.trustSrc(`${
      this.URLS.API
    }/jobs/${
      this.$stateParams.jobId
    }/downloadJD?access_token=${
      this.Session.getAccessToken()
    }`);

    this.buckets = this.QCONFIG.APPLICANT_STATES;
    this.Page.setTitle(`${this.job.role} - ${this.job.client_name}`);
    this.data = this.job;
    this.$http.get(`/jobs/${this.$stateParams.jobId}/getSoundPath`)
    .then(({ data }) => (this.briefSoundPath = data))
    .catch(err => this.$log.error('Failed: unanswered question count', err));
    // load cv if sample cv id present in url
    if (this.$stateParams.sampleCvId) {
      this.getSample();
      this.sampleCvUrl = `${this.URLS.PDF_JS}?file=${
        this.sampleCvSrc
      }#page=1&search=&zoom=page-width`;
    }
    if (this.$stateParams.sampleCvId) this.prevNextSampleCV();
    this.getSimilarcandidates(this.job);
    this.showSearchCount = !!this.user.flag_database;
    this.sampleCvs.forEach(cv => Object.assign(cv, {
      downloadPath: `${this.pdfPath}/sampleCvs/${cv.id}/download?access_token=${
        this.Session.getAccessToken()
      }`,
    }));
  }

  getSimilarcandidates(job) {
    const any = [];
    ['optional_skills', 'required_skills'].forEach(field => {
      if (job[field]) any.push(...job[field].map(key => `"${key}"`));
    });
    const params = { any: any.join(','), utmSource: 'jobView' };
    this.data.viewUrl = `${this.URLS.SEARCH}/candidates/search-results?${Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')}`;
    const countUrl = `${this.URLS.CRUX_API}/candidates/search?any=${any
      .join(',')}&limit=0&log=false&showFacets=false&showLimits=false&source=1&searchCount=1`;
    this
      .$http
      .get(countUrl)
      .then(({ data }) => (this.data.candidateCount = data.total_candidate));
  }

  // for viewing the sample cv clicked
  getSample() {
    this.sampleCvSrc = `${this.URLS.API}/jobs/${this.$stateParams.jobId}/sampleCvs/${
      this.$stateParams.sampleCvId}/resume`;
    this.sampleCvSrc += `?access_token=${this.Session.getAccessToken()}`;
    this.sampleCvSrc = encodeURIComponent(this.sampleCvSrc);
  }

  prevNextSampleCV() {
    const currentSampleCV = Number(this.$stateParams.sampleCvId);
    const index = this.sampleCvs.findIndex((cv) => currentSampleCV === cv.id);
    if (index === -1) {
      delete this.sampleCvNav;
      return;
    }
    this.sampleCvNav = {
      index,
      prev: index > 0 ? this.sampleCvs[index - 1].id : -1,
      next: index < this.sampleCvs.length - 1 ? this.sampleCvs[index + 1].id : -1,
    };
  }

  chatWithClient(id) {
    this.$window.jqcc.cometchat.chatWith(id);
  }

}


angular.module('uiGenApp').controller('JobViewController', JobViewController);
