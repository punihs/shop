(() => {
  class ExcelDownloadService {
    constructor($window, moment, Session, URLS) {
      this.$window = $window;
      this.moment = moment;
      this.Session = Session;
      this.URLS = URLS;
    }

    download(params, jobId = '') {
      const paramCopy = Object.assign({}, params, {
        xlsx: true,
        offset: 0,
        limit: 1000000000,
        admin: this.Session.read('ROLE_ADMIN'),
      });

      const { access_token: accessToken } = this.Session.read('oauth');
      const xlsx = `${this.URLS.API}${jobId
        ? `/jobs/${jobId}`
        : ''
      }/applicants?${Object.keys(paramCopy)
        .map((key) => `${key}=${encodeURIComponent(paramCopy[key])}`)
        .join('&')
      }&access_token=${accessToken}`;

      this.$window.open(xlsx, '_blank');
    }
  }

  angular
    .module('uiGenApp')
    .service('ExcelDownload', ExcelDownloadService);
})();
