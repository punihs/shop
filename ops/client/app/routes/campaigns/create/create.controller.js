class CampaignCreateController {
  constructor(Page, $state, $stateParams, $http, toaster, Session, S3, moment, campaign) {
    this.Session = Session;
    this.Page = Page;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.$ = $;
    this.S3 = S3;
    this.moment = moment;
    this.data = campaign || {};
    this.$onInit();
  }

  $onInit() {
    this.EDIT = !!this.$stateParams.id && this.$stateParams.id !== '';
    this.uploadingPhotos = false;

    if (this.data) {
      this.data.expiry_date = new Date(this.data.expiry_date);
      this.data.start_date = new Date(this.data.start_date);
    }

    if (this.EDIT) {
      this.file = 'Nothing';
    }
  }

    reset(newPackageForm)
    {
      this.data = {};
      newPackageForm.$setPristine();
    }

    validateForm(form)
    {
      this.$stateParams.autofocus = '';
      Object.keys(form).filter(x => !x.startsWith('$')).forEach((f) => {
        if (form[f] && form[f].$invalid) {
          if (!this.$stateParams.autofocus) this.$stateParams.autofocus = f;
          form[f].$setDirty();
        }
      });
      return form.$valid;
    }


    startUpload(ctrl, file)
    {
      ctrl.S3.upload(file, ctrl.data, ctrl);
    }


    create(newCampaignForm)
    {
      this.message = '';
      if (this.submitting) return null;
      this.submitting = true;
      this.clickUpload = true;

      if (!this.data.discount_code && !this.data.cashback_code) {
        this.message = 'Please Enter Discount Code OR Cashback Code';
        this.submitting = false;
        return;
      }

      if (!this.data.discount_percentage && !this.data.cashback_percentage) {
        this.message = 'Please Enter Discount Percentage OR Cashback Percentage';
        this.submitting = false;
        return;
      }
      if (this.moment(this.data.expiry_date) < this.moment(this.data.start_date)) {
        this.message = 'Enter valid Expiry Date';
        this.submitting = false;
        return;
      }

      const form = this.validateForm(newCampaignForm);

      const data = Object.assign({}, this.data);
      if (!form) return (this.submitting = false);

      const method = this.EDIT ? 'put' : 'post';
      const url = this.EDIT ?
       `$/campaigns/${this.$stateParams.id}` :
        '$/campaigns/';

      return this
        .$http[method](url, data)
        .then(({data: status}) => {
          this.submitting = false;
          const message = this.EDIT ? 'Updated' : 'Created';
          this
            .toaster
            .pop('success', `${this.data.name} Campaign ${message}`);
          this.reset(newCampaignForm);
        })
        .catch((err) => {
          this.submitting = false;
          this
            .toaster
            .pop('error', 'There was problem while updating Campaign');
        });
    }
  }

angular.module('uiGenApp')
  .controller('CampaignCreateController', CampaignCreateController);

