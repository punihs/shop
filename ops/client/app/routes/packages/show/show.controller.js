class PackageShowController {
  /* @ngInject */
  constructor(
    $http, $stateParams, URLS, $sce, $state, $window, Page, Session, $q, ChangeState,
    pkg, ListModal, toaster, $scope, ViewPhotoService) {
    this.Number = Number;
    this.$scope = $scope;
    this.URLS = URLS;
    this.$sce = $sce;
    this.$http = $http;
    this.$state = $state;
    this.Page = Page;
    this.Session = Session;
    this.$q = $q;
    this.$stateParams = $stateParams;
    this.toaster = toaster;
    this.ChangeState = ChangeState;
    this.pkg = pkg;
    this.ListModal = ListModal;
    this.ViewPhotoService = ViewPhotoService;
    this.moment = moment;
    this.$window = $window;

    this.$onInit();
  }

  $onInit() {
    this.data = this.pkg;
    this.states = this.Session.read('adminStates');
    this.user = this.Session.read('adminUserinfo');

    qz.config = null;

    this.location = this.$window.location;
    this.customer = this.data.Customer;

    this.Page.setFavicon(`${this.$stateParams.profilePhotoUrl}`);
    if (this.data.Store) this.Page.setTitle(this.data.Store.name);

    this.root = '_root_';
    this.modal = {};
    this.packageItemsAdditionAllowedStateIds = [1];
    this.editAllowedStates = [1, 2, 5, 6];
    this.packageItems = [];
    this.charges = null;

    const { activeTab } = this.$stateParams;
    if (activeTab) this.$scope.activeTab = activeTab;

    this
      .$http
      .get(`/packages/${this.$stateParams.id}/items`)
      .then(({ data: packageItems }) => (this.packageItems.push(...packageItems)));
  }

  printBarcode(item, allPkgItemIds) {
    const totalItems = allPkgItemIds.indexOf(item.id) + 1;
    const itemData = {
      id: item.id,
      packageId: item.package_id,
      customerName: `${this.customer.first_name} + ' ' + ${this.customer.last_name}`,
      virtualAddressCode: this.customer.virtual_address_code,
      store: this.data.Store.name,
      itemCategory: item.PackageItemCategory.name,
      itemName: item.name,
      totalItems,
      w: 1,
      cell: 1,
      rack: 1,
      column: 3,
    };
    this.printHTML(itemData);
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

  openPhoto(photo) {
    this.ViewPhotoService.open(photo);
  }

  setMessage(description) {
    this.modal = {
      modalButtons: [{ name: 'OK', type: 'default' }],
      title: 'Action Required',
      description,
    };
    this.ListModal.open(this.modal, 'popup');
  }

  chatHoverText() {
    return `Initiate chat with ${this.data.name}`;
  }

  toggleBookmark(status) {
    this
      .$http
      .post(`/packages/${this.$stateParams.id}/bookmarks`, { status })
      .then(() => {
        this.data.is_bookmarked = status;
        this.toaster
          .pop('success',
            (status
              ? 'Bookmarked Successfully'
              : 'Unbookmarked Successfully'
            ));
      })
      .catch(() => {
        this.toaster
          .pop('error', 'There was problem loading data. Please contact ShoppRe team');
      });
  }


  getCharges() {
    if (this.charges) return;
    this.chargesIcon = {
      storage_amount: 'fa-dropbox',
    };

    this
      .$http
      .get(`/packages/${this.$stateParams.id}/charges`)
      .then(({ data: charges }) => {
        this.charges = Object
          .keys(charges)
          .map(key => ({
            key,
            label: _.startCase(key.replace('_', ' ').toLowerCase()),
            chargeAmount: charges[key],
          }));
      });
  }


  uploadFiles(files) {
    this.$q
      .all(files
        .map((file) => this
          .$http
          .post(`/package/${this.$stateParams.id}/items`, {
            documentFile: file,
          })))
      .then((docs) => {
        const data = docs.map(file => {
          const { id, filename, link } = file.data;
          return { id, filename, link };
        });
        this.document = [...this.document, ...data];
      }
      );
  }

  deleteDocument(id, key) {
    this
      .$http
      .delete(`/package/${id}/items`)
      .then(() => this.document.splice(key, 1));
  }

  deletePackage(packageid) {
    const c = confirm;
    const ok = c('Are you sure? Deleting Your Package');
    if (!ok) {
      return null;
    } else if (this.packageItems.length) {
      if (this.packageItems[0].package_order_code) {
        return this.toaster
          .pop('error', 'Personal Shopper Package cant be deleted , Please contact Tech Team');
      }
    }

    return this
      .$http
      .delete(`/packages/${packageid}`)
      .then(({ data: { message } }) => {
        this.toaster
          .pop('success', message);
        this.$state.go('packages.index');
      })
      .catch(() => {
        this.toaster
          .pop('error', 'There was problem deleting package');
      });
  }

  deletePackageItem(packageid, itemId, index) {
    const c = confirm;
    const ok = c('Are you sure? Deleting Your Package Item');
    if (!ok) {
      return null;
    } else if (this.packageItems.length) {
      if (this.packageItems[0].package_order_code) {
        return this.toaster
          .pop('error', 'Personal Shopper Package Item cant be deleted , Please contact Tech Team');
      }
    }

    return this
      .$http
      .delete(`/packages/${packageid}/item/${itemId}/delete`)
      .then(({ data: { message } }) => {
        this.toaster
          .pop('success', message);
        return this.packageItems.splice(index, 1);
      })
      .catch((err) => {
        let message = '';
        message = err.status === 403 ?
          err.data.message : 'There was problem deleting package item';
        this.toaster
          .pop('error', message);
      });
  }
}

angular.module('uiGenApp')
  .controller('PackageShowController', PackageShowController);
