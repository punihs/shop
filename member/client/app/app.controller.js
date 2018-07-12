class AppController {
  constructor($window, $uibModal, $state, $rootScope, URLS,
              $http, $stateParams, Session, Page) {
    const vm = this;
    this.Page = Page;
    vm.$stateParams = $stateParams;
    vm.Session = Session;

    vm.userinfo = this.Session.read('userinfo');
    vm.states = this.Session.read('states');

    vm.Math = Math;
    vm.URLS = URLS;
    // config
    vm.app = {
      name: 'MEMBER',
      version: '0.0.1',
      settings: {
        themeID: 1,
        navbarHeaderColor: 'bg-primary dk',
        navbarCollapseColor: 'bg-info',
        asideColor: 'bg-info bg-gd-dk',
        headerFixed: true,
        asideFixed: true,
        asideFolded: true,
        asideDock: true,
        container: false,
        offScreen: false, // flag for show of sidebar for mobile view
        mobileHeader: false, // flag to show header Nav and Search in mobile view
        isAdmin: vm.Session.read('ROLE_ADMIN'),
      },
    };

    vm.updateNavigationBar = (currentState, stateParams) => {
      let navbarHeaderColor = 'bg-primary';
      let navbarCollapseColor = 'bg-info';
      let asideColor = 'bg-info bg-gd-dk';
      if (currentState.startsWith('candidates.') || currentState.startsWith('candidate.')) {
        navbarHeaderColor = stateParams.source === '0' ? 'bg-black' : 'bg-sea-green';
        navbarCollapseColor = stateParams.source === '0' ? 'bg-black' : 'bg-sea-green';
        asideColor = stateParams.source === '0' ? 'bg-black bg-gd-dk' : 'bg-sea-green bg-gd-dk';
      }
      vm.app.settings.navbarHeaderColor = navbarHeaderColor;
      vm.app.settings.navbarCollapseColor = navbarCollapseColor;
      vm.app.settings.asideColor = asideColor;
    };

    // keeps track of state change and hides sidebar view for mobile
    /* eslint angular/on-watch: 0 */
    $rootScope.$on('$stateChangeStart', (ev, to, toParams, from) => {
      Object.assign($rootScope, {
        previousState: from.name,
        currentState: to.name,
      });
      vm.app.settings.offScreen = false;
      vm.app.settings.mobileHeader = false;
      vm.updateNavigationBar($rootScope.currentState, toParams);
    });

    vm.Page = Page; // Set Page title
    vm.$state = $state;

    // Applicant search related Functions
    vm.Applicants = {
      select: ($item) => {
        vm.Applicants.searchText = '';
        $state.go('applicant.view', { applicantId: $item.id });
      },

      get: (searchText) => $http
        .get('/search', {
          params: {
            type: 'applicants',
            q: searchText,
            offset: 0,
            limit: 15,
            fl: 'id,name',
          },
        }),

      noResults: false,
      loadingRegions: false,
    };

    vm.interviewUI = {
      5: {
        icon: 'phone',
        color: 'success',
      },
      8: {
        icon: 'user',
        color: 'warning',
      },
      17: {
        icon: 'skype',
        color: 'info',
      },
    };

    vm.showCustomerSideBar = function showNavJobs() {
      return [
        'packages.index',
        'customer.view',
        'customer.packages.index',
        'customer.packages.create',
        'customer.package.update',
        'shipment.view',
        'shipment.packages.index',
      ].includes($state.current.name);
    };

    vm.downloadOrder = (ids) => {
      // ApplicantIds is array contatining applicant id to download cvs
      $uibModal.open({
        templateUrl: 'app/directives/download-resume/download-resume.html',
        controller: 'DownloadResumeController',
        controllerAs: 'DownloadResume',
        size: 'sm',
        resolve: {
          ApplicantIds: function ApplicantIds() {
            return ids;
          },
        },
      });
    };

    vm.downloadPackage = function downloadApplicant(ids) {
      // ApplicantIds is array contatining applicant id to download cvs
      $uibModal.open({
        templateUrl: 'app/directives/download-resume/download-resume.html',
        controller: 'DownloadResumeController',
        controllerAs: 'DownloadResume',
        size: 'sm',
        resolve: {
          ApplicantIds: function ApplicantIds() {
            return ids;
          },
        },
      });
    };

    vm.ApplyToQuezx = (candidateName, candidateID) => {
      // ApplicantIds is array contatining applicant id to download cvs
      $uibModal.open({
        templateUrl: 'app/directives/apply-to-quezx/apply-to-quezx.html',
        controller: 'ApplyToShoppReController',
        controllerAs: '$ctrl',
        resolve: {
          candidateName: () => candidateName,
          candidateId: () => candidateID,
        },
      });
    };

    vm.addFollower = function addFollower(follower, applicantId) {
      // ApplicantIds is array contatining applicant id to download cvs
      $uibModal.open({
        templateUrl: 'app/directives/download-resume/download-resume.html',
        controller: 'AddFollowerController',
        controllerAs: 'AddFollower',
        size: 'md',
        resolve: {
          FollowerData: function FollowerData() {
            return follower[0];
          },

          ApplicantId: function ApplicantId() {
            return applicantId;
          },
        },
      });
    };

    vm.hideExt = () => $window.parent.postMessage({ type: 'RESET' }, '*');
    vm.initiateChat = function initiateChat(user) {
      const url = `${this.URLS.CHAT_SERVER}/initiate?to=${user.mobile || user.number
        }&email=${user.email}&name=${user.name}&loginSource=quezx`;
      $window.open(url);
    };

    vm.openSearchCandidate = function openSearchCandidate(event, update) {
      $uibModal.open({
        templateUrl: 'app/directives/search-candidate/search-candidate.html',
        controller: 'SearchCandidateController',
        controllerAs: '$ctrl',
        windowClass: 'search-view',
        size: 'lg',
        resolve: {
          modifyQuery: () => (update || false),
        },
      });
      event.currentTarget.blur();
    };

    vm.downloadCandidateResume = (candidateId) => {
      $http
        .get(`/candidates/${candidateId}/download`, { params: this.$stateParams.source })
        .then(({ data: resume_link }) => {
          $window.open(resume_link, '_blank');
        });
    };

    vm.openEmailCandidate = (candidateId, candidateName, candidateEmail) => {
      $uibModal.open({
        templateUrl: 'app/directives/email-candidate/email-candidate.html',
        controller: 'EmailCandidateController',
        controllerAs: '$ctrl',
        windowClass: 'email-view',
        size: 'lg',
        resolve: {
          candidateId: () => candidateId,
          candidateName: () => candidateName,
          candidateEmail: () => candidateEmail,
        },
      });
    };

    vm.isBDTeam = () => {
      if (vm.userinfo) {
        const userList = [2621, 1346, 173];
        return userList.indexOf(vm.userinfo.client_id) !== -1;
      }
      return false;
    };

    vm.isTestingUser = () => {
      if (vm.userinfo) {
        const userList = [2621, 1346, 173];
        return userList.indexOf(vm.userinfo.client_id) !== -1;
      }
      return false;
    };

    vm.isQNATesting = () => {
      if (vm.userinfo) {
        const userList = [2552, 807, 2800, 2677, 1446, 1737, 2844, 2516, 3121, 2632, 3216,
          3189, 3356, 479, 3719, 3717, 3812, 112];
        return userList.indexOf(vm.userinfo.id) !== -1;
      }
      return false;
    };
  }
}

angular.module('uiGenApp')
  .controller('AppController', AppController);
