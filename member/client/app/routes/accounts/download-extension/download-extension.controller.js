class DownloadExtensionController {
  constructor($state, Page, URLS) {
    this.$state = $state;
    this.Page = Page;
    this.URLS = URLS;
    this.Page.setTitle('Download Extension');
    this.URLS = URLS;
    this.link = this.URLS.CHROME_EXTENSION;
    this.$onInit();
  }

  $onInit() {
    if (document.getElementById('qx-installed')) this.$state.go('jobs.list', { status: 'New' });
  }
}

angular.module('uiGenApp')
  .controller('DownloadExtensionController', DownloadExtensionController);
