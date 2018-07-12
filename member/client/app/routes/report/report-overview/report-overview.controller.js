class ReportOverviewController {
  /* @ngInject */
  constructor($timeout, $http, moment, Session, Page) {
    this.$timeout = $timeout;
    this.$http = $http;
    this.moment = moment;
    this.Session = Session;
    this.Page = Page;
    this.QUERY_IDS = {
      COUNT_QUERY: 55,
      DETAIL_QUERY: 56,
      CV_GRAPH_QUERY: 62,
      JD_GRAPH_QUERY: 69,
    };
    this.$onInit();
  }

  $onInit() {
    this.Page.setTitle('Reports');
    this.resetTiles();
    this.reset();

    this
      .$http
      .get('/reports')
      .then(({ data }) => (this.menu = Object
        .keys(data)
        .map(p => Object
          .assign(data[p], { name: p, items: data[p] }))));
  }

  setStateGroups(type) {
    const index = type ? 1 : 0;
    const table = ['job_status_logs.created_on', 'applicant_states.updated_on'];
    this.dateGroups = {
      14: `YEAR(${table[index]}),'/DAY ',DAY(${table[index]})`,
      30: `YEAR(${table[index]}),'/WEEK ',WEEK(${table[index]})`,
      90: `YEAR(${table[index]}),'/ ', MONTHNAME(${table[index]})`,
      365: `YEAR(${table[index]})`,
    };
  }

  reset() {
    const date = new Date();
    const reportData = this.Session.read('REPORT_DATA') || {};
    this.user = this.Session.read('userinfo');
    this.isAdmin = this.Session.read('ROLE_ADMIN');
    this.userIds = this.isAdmin && this.Session.read('VIEW_AS_IDS') || `${this.user.id}`;

    const [lhs, rhs] = [
      (reportData.user_ids || ''),
      this.userIds,
    ].map(x => x.split(',').sort().join());

    this.ui = {
      updatedOn: (reportData.updatedOn) || '',
      head: 0,
      loading: true,
      refresh: lhs !== rhs,
      title: 'CVs - Received',
      dateOptions: { maxDate: new Date() },
      open: true,
    };

    this.params = {
      start_date: new Date(reportData.start_date) || '',
      end_date: new Date(reportData.end_date || date),
    };

    if (reportData.tiles && !this.ui.refresh) {
      this.selectedTileId = 2;
      this.getReport(this.QUERY_IDS.DETAIL_QUERY, this.selectedTileId);
      if (this.tiles.length !== reportData.tiles.length) return this.refreshReport();
      this.selectedTile(this.selectedTileId);
      return Object.assign(this.tiles, reportData.tiles);
    }

    return this.refreshReport();
  }

  resetTiles() {
    this.tiles = [{ title: 'Active JD', state_id: '1,2', jds: {
      labels: [],
      data: [],
      datasets: [{
        borderWidth: 0,
      }],
      colors: [{
        backgroundColor: 'rgba(178,201,219,1)',
        borderColor: 'rgba(178,201,219,1)',
      }],
      options: {
        scales: {
          xAxes: [{
            barThickness: 35,
            gridLines: { display: false },
          }],
          yAxes: [{
            barThickness: 35,
            gridLines: { display: false },
            ticks: { beginAtZero: true },
          }],
        },
      },
    } },
      { title: 'CV Uploaded', state_id: '1', cvs: {
        labels: [],
        data: [],
        datasets: [{
          borderWidth: 0,
        }],
        colors: [{
          backgroundColor: 'rgba(99,183,72,1)',
          borderColor: 'rgba(99,183,72,1)',
        }],
        options: {
          scales: {
            xAxes: [{
              barThickness: 35,
              gridLines: { display: false },
            }],
            yAxes: [{
              barThickness: 35,
              gridLines: { display: false },
              ticks: { beginAtZero: true },
            }],
          },
        },
      } },
      { title: 'Uploaded', state_id: '27', tabs: 1, tabIdx: 0 },
      { title: 'Selected', state_id: '1', tabs: 2, tabIdx: 0 },
      { title: 'Rejected', state_id: '13', tabIdx: 1 },
      { title: 'Shortlisted', state_id: '19', tabs: 2, tabIdx: 0, exclude_state_ids: '2,3,11' },
      { title: 'Rejected', state_id: '2', tabIdx: 1 },
      { title: 'Done', state_id: '5,8,17', tabs: 2, tabIdx: 0,
        exclude_state_ids: '2,3,11' },
      { title: 'Backout', state_id: '11', tabIdx: 1 },
      { title: 'Offers', state_id: '10', tabs: 3, tabIdx: 0,
        exclude_state_ids: '2,38,18,11,3,13,28,31,29' },
      { title: 'Accepted', state_id: '20', tabIdx: 1 },
      { title: 'Rejected', state_id: '28', tabIdx: 2 },
      { title: 'Joined', state_id: '30', tabs: 2, tabIdx: 0,
        exclude_state_ids: '2,38,18,11,3,13,28,31,29' },
      { title: 'Backout', state_id: '29', tabIdx: 1 },
    ];

    this.donuts = {
      2: 'CVs Uploaded',
      3: 'Screened By QuezX',
      5: 'Shortlisted',
      7: 'Interviews',
      9: 'Offers',
      12: 'Joinees',
    };

    this.tiles.forEach((t, id) => {
      Object.assign(t, {
        id,
        count: 0,
        loading: true,
        date_filter_field: ((id === 0)
          ? 'job_status_logs.created_on'
          : 'applicant_states.updated_on'),
        data: [],
      });
    });
  }

  navigate(value, l) {
    this.len = (+l - 1);
    const left = this.ui.head - 9;
    const right = this.ui.head + 9;
    switch (value) {
      case 0: this.ui.head = (left <= 0 ? 0 : left); break;
      case 1: this.ui.head = (right >= this.len ? this.len : right); break;
      default: this.ui.head = 0;
    }
  }

  refreshReport() {
    const { CV_GRAPH_QUERY, JD_GRAPH_QUERY, COUNT_QUERY } = this.QUERY_IDS;
    this.ui.updatedOn = new Date();
    this.getReport(JD_GRAPH_QUERY, 0);
    this.getReport(CV_GRAPH_QUERY, 1);
    this.tiles.forEach((v, idx) => ![0, 1].includes(idx) && this.getReport(COUNT_QUERY, v.id));
    this.selectedTile(2);
  }

  getDateGroup() {
    const start = this.moment(this.params.start_date);
    const end = this.moment(this.params.end_date);
    const diff = end.diff(start, 'days');
    const limits = Object.keys(this.dateGroups).filter((l) => (diff - l) < 0);
    if (limits && limits.length > 0) return this.dateGroups[limits[0]];
    return this.dateGroups[365];
  }

  selectedTile(tileId, tabIdx = 0) {
    this.selectedTileId = Number(tileId);
    const tabCount = this.tiles[this.selectedTileId].tabs || (this.selectedTileId === 2 || 1);
    if (tabCount) {
      this.tabs = this.tiles.filter((x, idx) => (
        idx >= this.selectedTileId && idx < this.selectedTileId + tabCount && x
      ));
    }
    this.tableTitle = this.donuts[this.selectedTileId];
    this.selectedDonut = `${this.selectedTileId}`;
    this.tabSelected = 0;
    return this.getReport(this.QUERY_IDS.DETAIL_QUERY, this.selectedTileId + tabIdx);
  }

  getReport(queryId, tileId) {
    const { DETAIL_QUERY, COUNT_QUERY, CV_GRAPH_QUERY, JD_GRAPH_QUERY } = this.QUERY_IDS;
    const { state_id, date_filter_field, exclude_state_ids } = this.tiles[tileId];
    this.setStateGroups(tileId);
    const dateGroup = this.getDateGroup();
    this.ui.loading = queryId === DETAIL_QUERY;
    if ([COUNT_QUERY, CV_GRAPH_QUERY, JD_GRAPH_QUERY].includes(queryId)) {
      this.tiles.forEach(t => Object.assign(t, { loading: true }));
    }

    const params = {
      id: queryId,
      state_id,
      date_filter_field,
      exclude_state_ids,
      user_id: this.isAdmin && this.Session.read('VIEW_AS_IDS') || `${this.user.id}`,
      start_date: `${this.moment(this.params.start_date || 0).format('YYYY-MM-DD')} 00:00:00`,
      end_date: this.moment(this.params.end_date).endOf('day').format('YYYY-MM-DD hh:mm:ss'),
      date_group: dateGroup,
    };

    return this
      .$http
      .get('/bdQuery/dashboard', { params })
      .then(({ data }) => {
        this.ui.head = 0;
        if (queryId === this.QUERY_IDS.DETAIL_QUERY) {
          this.ui.loading = false;
          return (this.tiles[tileId].data = data);
        }

        if (queryId === this.QUERY_IDS.COUNT_QUERY) {
          this.tiles[tileId].count = data.cnt;
        }

        if ([CV_GRAPH_QUERY, JD_GRAPH_QUERY].includes(queryId)) {
          switch (queryId) {
            case CV_GRAPH_QUERY:
              this.tiles[tileId].cvs.data = [];
              this.tiles[tileId].cvs.data.push(data.map(x => x.cnt));
              this.tiles[tileId].cvs.labels = data.map(x => x.dateVal);
              break;
            default:
              this.tiles[tileId].jds.data = [];
              this.tiles[tileId].jds.data.push(data.map(x => x.cnt));
              this.tiles[tileId].jds.labels = data.map(x => x.dateVal);
          }
        }

        this.$timeout(() => (this.ui.refresh = false), 1500);
        this.tiles[tileId].loading = false;
        return this.Session.create('REPORT_DATA', Object.assign({
          tiles: this.tiles,
          updatedOn: this.ui.updatedOn,
          user_ids: this.userIds,
        }, this.params));
      });
  }
}

angular.module('uiGenApp')
  .controller('ReportOverviewController', ReportOverviewController);
