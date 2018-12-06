angular.module('uiGenApp')
  .config(($stateProvider) => {
    $stateProvider
    // /customers/:customerId/shipments/new
      .state('customer.shipments', {
        abstract: true,
        url: '/shipments',
        template: '<div ui-view></div>',
      })
      .state('customer.shipments.index', {
        url: '?bucket&sid&uid',
        templateUrl: 'app/routes/customers/shipments/index/index.html',
        controller: 'CustomersShipmentsIndexController',
        controllerAs: '$ctrl',
        resolve: {
          customer: ($http, $stateParams) => $http
            .get(`/users/${$stateParams.id}`)
            .then(({ data }) => data),
        },
      })
      .state('customer.shipments.create', {
        url: '/create',
        templateUrl: 'app/routes/customers/shipments/create/create.html',
        controller: 'ShipmentCreateController',
        controllerAs: '$ctrl',
        resolve: {
          shipment: () => null,
          customer: ($http, $stateParams) => $http
            .get(`/users/${$stateParams.id}`)
            .then(({ data }) => data),
        },
      })
      .state('customer.shipment', {
        abstract: true,
        url: '/shipments/:shipmentId',
        template: '<div ui-view></div>',
      })
      .state('customer.shipment.update', {
        url: '/update',
        templateUrl: 'app/routes/customers/shipments/create/create.html',
        controller: 'ShipmentCreateController',
        controllerAs: '$ctrl',
        resolve: {
          customer: ($http, $stateParams, toaster) => $http
            .get(`/users/${$stateParams.id}`)
            .then(({ data }) => data)
            .catch(() => toaster.pop('error', 'Error loading customer')),
          shipment: ($http, $stateParams, toaster) => {
            const fl = [
              'id', 'customer_id', 'created_at', 'customer_name', 'phone', 'address',
              'packages_count', 'final_weight', 'weight', 'volumetric_weight',
              'value_amount', 'sub_total_amount', 'discount_amount',
              'package_level_charges_amount', 'pick_up_charge_amount', 'estimated_amount',
              'loyalty_amount', 'payment_gateway_fee_amount', 'wallet_amount',
              'final_amount', 'coupon_amount', 'tracking_code', 'order_code',
              'tracking_url', 'number_of_packages', 'weight_by_shipping_partner',
              'shipping_carrier', 'dispatch_date', 'is_axis_banned_item', 'transaction_id',
            ].join(',');

            return $http
              .get(`/shipments/${$stateParams.shipmentId}?fl=${fl}`)
              .then(({ data }) => data)
              .catch(() => toaster.pop('error', 'Error loading shipment'));
          },
          // charges: ($http, $stateParams, toaster) => $http
          //   .get(`/shipments/${$stateParams.shipmentId}/charges`)
          //   .then(({ data }) => data)
          //   .catch(() => toaster.pop('error', 'Error loading shipment')),
        },
      });
  });
