class NotificationsController {
  /* @ngInject */
  constructor(moment, $state, $scope, $rootScope, Session, $http, URLS) {
    this.moment = moment;
    this.$state = $state;
    this.$scope = $scope;
    this.$http = $http;
    this.$rootScope = $rootScope;
    this.Session = Session;
    this.QNOTIFY_API = URLS.QNOTIFY_SERVER;
    this.QNOTIFY_USER = `${this.QNOTIFY_API}/users/${Session.read('userinfo').id}/notifications`;
    this.IGNORE_AUTH = { ignoreAuthModule: true };
    this.$onInit();
  }

  $onInit() {
    this.notes = [];
    this.counts = {};
    this.ui = { lazyLoad: true, loading: false };
    this.params = { offset: 0, limit: 20 };
    this.states = this.Session.read('states');

    this // watch to send data to navbar notify-count
      .$scope
      .$watch(
        () => this.counts,
        () => this.$rootScope.$broadcast('UpdateNotify', this.counts),
        true
      );

    const FALLBACK_MAP = {
      101: 'JD REJECTED',
      102: 'JD ACCEPTED',
      103: 'NEW CVS',
      104: 'JOINING FOLLOW UP',
      105: 'JD PRIORITY',
      106: 'ANNOUNCEMENT',
      107: 'ARCHIVED',
      110: 'NEW JD UPDATE',
      111: 'HIDDEN JD',
    };

    const tagReducer = x => x.reduce((z, x) => Object.assign(z, { [x]: { count: 0 } }), {});
    this.categories = [
      {
        title: 'Urgent',
        tags: tagReducer([23, 12, 22, 21, 32, 6]),
      },
      {
        title: 'Action Required',
        tags: tagReducer([33, 19, 8, 35, 5, 17, 11, 104, 105, 44]),
      },
      {
        title: 'Update',
        tags: tagReducer([
          16, 1, 9, 29, 30, 2, 3, 34, 25, 24, 18, 10, 20, 15, 28, 101, 110,
          102, 103, 106, 4, 36, 41, 42, 38, 39, 40, 31, 14, 27, 13, 26, 111,
        ]),
      },
      {
        title: 'Archive',
        tags: tagReducer([107]),
      },
    ];

    this
      .$http
      .get(`${this.QNOTIFY_USER}/facets`, this.IGNORE_AUTH)
      .then(({ data }) => {
        data.forEach(({ id, count }) => {
          const [category = this.categories[3]] = this.categories.filter(x => !!x.tags[id]);
          category.tags[id] = {
            name: this.states[id] && this.states[id].action || FALLBACK_MAP[id] || 'Unknown',
            count,
          };
        });
        const [firstTag = '23'] = this.categories
          .map(({ tags }) => Object.keys(tags).find(k => tags[k].count > 0))
          .filter(x => x);

        this.selectNotification(firstTag);
      });
  }

  readOne(note) {
    const notification = note;
    return this
      .$http
      .post(`${this.QNOTIFY_API}/notifications/${notification._id}/read`, this.IGNORE_AUTH)
      .then(() => (notification.read = true))
      .then(() => this.counts.count--);
  }

  readAll() {
    return this
      .$http
      .post(`${this.QNOTIFY_USER}/read`, this.IGNORE_AUTH)
      .then(() => this.$state.reload())
      .then(() => (this.counts.count = 0));
  }

  unreadOne(note) {
    const notification = note;
    return this
      .$http
      .post(`${this.QNOTIFY_API}/notifications/${notification._id}/unread`, this.IGNORE_AUTH)
      .then(() => (notification.read = false))
      .then(() => this.counts.count++);
  }

  getList() {
    if (!this.ui.lazyLoad) return;
    this.ui = { lazyLoad: false, loading: true };

    return this
      .$http
      .get(this.QNOTIFY_USER, Object.assign({ params: this.params }, this.IGNORE_AUTH))
      .then(res => {
        res.data.forEach(data => {
          const note = data;
          note.timeago = this.moment(note.created_at).fromNow();
          this.notes.push(note);
        });

        this.ui.loading = false; // data loaded
        this.ui.lazyLoad = res.data.length === this.params.limit; // lazyload status
        this.params.offset += this.params.limit;
        if (Object.keys(this.counts).length === 0) this.getNoteCount();
      });
  }

  selectNotification(notification) {
    this.ui.lazyLoad = true;
    this.notes = [];
    this.params = { offset: 0, limit: 20 };
    this.selectedNotification = notification;
    this.params.tag = notification;
    this.getList();
  }

  getArchive(index) {
    if (index === 3) this.selectNotification('107');
  }

  getTotal(category) {
    const value = Object.values(category).reduce((a, b) => a + b.count, 0);
    return (value > 0 ? `(${value})` : '');
  }

  getNoteCount() {
    this
      .$http
      .get(`${this.QNOTIFY_USER}/count`, this.IGNORE_AUTH)
      .then(res => (this.counts = res.data));
  }
}

angular.module('uiGenApp')
  .controller('NotificationsController', NotificationsController);
