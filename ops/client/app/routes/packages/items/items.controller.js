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

    return this
      .$http[method](url, _.pick(data, allowed))
      .then(({ data }) => {
        if (!this.EDIT) {
          this.packageItem = data.packageItemId;
          const {id} = data.packageItemId;
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
            return this.$state.go('package.show', {id: packageId});
          }
        }
        this
          .toaster
          .pop('success', `#${packageItemId} Package ${this.EDIT
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

  // / Pixel Printers ///
  printHTML(data) {
    // let printerName = document.getElementById("printerName");
    const printerName = 'ZDesigner GC420t';

    if (qz.websocket.isActive()) {
      this.printData(data);
    } else {
      this.security();
      qz.websocket.connect().then(() =>
        qz.printers.getDefault() // Pass the printer name into the next Promise
      ).then((printer) => {
        qz.printerConfig = qz.configs.create(printer); // Create a default config for the found printer
        return this.printData(data);
      })
        .catch(e => {
        });
    }
  }

  printData(itemData) {
    const printData = [
      { type: 'raw', format: 'plain', data:
          `${'CT~~CD,~CC^~CT~\n' +
          '^XA\n' +
          '^PW812\n' +
          '^FO470,62^BY3^B3N,N,75N,N^FD'}${itemData.id}^FS^PQ1\n` +
          `^FT523,200^ADN,54,30^FH\\^FD${itemData.id}^FS\n` +
          `^FT67,198^A0N,35,33^FH\\^FD${itemData.store}^FS\n` +
          `^FT69,141^A0N,50,50^FH\\^FDPKG: ${itemData.packageId}^FS\n` +
          `^FT67,253^A0N,35,33^FH\\^FD${itemData.customerName}^FS\n` +
          `^FT524,356^A0N,35,33^FH\\^FD${itemData.virtualAddressCode}^FS\n` +
          `^FT69,301^A0N,35,33^FH\\^FD${itemData.itemCategory} | Rack: ^FS\n` +
          `^FT69,356^A0N,35,33^FH\\^FD${itemData.itemName}^FS\n` +
          '^FT69,82^A0N,62,60^FH\\^FDSHOPPRE.COM^FS\n' +
          `^FT624,299^A0N,73,72^FH\\^FD#${itemData.totalItems}^FS\n` +
          '^PQ1,0,1,Y^XZ' },
    ];

    return qz.print(qz.printerConfig, printData);
  }

  security() {
    qz.security.setCertificatePromise((resolve, reject) => {
      const certificate = '-----BEGIN CERTIFICATE-----\n' +
        'MIIDhDCCAmwCCQD4uQ6F+ltoRzANBgkqhkiG9w0BAQsFADCBgjELMAkGA1UEBhMC\n' +
        'SU4xCzAJBgNVBAgMAktBMRIwEAYDVQQHDAlCYW5nYWxvcmUxCzAJBgNVBAoMAlFa\n' +
        'MQswCQYDVQQLDAJRWjEWMBQGA1UEAwwNKi5zaG9wcHJlLmNvbTEgMB4GCSqGSIb3\n' +
        'DQEJARYRdmlrYXNAc2hvcHByZS5jb20wIBcNMTkwMzI0MDkyMTU3WhgPMjA1MDA5\n' +
        'MTYwOTIxNTdaMIGCMQswCQYDVQQGEwJJTjELMAkGA1UECAwCS0ExEjAQBgNVBAcM\n' +
        'CUJhbmdhbG9yZTELMAkGA1UECgwCUVoxCzAJBgNVBAsMAlFaMRYwFAYDVQQDDA0q\n' +
        'LnNob3BwcmUuY29tMSAwHgYJKoZIhvcNAQkBFhF2aWthc0BzaG9wcHJlLmNvbTCC\n' +
        'ASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAK026IiLnf4kyv1+UbjnpgDb\n' +
        'YaDpv8HSuf3QM1mGC6CyBloALmxCVvdRD/zL0tMlTsycV01ZnyB5SFWuoiJpmDhg\n' +
        'fAsZNR8V3lp+ycFqgr8WsA3GYSvd32LQxW4YEX2UL/DtkhJ3ohjUyOcbOzB8yPmx\n' +
        '0ALMgW31M7x3ml5Zn86/VQ2QJw/oJdHMzvCJVGMP1AuncOkkTUQOrvSMXhK0zFMm\n' +
        '6Wi4wVAo/BM6HQMTWNwrpJBD6AvbBP3Tfd08EdsgcO1XxzPazYoViJNmgl/M0925\n' +
        'emSyx7DOmmv31E19IHrQiIj/6xbKXSpXj3vGkuUq8xkHqILu/uTgGKJ7wAcelqEC\n' +
        'AwEAATANBgkqhkiG9w0BAQsFAAOCAQEAZk/LSJvcyzI7I+taMJOhxkVNWK2KbIXl\n' +
        'py6GcHvBpXAxj3iwxmMrxMi90SM4fo0R3emafXnzjEBD+jA9/RUwKGHb6ZgViMzF\n' +
        'rRr0QVPa7Cm/mWlF0Te5TmmPDP2JLrDEusZtURFZ/2to9j8MXPRTttcLczjtNhwS\n' +
        'bQu2npU7r/c2/E42xb+m+huI2BK+tXelBtrnoAXP7OdTlCk7ML1Sb1QUfdH+AMDd\n' +
        'RDhZOJbwFVOc/8hbXwvT5BheZ/c/t5VMV6nzf0uuXA+4WSaQY6qcegvmnoRr528A\n' +
        'VrrMm3fjD5hG/vJs1EeAO5BXghyOfaGBIbhp6gbposBC15OlWcoEWg==\n' +
        '-----END CERTIFICATE-----';
      resolve(certificate);
    });

    const privateKey = '-----BEGIN RSA PRIVATE KEY-----\n' +
      'MIIEowIBAAKCAQEArTboiIud/iTK/X5RuOemANthoOm/wdK5/dAzWYYLoLIGWgAu\n' +
      'bEJW91EP/MvS0yVOzJxXTVmfIHlIVa6iImmYOGB8Cxk1HxXeWn7JwWqCvxawDcZh\n' +
      'K93fYtDFbhgRfZQv8O2SEneiGNTI5xs7MHzI+bHQAsyBbfUzvHeaXlmfzr9VDZAn\n' +
      'D+gl0czO8IlUYw/UC6dw6SRNRA6u9IxeErTMUybpaLjBUCj8EzodAxNY3CukkEPo\n' +
      'C9sE/dN93TwR2yBw7VfHM9rNihWIk2aCX8zT3bl6ZLLHsM6aa/fUTX0getCIiP/r\n' +
      'FspdKlePe8aS5SrzGQeogu7+5OAYonvABx6WoQIDAQABAoIBAC8fQfFrsiaikcqW\n' +
      'o9rewi13gT7KeI1dK5YeHuoa6mzkIZA4fmibP5d2qRfHx2oDu0U0vxde60hlVkVh\n' +
      'BeDAw1WLAhPu3qG/TEdoOLDyrfEYVfrZXjQV3yC91QgXaiK0vroXl2aIv0NsF9+v\n' +
      'a9HMEMzFD+bDBe8JBvMdwpQqY6xVtFQ3beEctu/XbWE6G4fHfqUpSFoa90WMtuMl\n' +
      'KKVYdUKJ9Gfrny29lvq/Um5zjCLlIgR1J0HX4uKvTm3HAxDPI/0NHkH4Ln5qrjor\n' +
      'JEu1/JxtHZDxUCUpYlW7QEUkO1xz1WgeyqaZ/kbvPyC6lf6s4gaEinJ7pVxWsHu6\n' +
      '0m0+2QECgYEA1KXC69VDUFY6UGiWIUKBexrNUKrMXZ/mJoB8ny3skXDxK8weKURu\n' +
      '7Cg9OvXwlk02ZAgVBMEcwPKXnGYw41kmdvFGtu83IvUL3q8ahHkikv9SwvA2FnJa\n' +
      '06qQ0sqpSseWhAjhAf91nxcpNU40VuUN9N7GnmR6qwPkmpkDqyYBprECgYEA0Icb\n' +
      'Yk40x0nUJzFGOYwPCahMhzQk8XUXSDNVB3DKqYuuhrhx4sNOIePcktLauoo66+Ee\n' +
      'OLnRzCQhB0jRIcnd/pOe1hJDUDNLyk0nEbB4tiTkRMHpGUeerD9vGqlm430p4Wic\n' +
      '4c5ALsMyK7a+SmX9TtEZAheW8tQ+3ZZwDYbZyvECgYBsALzdlvWXahQ4HsaRofut\n' +
      'kNFS9UzTCJGWYI/rMSIERL7ZJdTz1MQZwd5Hgf5t+E11xP0X6xU1koEaeHTAI9l7\n' +
      'c9QcuabhZGBg+8KWIghDbNaWF/cAs5gaBXmE9lXBm1mBOhk+MIeHA/Z0EoJW2AOc\n' +
      'qUFr1VDQZyvGsYzBco5IIQKBgQDJKj2BpX6G7rMqp/9eDr6HC4PgPq6Q/Otb7KFP\n' +
      'j0EDNMxGDPNY1h6u1Pn57k2x/R4AZejYwnIhJI10UIvns61kJRbq3y1u1j18SNey\n' +
      '2fJpjMdliUeM6qmo830EVH38YcegO2J095q1QftJbn6+mQs4GMGuYgFt+tE2xSUN\n' +
      '95RtkQKBgFGwn7dzKoIOzKkH2AyqUIzo/zlEMOj3J6GyVeTBfRBqWImQs7DhmDeV\n' +
      'ZdnTqyMBOuJ+5erR9p4EYXnaWpkDyx0Bop6dwlvVadb4toZQCOXFLfVxdwwhEUx4\n' +
      'oJ076QBmCssqG1HRs0RUShjQtuf6/yMNy7/aQ4q+QZQbgrU6Q7Uc\n' +
      '-----END RSA PRIVATE KEY-----';

    qz.security.setSignaturePromise((toSign) => function (resolve, reject) {
      try {
        // var rsa = new RSAKey();
        // rsa.readPrivateKeyFromPEMString(privateKey);
        // var hashAlg = 'sha1';
        // var hSig = rsa.sign(toSign, hashAlg);
        // return resolve(linebrk(hSig, 64));

        const pk = KEYUTIL.getKey(privateKey);
        const sig = new KJUR.crypto.Signature({ alg: 'SHA1withRSA' });
        sig.init(pk);
        sig.updateString(toSign);
        const hex = sig.sign();
        resolve(stob64(hextorstr(hex)));

        // var pk = new RSAKey();
        // pk.readPrivateKeyFromPEMString(privateKey);
        // var hex = pk.signString(toSign, 'sha1');
        // console.log("DEBUG: \n\n" + stob64(hextorstr(hex)));
        // resolve(stob64(hextorstr(hex)));
      } catch (err) {
        reject(err);
      }
    });
  }
}

angular.module('uiGenApp')
  .controller('PackageItemsController', PackageItemsController);

