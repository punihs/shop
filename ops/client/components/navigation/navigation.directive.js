class NavigationController {
  constructor(URLS, $window, $cookies, Session, $http, Auth) {
    this.URLS = URLS;
    this.$window = $window;
    this.$cookies = $cookies;
    this.Session = Session;
    this.$http = $http;
    this.Auth = Auth;
    this.$onInIt();
  }

  $onInIt() {
    this.user = this.Session.read('userinfo');
  }

  accessCourier() {
    const method = 'get';
    // Todo: Need to do this using localStorage user info , by updating the is_courier_migrated =2 in localStorage
    return this
      .$http[method](`/users/${this.user.id}`)
      .then(({ data: user }) => {
        console.log('user', user);
        if (user.is_courier_migrated === 1) {
          this.signup();
        } else if (user.is_courier_migrated === 2) {
          this.authorise();
        }
      });
  }

  signup() {
    const allowed = [
      'salutation', 'first_name',
      'last_name', 'email', 'phone',
      'group_id', 'country_id',
    ];
    const method = 'post';
    return this
      .$http[method]('&/users/register', _.pick(this.user, allowed))
      .then(() => {
        const updateMethod = 'put';
        const updateData = {
          is_courier_migrated: 2,
        };
        return this
          .$http[updateMethod](`/users/${this.user.id}`, updateData)
          .then(() => {
            this.authorise();
          });
      });
  }

  authorise() {
    const COURIEROPS = 5;
    const data = {
      grant_type: 'loginAs',
      username: this.user.email,
      app_id: COURIEROPS,
    };
    const method = 'post';
    return this
      .$http[method]('~/authorise', data)
      .then(({ data: redirectUrl }) => {
        this.$window.open(redirectUrl, '_blank');
      });
  }
}


angular.module('uiGenApp')
  .directive('navigation', () => ({
    templateUrl: 'components/navigation/navigation.html',
    controller: NavigationController,
    controllerAs: '$ctrl',
    restrict: 'E',
  }));
