class PackageItemsController {
  constructor(
    Page, $state, $stateParams, $http, toaster, pkg,
    Session, item, S3, URLS, createCategory,
  ) {
    this.Session = Session;
    this.Page = Page;
    this.$http = $http;
    this.S3 = S3;
    this.URLS = URLS;
    this.$state = $state;
    this.pkg = pkg;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.Number = Number;
    this.$ = $;
    this.submitting = false;
    this.data = item || {};
    this.advancedData = item || {};
    this.createCategory = createCategory;
    this.$onInit();
  }

  open() {
    this.createCategory.open();
  }

  startUpload(ctrl, file) {
    ctrl.S3.upload(file, ctrl.data, ctrl);
  }

  startAdvancedUpload(ctrl, advancedFile) {
    ctrl.S3.uploadAdvanced(advancedFile, ctrl.advancedData, ctrl);
  }

  $onInit() {
    this.uploadingPhotos = false;
    this.EDIT = !!this.$stateParams.packageItemId && this.$stateParams.packageItemId !== '';
    this.quickMode = this.EDIT ? false : (this.Session.read('quickMode-items') || false);
    this.TITLE = `${this.EDIT ? 'Edit' : 'Add New'} PackageItem`;
    this.Page.setTitle(this.TITLE);
    this.getPopularPackageCategories();

    this.PackageItemCategory = {
      select: ($item) => {
        this.data.package_item_category_id = $item.id;
        this.PackageItemCategory.model = $item.name;
      },

      setId: () => {
        const { lastSearchResults } = this.PackageItemCategory;
        if (!lastSearchResults) return this.PackageItemCategory.lastSearchResults;
        const [store] = (this.PackageItemCategory.lastSearchResults || [])
          .filter(item => (item.name.toLowerCase() === this.PackageItemCategory
            .model.toLowerCase()));
        if (store) return this.PackageItemCategory.select(store);
        return null;
      },

      blur: () => {
        if (!this.PackageItemCategory.lastSearchResults) {
          return this.PackageItemCategory
            .get(this.PackageItemCategory.model)
            .then(() => this.PackageItemCategory.setId());
        }
        return this.PackageItemCategory.setId();
      },

      get: search => this.$http
        .get('/search', {
          params: {
            type: 'PackageItemCategory',
            q: search,
          },
        })
        .then(({ data: { items } }) => {
          this.PackageItemCategory.lastSearchResults = items;
          return items;
        }),

      noResults: false,
      loadingPackageItemCategory: false,
    };

    if (this.EDIT) {
      this.PackageItemCategory.model = this.data.PackageItemCategory.name;
      const imagePath = `${this.URLS.CDN}/shoppre/${this.data.object}`;
      this.data.object_thumb = imagePath;
      if (this.advancedData.object_advanced) {
        const imagePathAdvanced = `${this.URLS.CDN}/shoppre/${this.advancedData.object_advanced}`;
        this.advancedData.object_thumb = imagePathAdvanced;
      }
      this.file = 'Nothing';
    }
  }

  reset(newPackageItemForm) {
    this.data = {};
    this.PackageItemCategory.model = '';
    newPackageItemForm.$setPristine();
    this.focus('packageCategory_id');
  }

  focus(field) {
    $(`input[name="${field}"]`)[0].focus();
  }

  getPopularPackageCategories() {
    this
      .$http
      .get('/packageItemCategories')
      .then(({ data: packageItemCategories }) => {
        this.packageItemCategories = packageItemCategories;
      });
  }

  changeMode() {
    this.Session.create('quickMode-items', this.quickMode);
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

  create(newPackageItemForm) {
    if (!this.data.package_item_category_id) {
      return this
        .toaster
        .pop('error', 'Category not found');
    }

    if (this.submitting) return null;

    this.submitting = true;
    this.clickUpload = true;
    const form = this.validateForm(newPackageItemForm);

    const data = Object.assign({ }, this.data);
    if (!form) return (this.submitting = false);
    const { packageItemId, id: packageId } = this.$stateParams;
    data.packageId = packageId;

    if (this.advancedData.object_advanced) {
      data.object_advanced = this.advancedData.object_advanced;
    }

    const allowed = [
      'name',
      'quantity',
      'price_amount',
      'total_amount',
      'object',
      'object_advanced',
      'package_item_category_id',
    ];

    const method = packageItemId ? 'put' : 'post';

    const url = `/packages/${this.pkg.id}/items${packageItemId ? `/${packageItemId}` : ''}`;

    return this
      .$http[method](url, _.pick(data, allowed))
      .then(({ data: packageItem }) => {
        this.packageItem = packageItem;
        const { id } = packageItem;
        this.submitting = false;

        this
          .toaster
          .pop('success', `#${id} Package ${this.EDIT
            ? 'Updated'
            : 'Created'} Successfully.`, '');

        return this.$state.go('package.show', { id: packageId });
      })
      .catch((err) => {
        this.submitting = false;

        const { field } = err.data;
        newPackageItemForm[err.data.field].$setValidity('required', false);
        $(`input[name="${field}"]`)[0].focus();


        this
          .toaster
          .pop('error', 'There was problem creating package. Please contact Shoppre team.');

        this.error = err.data;
      });
  }
}

angular.module('uiGenApp')
  .controller('PackageItemsController', PackageItemsController);

