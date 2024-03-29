class AccessCourierController {
  constructor(URLS, $window, Session, $http, Auth) {
    this.URLS = URLS;
    this.$window = $window;
    this.Session = Session;
    this.$http = $http;
    this.Auth = Auth;
    this.$onInIt();
  }

  $onInIt() {
    this.user = this.Session.read('adminUserinfo');
  }

  accessCourier() {
    const method = 'get';
    // Todo: Need to do this using localStorage user info , by updating the is_courier_migrated =2 in localStorage
    return this
      .$http[method](`/users/${this.user.id}`)
      .then(({ data: user }) => {
        if (Number(user.is_courier_migrated) === 1) {
          this.signup();
        } else if (Number(user.is_courier_migrated) === 2) {
          this.authorise();
        }
      });
  }

  signup() {
    const allowed = [
      'id', 'salutation', 'first_name',
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
      .$http[method]('~~/api/authorise', data)
      .then(({ data: redirectUrl }) => {
        // this.$window.open(redirectUrl, '_blank');
        const newTab = window.open();
        newTab.location.href = redirectUrl;
      });
  }
}

angular
  .module('uiGenApp')
  .controller('AccessCourierController', AccessCourierController);
