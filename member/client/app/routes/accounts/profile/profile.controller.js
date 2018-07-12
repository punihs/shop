'use strict';

angular.module('uiGenApp')
  .controller('ProfileController', function (Restangular, QuarcService, Auth, toaster, $http, $state, $log) {
    const vm = this;
    this.toaster = toaster;
    this.$http = $http;
    this.$state = $state;
    this.$log = $log;
    this.QuarcService = QuarcService;
    const Page = this.QuarcService.Page;
    Page.setTitle('Profile Details - My Account');
    const clients = Restangular.all('clients');
    const users = Restangular.all('users');

    clients.customGET('profile').then(res => {
      vm.data= res.plain();
    }).catch(err => {
      this.$log.error(err);
    });
    vm.create = () => {
      Restangular
        .all('clients/profile')
        .post(vm.data).then(res => {
        Auth.setSessionData().then(() => location.reload(true));
      }).catch(err => {
        vm.error = "Error occurred while updating the record";
        this.$log.error(err);
      })
    };

    vm.sendMail = function(user_id, email) {
      alert('Mail will sent to '+ email+'.');

      let data = { user_id, email };
      Restangular
        .all('users/verifyMail')
        .post(data).then(res => {
        Auth.setSessionData().then(() => location.reload(true));

      }).catch(err => {
        vm.error = "Error occurred while sending verification mail";
        console.log("err")
      })
    }

    vm.sendOtp = function(user_id, number) {
      alert('Sms will be sent to '+ number+' containing otp.');

      const data = { user_id, number };
      Restangular
        .all('users/verifyNumber')
        .post(data).then(res => {
        Auth.setSessionData().then(function () {
          return location.reload(true);
        });

      }).catch(err => {
        vm.error = "Error occurred while sending otp";
        console.log("err")
      })
    }

    vm.verifyNumber = function (otpCode) {
      if(!otpCode) {
        this.toaster.pop(this.QuarcService.toast('error', 'Please provide the otp code received on registered mobile number.'));
        return;
      }
      this
        .$http.post(`/userNumbers/${otpCode}/verify`)
        .then(({data}) => {
          if(data.message === 'error') return this.toaster.pop(this.QuarcService.toast('error', 'Invalid Otp provided.'));
          this.toaster.pop(this.QuarcService.toast('success', 'Otp verified successfully'));
          this.$state.go("applicants.list",{status: 'All'});
        })
        .catch((err) => this.toaster.pop(this.QuarcService.toast('error', 'Error occurred while verifying contact number')));
    }


  });
