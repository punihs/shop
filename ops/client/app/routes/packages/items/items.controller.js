class PackageItemsController {
  constructor(
    Page, $state, $stateParams, $http, toaster, pkg,
    Session, item, S3, URLS, createCategory) {
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
    ctrl.S3.uploadAdvanced(advancedFile, ctrl.data, ctrl);
  }

  startInvoiceUpload(ctrl, invoiceFile) {
    ctrl.S3.uploadInvoice(invoiceFile, ctrl.data, ctrl);
  }

  startEcommerceUpload(ctrl, ecommerceFile) {
    ctrl.S3.uploadEcommerce(ecommerceFile, ctrl.data, ctrl);
  }

  $onInit() {
    this.isPrint = this.Session.read('isPrint');
    qz.config = null;
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
      if (this.data.PackageItemCategory) {
        this.PackageItemCategory.model = this.data.PackageItemCategory.name;
      }
      const imagePath = `${this.URLS.CDN}/shoppre/${this.data.object}`;
      this.data.object_thumb = imagePath;
      if (this.data.object_advanced) {
        const imagePathAdvanced = `${this.URLS.CDN}/shoppre/${this.data.object_advanced}`;
        this.data.object_thumb = imagePathAdvanced;
      }
      if (this.data.object_invoice) {
        const invoicePath = `${this.URLS.CDN}/shoppre/${this.data.object_invoice}`;
        this.data.object_thumb = invoicePath;
      }
      if (this.data.object_ecommerce) {
        const ecommercePath = `${this.URLS.CDN}/shoppre/${this.data.object_ecommerce}`;
        this.data.object_thumb = ecommercePath;
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

  changePrintMode() {
    this.Session.create('isPrint', this.isPrint);
  }

  printCode() {
    this.printHTML();
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
    const allowed = [
      'name',
      'quantity',
      'price_amount',
      'total_amount',
      'object',
      'object_advanced',
      'object_invoice',
      'package_item_category_id',
      'object_ecommerce',
      'ecommerce_link',
    ];

    const method = packageItemId ? 'put' : 'post';

    const url = `/packages/${this.pkg.id}/items${packageItemId ? `/${packageItemId}` : ''}`;
    console.log('Data', this.data);

    return this
      .$http[method](url, _.pick(data, allowed))
      .then(({ data }) => {
        console.log('res', data)
        this.packageItem = data.packageItemId;
        const { id } = data.packageItemId;
        this.submitting = false;
        const itemData = {
          id: data.packageItemId,
          packageId: data.id,
          customerName: data.Customer.first_name,
          virtualAddressCode: data.Customer.virtual_address_code,
          store: data.Store.name,
          itemCategory: this.PackageItemCategory.model,
          itemName: this.data.name,
          totalItems: data.totalItems,
          w: 1,
          cell: 1,
          rack: 1,
          column: 3,
        };

        this
          .toaster
          .pop('success', `#${id} Package ${this.EDIT
            ? 'Updated'
            : 'Created'} Successfully.`, '');
        if (this.isPrint) {
          this.printHTML(itemData);
          return this.$state.go('package.show', { id: packageId });
        } else {
          console.log('Print option not selected', itemData);
        }
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

// / Pixel Printers ///
  printHTML(data) {
    // let printerName = document.getElementById("printerName");
    const printerName = 'ZDesigner GC420t';

    if (qz.websocket.isActive()) {
      this.printData(data);
    } else {
      qz.websocket.connect().then(() =>
        qz.printers.getDefault() // Pass the printer name into the next Promise
      ).then((printer) => {
        qz.printerConfig = qz.configs.create(printer); // Create a default config for the found printer
        return this.printData(data);
      })
        .catch(e => {
          console.log(e);
        });
    }
  }

  printData(itemData) {
    const printData = [
      { type: 'raw', format: 'plain', data:
          'CT~~CD,~CC^~CT~\n' +
          '^XA\n' +
          '^PW812\n' +
          '^FO470,62^BY3^B3N,N,75N,N^FD' + itemData.id + '^FS^PQ1\n' +
          '^FT523,200^ADN,54,30^FH\\^FD' + itemData.id + '^FS\n' +
          '^FT67,198^A0N,35,33^FH\\^FD' + itemData.store + '^FS\n' +
          '^FT69,141^A0N,50,50^FH\\^FDPKG: ' + itemData.packageId + '^FS\n' +
          '^FT67,253^A0N,35,33^FH\\^FD' + itemData.customerName + '^FS\n' +
          '^FT524,356^A0N,35,33^FH\\^FD' + itemData.virtualAddressCode + '^FS\n' +
          '^FT69,301^A0N,35,33^FH\\^FD' + itemData.itemCategory + ' | Rack: ^FS\n' +
          '^FT69,356^A0N,35,33^FH\\^FD' + itemData.itemName + '^FS\n' +
          '^FT69,82^A0N,62,60^FH\\^FDSHOPPRE.COM^FS\n' +
          '^FT624,299^A0N,73,72^FH\\^FD#' + itemData.totalItems + '^FS\n' +
          '^PQ1,0,1,Y^XZ' },
    ];

    return qz.print(qz.printerConfig, printData);
  }

}

angular.module('uiGenApp')
  .controller('PackageItemsController', PackageItemsController);

