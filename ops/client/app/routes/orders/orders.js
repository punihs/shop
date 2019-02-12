
angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('orders', {
        abstract: true,
        url: '/orders',
        template: '<div ui-view></div>',
      })
      .state('orders.index', {
        url: '?bucket&sid&uid',
        templateUrl: 'app/routes/orders/index/index.html',
        controller: 'OrdersIndexController',
        controllerAs: '$ctrl',
      })
      .state('order', {
        abstract: true,
        url: '/orders/:id',
        template: '<div ui-view></div>',
      })
      .state('order.show', {
        url: '?{activeTab:int}',
        templateUrl: 'app/routes/orders/show/show.html',
        controller: 'OrderShowController',
        controllerAs: '$ctrl',
        resolve: {
          pkg($http, $stateParams, $state) {
            const fl = [
              'id', 'customer_id', 'if_promo_unavailable', 'created_at', 'price_amount',
              'instruction', 'promo_info', 'promo_discount', 'promo_code', 'sales_tax',
              'delivery_charge', 'personal_shopper_cost', 'sub_total', 'total_quantity',
              'comments', 'store_name', 'seller_invoice', 'order_code', 'store_id', 'amount_paid', 'buy_if_price_changed',
            ];

            const params = {
              fl: fl.join(','),
              type: 'ps',
            };

            return $http
              .get(`/packages/${$stateParams.id}`, { params })
              .then(({ data: pkg }) => pkg)
              .catch(() => $state.go('access.404'));
          },
        },
      })
      .state('order.update', {
        url: '/update',
        templateUrl: 'app/routes/orders/update/update.html',
        controller: 'OrderUpdateController',
        controllerAs: '$ctrl',
        resolve: {
          pkg: ($http, $stateParams, toaster) => {
            const fl = [
              'id', 'customer_id', 'invoice_code', 'created_at',
              'weight', 'is_doc', 'price_amount', 'content_type', 'sales_tax',
              'delivery_charge', 'personal_shopper_cost', 'sub_total', 'total_quantity',
              'comments', 'store_name', 'seller_invoice', 'order_code', 'store_id', 'amount_paid',
            ];

            const params = {
              fl: fl.join(','),
              type: 'ps',
            };

            return $http
              .get(`/packages/${$stateParams.id}`, { params })
              .then(({ data }) => data)
              .catch(() => toaster.pop('error', 'Error loading package'));
          },
        },
      });
  });
