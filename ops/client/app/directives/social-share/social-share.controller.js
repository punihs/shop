class SocialShareController {
  /*  @ngInject   */
  constructor($uibModalInstance, URLS, Session, job) {
    this.$uibModalInstance = $uibModalInstance;
    this.URLS = URLS;
    this.Session = Session;
    this.job = job;
  }

  $onInit() {
    this.user = this.Session.read('adminUserinfo');
    const userIdBase64 = btoa(this.user.id);
    this.jobLink = `${this.URLS.APPLY}/${userIdBase64}/${this.job.job_code}`;
    this.links = {
      google: `https://plus.google.com/share?url=${this.jobLink}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${this.jobLink}`,
      twitter: `http://twitter.com/share?url=${this.jobLink}`,
      linkedIn: `https://www.linkedin.com/shareArticle?url=${this.jobLink}&source=Quezx.com`,
    };
  }
}

angular
  .module('uiGenApp')
  .controller('SocialShareController', SocialShareController);
