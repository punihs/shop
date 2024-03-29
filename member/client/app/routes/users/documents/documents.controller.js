class DocumentController {
  /* @ngInject*/
  constructor(Page, $state, $stateParams, $http, toaster, URLS, S3, Session) {
    this.Page = Page;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.Session = Session;
    this.URLS = URLS;
    this.S3 = S3;

    return this.$onInit();
  }

  $onInit() {
    this.Number = Number;
    this.file = {};
    this.submitting = false;
    this.data = {};
    this.userDocuments = [];
    this.Page.setTitle('Document  Details - My Account');
    this.getUserDocuments();
  }

  uploadFile(file) {
    this.$http
      .get('/minio/presignedUrl', { params: { filename: file.name } })
      .then(({ data: { object, url } }) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url, true);
        xhr.send(file);
        xhr.onload = () => {
          if (xhr.status === 200) {
            this.toaster.pop('success', 'File uploaded');
            this.data.object = object;
            this.uploadingPhotos = false;
          }
        };

        return object;
      })
      .catch(() => this.toaster.pop('error', 'Error while uploading file'));
  }

  getUserDocuments() {
    const id = this.Session.read('userinfo').id;
    this
      .$http
      .get(`/userDocuments?customer_id=${id}`)
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
        this.data = {};
        this.file = {};
        this.submitting = false;
        this.reset(documentForm);
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

  reset(documentForm) {
    this.data = {};
    documentForm.$setPristine();
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
