(() => {
  class BadgeController {
    constructor($state, $sce, $http, Session, URLS, QuarcService) {
      this.$state = $state;
      this.$sce = $sce;
      this.$http = $http;
      this.Session = Session;
      this.URLS = URLS;
      this.QuarcService = QuarcService;
      this.$onInit();
    }

    $onInit() {
      this.user = this.Session.read('userinfo');

      this.QuarcService.Page.setTitle('QuezX Badge');
      this.ui = {
        type: 0,
        size: '100',
        page: ['square', 'horizontal', 'vertical'],
        square: true,
        sizeListSquare: [100, 150, 200, 250],
        sizeListHorizontal: [480, 768, 1024, 1280],
        sizeListVertical: [300, 480, 768, 992],
        style: '',
      };
      this.style = `height: ${this.ui.size};width: ${this.ui.size}`;
      this.editCode(this.ui.size);
      this.getSlug();
    }

    getSlug() {
      this
        .$http
        .get(`/clients/${this.user.client_id}`, {
          params: { fl: 'Group' },
        })
        .then(res => {
          this.slug = res.data.slug;
          this.editCode(this.ui.size);
        });
    }

    editCode(size) {
      this.url = this.$sce.trustAsResourceUrl(`${
        this.URLS.BADGE
      }/${this.ui.page[this.ui.type]}?slug=${this.slug}`);
      switch (this.ui.type) {
        case 1: {
          this.ui.style = 'width: 100%;height:17%;';
          this.style = `width: ${size}px;height: 14%;`;
          break;
        }
        case 2: {
          this.ui.style = 'width: 17%;px;height:97%;';
          this.style = `height: ${size}px;width: 14%;`;
          break;
        }
        default: {
          this.ui.style = 'height: 150px;width: 150px;';
          this.style = `height: ${size}px;width: ${size}px;`;
        }
      }
      this.data = {
        embedCode: [
          `<iframe src="${this.url}"`,
          `style="${this.style};border: none;overflow: hidden;" scrolling="no">`,
          '</iframe>',
        ].join(' '),
      };
    }
  }

  angular
    .module('uiGenApp')
    .controller('BadgeController', BadgeController);
})();
