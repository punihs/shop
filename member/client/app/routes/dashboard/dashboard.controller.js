class DashboardController {
  constructor(QuarcService, $http, $q, Session, URLS, JobSuggest, toaster) {
    this.QuarcService = QuarcService;
    this.$http = $http;
    this.$q = $q;
    this.Session = Session;
    this.URLS = URLS;
    this.JobSuggest = JobSuggest;
    this.toaster = toaster;
    this.$onInit();
  }
  $onInit() {
    const Page = this.QuarcService.Page;
    this.user = this.Session.read('userinfo');
    this.states = this.Session.read('states');
    Page.setTitle('Dashboard');
    this.summary = {};
    this.initializing = true;

    this.medal = {
      type: 2,
      list: [{
        name: 'Gold',
        comment: [
          'You are going great !!',
          'Being consistent will ensure you retain your gold badge.',
        ].join(' '),
        icon: 'assets/images/medal-gold.svg',
      }, {
        name: 'Silver',
        comment: [
          'You are about to reach the finish line !',
          'Improve your Global rating to view high CTC JDs.',
        ].join(' '),
        icon: 'assets/images/medal-silver.svg',
      }, {
        name: 'Bronze',
        comment: [
          'You have a long way to go !',
          'Improve your Global rating to view high and mid CTC JDs.',
        ].join(' '),
        icon: 'assets/images/medal-bronze.svg',
      }],
    };

    this.summary.EPCScreening = { size: 60, animate: { duration: 0, enabled: false },
      barColor: '#3950a0', scaleColor: false, lineWidth: 5, lineCap: 'butt' };

    this.summary.EPCShortlist = { size: 60, animate: { duration: 0, enabled: false },
      barColor: '#187889', scaleColor: false, lineWidth: 5, lineCap: 'butt' };

    this.ui = { lazyLoad: true, loading: false }; // ui states
    this.params = { offset: 0, limit: 15,
      fl: 'id,name,mobile,email,state_id,state_name,_root_,' +
    'client_name,exp_designation,owner_id,notice_period,expected_ctc' };

    this.$http.get('/clients/dashboard/actionCounts')
      .then(({ data }) => {
        this.refreshTiles(data);
      });

    this.$http.get('/clients/dashboard/ratingAndRatios')
      .then(({ data }) => {
        Object.assign(this.summary, data);

        const medalType = [4, 2, 0].findIndex(min => data.rating >= min);
        this.medal.type = medalType < 0 ? 2 : medalType;
      });

    this.$http.get('/clients/dashboard/forActions')
      .then(({ data }) => {
        this.summary.applicantData = data;
      });

    this.$http.get('/clients/dashboard/upcomingOffers')
      .then(({ data }) => {
        this.summary.upcomingOfferData = data;
      });

    this.$http.get('/clients/dashboard/upcomingInterviews')
      .then(({ data }) => {
        this.summary.upcomingInterviewData = data;
      });

    if (!this.JobSuggest.enabled) {
      this.$http.get('/jobAllocations?limit=100&offset=0&q=&status=NEW')
        .then(({ data }) => {
          this.summary.newProfileData = data.jobs;
        });
    }
  }

  calculateRGBColor(rating, isPercent) {
    const newRate = isPercent ? `${(rating / 20).toFixed(1)}` : `${rating}`;
    const [dec = 0, frac = 0] = newRate.split('.').map((x) => Number(x));
    const diff = 10 - frac;

    switch (dec) {
      case 5:
        return '88,163,101';

      case 4:
        return `${88 + (diff * 5)},168,${101 - diff}`;

      case 3:
        return `${142 + (diff * 10)},${168 + (diff * 2)},${81 - (diff * 2)}`;

      case 2:
        return `${252 - diff},${146 - (diff * 5)},73`;

      case 1:
        return `240,${113 - diff},73`;

      default:
        return '240,103,73';
    }
  }

  refreshTiles(data) {
    this.summary.candidateData = [];
    this.stageTiles = [
      {
        title: 'Screening Pending',
        id: [6, 27, 32],
      }, {
        title: 'Feedback Pending',
        id: [1, 34, 41],
      }, {
        title: 'Scheduling pending',
        id: [19, 21, 22, 23, 24, 25, 35, 4, 33],
      }, {
        title: 'Interview Scheduled',
        id: [5, 8, 17],
      }, {
        title: 'Interview Done',
        id: [9, 36],
      }, {
        title: 'Offers',
        id: [10, 15, 20],
      }, {
        title: 'Joinees',
        id: [30],
      },
    ];

    this.stateTiles = [
      {
        title: 'Screening Hold',
        id: [6],
      }, {
        title: 'Scheduling Attempted',
        id: [22],
      }, {
        title: 'Screening Attempted',
        id: [32],
      }, {
        title: 'Awaiting Candidate Input',
        id: [33],
      }, {
        title: 'Candidate Availability Pending',
        id: [23],
      },
    ];

    this.stageTiles = this.stageTiles
      .map(tile => Object
      .assign(tile, { count:
        tile.id
          .reduce((prev, nxt) => prev + (data[nxt] || 0), 0) })
    );

    this.stateTiles = this.stateTiles
      .map(value => Object
      .assign(value, { count:
        value.id
          .reduce((prev, nxt) => prev + (data[nxt] || 0), 0) })
    );

    this.getTilesData(this.stageTiles[0].id, 0);
  }

  getTilesData(id, a, refresh) {
    if (refresh) {
      this.params.offset = 0;
      this.ui.lazyLoad = true;
      this.summary.candidateData = [];
    }

    if (!this.ui.lazyLoad) return;
    this.ui = { lazyLoad: false, loading: true };

    this.seletedTile = a;
    this
      .$http
      .get(`/applicants?status=ALL&sid=${id}`, { params: this.params })
      .then((res) => {
        if (res.data && res.data.applicants) {
          res.data.applicants.forEach((data)=> {
            this.summary.candidateData.push(data);
          });
        }

        this.params.offset = this.params.offset + this.params.limit;

        this.ui.loading = false;

        this.ui.lazyLoad = angular
          .equals(res.data.applicants.length, this.params.limit);
      })
      .catch(() => {
        this
          .toaster
          .pop(this
            .QuarcService
            .toast('error', 'There was problem loading data. Please contact QuezX team.'));
        if (!!refresh) this.summary.candidateData = [];
        this.ui.lazyLoad = false;
      });
  }
}

angular.module('uiGenApp')
  .controller('DashboardController', DashboardController);
