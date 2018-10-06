class DocumentController {
  /* @ngInject*/
  constructor(Page, $state, $stateParams, $http, toaster, URLS, S3) {
    this.Page = Page;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.URLS = URLS;
    this.S3 = S3;

    return this.$onInit();
  }

  $onInit() {
    this.Number = Number;
    this.submitting = false;
    this.data = {};
    this.userDocuments = {};
    this.Page.setTitle('Document  Details - My Account');
    this.getUserDocuments();
  }

  startUpload(ctrl, file) {
    ctrl.S3.upload(file, ctrl.data, ctrl);
  }

  getUserDocuments() {
    this
      .$http
      .get('/userDocuments')
      .then(({ data }) => {
        this.userDocuments = data;
      });
  }

  validateForm(form) {
    this.$stateParams.autofocus = '';
    Object.keys(form).filter(x => !x.startsWith('$')).forEach((f) => {
      if (form[f] && form[f].$invalid) {
        if (!this.$stateParams.autofocus) this.$stateParams.autofocus = f;
        form[f].$setDirty();
      }
    });
    return form.$valid;
  }

  create(documentForm) {
    if (this.submitting) return null;
    this.submitting = true;
    this.clickUpload = true;

    const form = this.validateForm(documentForm);

    const data = Object.assign({ }, this.data);
    if (!form) return (this.submitting = false);

    return this.$http
      .post('/userDocuments', data)
      .then(({ data: { id } }) => {
        this.submitting = false;
        this.clickUpload = false;
        const document = {
          id,
          created_at: Date.now(),
          object: data.object,
          description: data.description,
        };
        this.userDocuments.push(document);
        this
          .toaster
          .pop('success', 'Document Uploaded Successfully.', '');
      })
      .catch((err) => {
        this.submitting = false;

        const { field } = err.data;
        documentForm[err.data.field].$setValidity('required', false);
        $(`input[name="${field}"]`)[0].focus();

        this
          .toaster
          .pop('error', 'There was problem uploading document. Please contact Shoppre team.');

        this.error = err.data;
      });
  }

  deleteDocument(documentId, index) {
    const c = confirm;
    const ok = c('Are you sure? Deleting Your Document');
    if (!ok) return null;

    return this
      .$http
      .delete(`/userDocuments/${documentId}`)
      .then(() => {
        this.toaster
          .pop('success', 'Your Document Successfully Deleted');
        return this.userDocuments.splice(index, 1);
      })
      .catch((err) => {
        let message = '';
        message = err.status === 403 ?
          err.data.message : 'There was problem deleting Your Document';
        this.toaster
          .pop('error', message);
      });
  }
}

angular.module('uiGenApp')
      .controller('DocumentController', DocumentController);
