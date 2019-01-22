class PersonalShopperTransactionResponseController {
  constructor($http, Page, toaster, $stateParams, ACCOUNT_DETAILS) {
    this.$http = $http;
    this.Page = Page;
    this.toaster = toaster;
    this.$stateParams = $stateParams;
    this.account = ACCOUNT_DETAILS;

    return this.$onInit();
  }

  $onInit() {
    this.PAYMENT_GATEWAY = {
      WIRE: 1,
      CASH: 2,
      CARD: 3,
      PAYTM: 4,
      PAYPAL: 5,
      WALLET: 6,
    };
    this.Page.setTitle('Payment Success');
    this.packages = [];
    this.getList();
  }

  getList() {
    this.$http
      .get(`/packages/personalShopperPackage/paymentSuccess?object_id=${this.$stateParams.object_id}`)
      .then(({ data: { packages } }) => {
        this.packages = packages;

        const transactionIds = this.packages.map(x => x.transaction_id);
        let transactionId = '';

        this.$http
          .get(`$/api/transactions?transactionIds=${transactionIds}`)
          .then(({ data: transactions }) => {
            this.transactions = transactions;

            transactionId = transactions.map(x => x.id);

            this.packages.forEach((pkg) => {
              if (transactionId.includes(pkg.transaction_id)) {
                this.transactions.map((trans) => {
                  if (pkg.transaction_id === trans.id) {
                    Object.assign(pkg, { payment_gate_id: trans.payment_gateway_id });
                    Object.assign(pkg, { payment_status: trans.payment_status });
                  }
                });
              }
            });
          });
      })
      .catch((err) => {
        this
          .toaster
          .pop('error', err.data.message);
      });
  }
}
angular
  .module('uiGenApp')
  .controller('PersonalShopperTransactionResponseController', PersonalShopperTransactionResponseController);
