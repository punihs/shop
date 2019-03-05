module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  transaction_id: DataTypes.INTEGER,
  order_code: DataTypes.STRING,
  customer_name: DataTypes.STRING,
  address: DataTypes.STRING,
  phone: DataTypes.STRING,
  packages_count: DataTypes.INTEGER,
  weight: DataTypes.DECIMAL(8, 2),
  volumetric_weight: DataTypes.DECIMAL(8, 2),
  final_weight: DataTypes.DECIMAL(8, 2),
  value_amount: DataTypes.DECIMAL(8, 2),
  sub_total_amount: DataTypes.DECIMAL(8, 2),
  discount_amount: DataTypes.DECIMAL(8, 2),
  package_level_charges_amount: DataTypes.DECIMAL(8, 2),
  estimated_amount: DataTypes.DECIMAL(8, 2),
  wallet_amount: DataTypes.DECIMAL(8, 2),
  coupon_amount: DataTypes.DECIMAL(8, 2),
  loyalty_amount: DataTypes.DECIMAL(8, 2),
  payment_gateway_fee_amount: DataTypes.DECIMAL(8, 2),
  final_amount: DataTypes.DECIMAL(8, 2),
  is_axis_banned_item: DataTypes.BOOLEAN,
  courier_charge_amount: DataTypes.DECIMAL(8, 2),
  payment_status: DataTypes.STRING,
  payment_gateway_id: DataTypes.STRING,
  status: DataTypes.STRING,
  admin_info: DataTypes.STRING,
  admin_read: {
    type: DataTypes.ENUM,
    values: ['yes', 'no'],
  },
  is_missed: DataTypes.BOOLEAN,
  // - ShippingPartner
  tracking_code: DataTypes.STRING,
  tracking_url: DataTypes.STRING,
  pick_up_charge_amount: DataTypes.INTEGER,
  number_of_packages: DataTypes.INTEGER,
  weight_by_shipping_partner: DataTypes.DOUBLE,
  value_by_shipping_partner: DataTypes.DOUBLE,

  shipping_carrier: DataTypes.STRING,
  dispatch_date: DataTypes.DATE,
  payment_submit_date: DataTypes.DATE,
  carton_box_type: DataTypes.STRING,
  comments: DataTypes.STRING,
  upstream_cost: DataTypes.DECIMAL(8, 2),
  fuel_sur_charge: DataTypes.DECIMAL(8, 2),
  gst_amount: DataTypes.DECIMAL(8, 2),
  carton_box_used: DataTypes.STRING,
  carton_box_Amount: DataTypes.DECIMAL(8, 2),
  carton_box_weight: DataTypes.DECIMAL(8, 2),
  afterShip_slug: DataTypes.STRING,
  connecting_tracking_code: DataTypes.STRING,
  after_ship_id: DataTypes.STRING,
  is_doc: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});
