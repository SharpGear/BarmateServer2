const routes = require('express').Router();

admin = require('../controller/admin_controller');
users = require('../controller/user_controller')
cate = require('../controller/category_controller');
pro = require('../controller/product_controller');
order = require('../controller/order_controller');
subcate = require('../controller/subcategory_controller');
helper = require('../controller/helper_controller')
vanue = require('../controller/vanues_controller')
vanuesOrder = require('../controller/vanuesOrder_controller')
userPayments = require('../controller/userPayments_controller')
terminals = require('../controller/terminals_controller')
brands = require('../controller/brand_controller')
Ad = require('../controller/ad_controller') // advertisement controller
report = require('../controller/report_controller')
review = require('../controller/reviews_controller')
page = require('../controller/page_controller')
UserApicontroller = require('../controller/UserApiscontroller')
passport = require('passport');
responseHelper = require('../helper/responseHelper')
jwt = require('jsonwebtoken')
let UserApi = new UserApicontroller();



module.exports = function (app) {



  app.use(function (req, res, next) {
    var token = req.token;
    if (token) {
      jwt.verify(token, 'secret', function (err) {
        if (err) {
          responseHelper.unauthorized(res, err);
        } else {
          next();
        }
      });
    } else {
      next();
    }
  });
  //~~~~Admin Routes~~~~//
  //app.route('/delete').post(helper.delete)
  app.route('/api/get_connected_account_email').post(UserApi.get_connected_account_email);
  app.route('/get_refund_data').get(UserApi.get_refund_data);
  app.route('/api/get_payment_intent_id').post(UserApi.get_payment_intent_id);
  app.route('/stripe_connect').get(UserApi.stripe_connect);
  app.route('/').get(admin.login);
  app.route('/admins').get(admin.admins);
  app.route('/admin').post(admin.login_succsess);
  app.route('/dashboard').get(admin.dashboard);
  app.route('/logout').get(admin.logout);
  app.route('/my_profile').get(admin.admin_list)
  app.route('/edit_admin').get(admin.edit_admin)
  app.route('/update_admin').post(admin.update_admin)
  app.route('/users_chart_dashboard').get(admin.users_chart_dashboard)
  app.route('/venues_chart_dashboard').get(admin.venues_chart_dashboard)
  app.route('/get_user_venue_bars_data').post(admin.get_user_venue_bars_data)

  //~~~~User Routes~~~~~//
  app.route('/add_user').get(users.add_user);
  app.route('/user').post(users.add_users);
  app.route('/users_list').get(users.user_list);
  app.route('/edit_user').get(users.edit_user);
  app.route('/update_user').post(users.update_user);
  app.route('/delete').post(users.deleterows); // route used for all delete functions in admin panel
  app.route('/new_delete').post(users.new_delete_row);
  app.route('/update_status').post(users.update_status);
  app.route('/check_user_email').post(users.check_email);
  // app.route('/reset_password_user').post(users.reset_password_user);


  //~~~category Routes ~~~// 
  app.route('/category_view').get(cate.cate_list);
  app.route('/category').get(cate.category);
  app.route('/add_category').post(cate.add_cate)
  app.route('/edit_ca').get(cate.edit_cate)
  app.route('/update_ca').post(cate.update_cate)


  //~~~~Product Routes~~~~~~//
  app.route('/product_view').get(pro.products_list);
  app.route('/product').get(pro.products);
  app.route('/add_product').post(pro.add_product);
  app.route('/edit_product').get(pro.edit_product)
  app.route('/update_product').post(pro.update_product)
  app.route('/get_categorys').post(pro.get_categorys)
  app.route('/get_subcategory').post(pro.get_subcategory);

  //~~~~brands Routes~~~~~~//
  app.route('/brands').get(brands.brand_list);
  app.route('/edit_brand').get(brands.edit_brand);
  app.route('/update_brand').post(brands.update_brand);
  app.route('/add_brand').get(brands.add_brand);
  app.route('/save_brand').post(brands.save_brand);


  //~~~~Order Routes~~~~~~//
  app.route('/order').get(order.order_list)
  app.route('/view_order').get(order.view_order)
  app.route('/venue_product').get(order.venue_product_purchase_history)
  app.route('/terminalProductPurchaseHistory').get(order.terminalProductPurchaseHistory)

  //~~~~Sales Data Routes~~~~~~//
  app.route('/sales_venues').get(order.sales_venues)
  app.route('/view_order').get(order.view_order)
  app.route('/venue_product').get(order.venue_product_purchase_history)
  app.route('/sales_by_brand').get(order.productSalesDataByBrand)
  app.route('/terminalProductPurchaseHistory').get(order.terminalProductPurchaseHistory)
  app.route('/order_dates').get(order.getTerminalOrdersBydate)
  app.route('/order_brands').get(order.getOrdersBrandsBydate)


  //~~~~Subcategory Routes~~~~~~//
  app.route('/subcate_list').get(subcate.subcategory_list)
  app.route('/subcate').get(subcate.subcategory)
  app.route('/add_subcate').post(subcate.addsubcate)
  app.route('/edit_subcate').get(subcate.edit_subcate)
  app.route('/update_subcate').post(subcate.update_subcate)
  // app.route('/get_subcategory').post(subcate.getsubCategory)
  //app.route('/get_category').post(subcate.get_category)
  app.route('/check_sub_cat_name').post(subcate.check_sub_cat_name);


  //~~~~Venues Routes~~~~~~//
  app.route('/vanue').get(vanue.vanues_list);
  app.route('/edit_vanue').get(vanue.edit_vanue);
  app.route('/createVenue').get(vanue.createVenue);
  app.route('/add_vanue').post(vanue.add_vanue);
  app.route('/update_vanue').post(vanue.update_vanue);
  app.route('/update_status_venue').post(vanue.update_status_venue);
  app.route('/product_list').get(vanue.product_list);
  //vanuesOrder
  app.route('/vanue_order').get(vanuesOrder.vanuesOrder_list);
  app.route('/vanueOrders').get(vanuesOrder.vanueOrders);
  // Venue Sales Data 
  app.route('/venue_sale_data').get(vanue.venue_sale_data);
  app.route('/get_sale_data_by_date').get(vanue.get_sale_data_by_date);
  app.route('/view_order_detail').get(vanue.view_order_detail);
  // Venue integrations
  app.route('/venue_integrations').get(vanue.venue_integrations);
  // Swift
  app.route('/venue_integrations_swift').get(vanue.venue_integrations_swift);
  app.route('/venue_integrations_swift_connect').post(vanue.venue_integrations_swift_connect);
  app.route('/venue_integrations_swift_disconnect').post(vanue.venue_integrations_swift_disconnect);
  app.route('/venue_integrations_swift_import').post(vanue.venue_integrations_swift_import);
  app.route('/venue_integrations_swift_delete').post(vanue.venue_integrations_swift_delete);
  // Countr
  // app.route('/venue_integrations_countr').get(vanue.venue_integrations_swift);
  // app.route('/venue_integrations_countr_connect').post(vanue.venue_integrations_swift_connect);
  // app.route('/venue_integrations_countr_disconnect').post(vanue.venue_integrations_swift_disconnect);
  // app.route('/venue_integrations_countr_import').post(vanue.venue_integrations_swift_import);
  // app.route('/venue_integrations_countr_delete').post(vanue.venue_integrations_swift_delete);
  // Kounta
  app.route('/venue_integrations_kounta').get(vanue.venue_integrations_kounta);
  app.route('/venue_integrations_kounta_connect').post(vanue.venue_integrations_kounta_connect);
  app.route('/venue_integrations_kounta_disconnect').post(vanue.venue_integrations_kounta_disconnect);
  app.route('/venue_integrations_kounta_import').post(vanue.venue_integrations_kounta_import);
  app.route('/venue_integrations_kounta_delete').post(vanue.venue_integrations_kounta_delete);
  app.route('/venue_integrations_kounta_callback').get(vanue.venue_integrations_kounta_callback);


  //~~~~Payment Routes~~~~~~//
  app.route('/user_payments').get(userPayments.userPayments_list);
  app.route('/view_UserPayment').get(userPayments.view_UserPayment);
  app.route('/vanuePayments_list').get(userPayments.vanuePayments_list);


  //~~~~Terminal Routes~~~~~~//
  app.route('/terminal').get(terminals.terminals_list);
  app.route('/edit_terminal').get(terminals.edit_terminal);
  app.route('/update_terminal').post(terminals.update_terminals);
  app.route('/add_terminal').get(terminals.add_terminal);
  app.route('/view_terminal').get(terminals.view_terminal);
  app.route('/save_terminal').post(terminals.save_terminals);

  //~~~~Advertisement Routes~~~~~~//
  app.route('/advertisement').get(Ad.ad_list);
  app.route('/add_ads').get(Ad.get_ad_page);
  app.route('/get_terminals').post(Ad.get_terminals);
  app.route('/save_ad').post(Ad.save_ad);
  app.route('/edit_ad').get(Ad.edit_add);
  app.route('/update_ad').post(Ad.update_ad);


  /////////////  report conbtroller ====================

  app.route('/reports').get(report.reports);
  app.route('/view_report').get(report.view_report);

  //////////////// review controller //////////////

  app.route('/Reviews').get(review.Reviews);
  app.route('/view_review').get(review.view_review);

  //////////////// pages controller //////////////

  app.route('/pages').get(page.index);
  app.route('/page').get(page.edit);
  app.route('/update').post(page.update);

  /**********************  Api's Routes ***************************/

  app.route('/api/signup').post(UserApi.signup);
  app.route('/api/login').post(UserApi.login);
  app.route('/api/get_profile').get(UserApi.get_profile);
  app.route('/api/forgot_password').post(UserApi.forgot_password);
  app.route('/reset_password/:id').get(UserApi.api_url);
  app.route('/change_password').post(UserApi.change_passwordd);
  app.route('/api/add_bank_account').post(passport.authenticate('jwt', { session: false }), UserApi.add_bank_account);
  app.route('/api/add_paypal_Account').post(passport.authenticate('jwt', { session: false }), UserApi.add_paypal_Account);
  app.route('/api/add_card').post(passport.authenticate('jwt', { session: false }), UserApi.add_card);
  app.route('/api/edit_card').post(passport.authenticate('jwt', { session: false }), UserApi.edit_card);
  app.route('/api/edit_profile').post(passport.authenticate('jwt', { session: false }), UserApi.edit_profile);
  //15-02-2019
  app.route('/api/change_password').post(passport.authenticate('jwt', { session: false }), UserApi.change_password);
  app.route('/api/add_terminal').post(passport.authenticate('jwt', { session: false }), UserApi.add_terminal);
  app.route('/api/edit_terminal').post(passport.authenticate('jwt', { session: false }), UserApi.edit_terminal);
  app.route('/api/delete_terminal').post(passport.authenticate('jwt', { session: false }), UserApi.delete_terminal);
  app.route('/api/list_terminal').post(passport.authenticate('jwt', { session: false }), UserApi.list_terminal);
  //18-02-2019 
  app.route('/api/main_category').get(passport.authenticate('jwt', { session: false }), UserApi.main_category);
  app.route('/api/add_category').post(passport.authenticate('jwt', { session: false }), UserApi.add_category);
  app.route('/api/edit_category').put(passport.authenticate('jwt', { session: false }), UserApi.edit_category);
  app.route('/api/delete_category').delete(passport.authenticate('jwt', { session: false }), UserApi.delete_category);

  app.route('/api/list_categories').get(passport.authenticate('jwt', { session: false }), UserApi.list_categories);


  app.route('/api/add_sub_category').post(passport.authenticate('jwt', { session: false }), UserApi.add_sub_category);
  app.route('/api/edit_sub_category').put(passport.authenticate('jwt', { session: false }), UserApi.edit_sub_category);
  app.route('/api/delete_sub_category').delete(passport.authenticate('jwt', { session: false }), UserApi.delete_sub_category);
  app.route('/api/list_sub_category').get(passport.authenticate('jwt', { session: false }), UserApi.list_sub_category);

  app.route('/api/add_product').post(passport.authenticate('jwt', { session: false }), UserApi.add_product);
  app.route('/api/edit_product').put(passport.authenticate('jwt', { session: false }), UserApi.edit_product);
  app.route('/api/delete_product').delete(passport.authenticate('jwt', { session: false }), UserApi.delete_product);
  app.route('/api/list_product').get(passport.authenticate('jwt', { session: false }), UserApi.list_product);
  app.route('/api/brand_list').get(passport.authenticate('jwt', { session: false }), UserApi.brand_list);


  app.route('/api/list_cat_subCat').get(passport.authenticate('jwt', { session: false }), UserApi.list_cat_subCat);

  app.route('/api/venue_list').get(passport.authenticate('jwt', { session: false }), UserApi.venue_list);

  app.route('/api/add_order').post(passport.authenticate('jwt', { session: false }), UserApi.add_order);
  app.route('/api/add_order').post(passport.authenticate('jwt', { session: false }), UserApi.add_order);
  app.route('/client_token').get(UserApi.client_token);
  app.route('/checkout').post(UserApi.checkout);
  app.route('/api/get_test_webhook').get(UserApi.get_test_webhook);

  app.route('/api/current_order_listing').get(passport.authenticate('jwt', { session: false }), UserApi.current_order_listing);

  app.route('/api/categories').post(passport.authenticate('jwt', { session: false }), UserApi.categories);
  app.route('/api/order_detail').get(passport.authenticate('jwt', { session: false }), UserApi.order_detail);
  app.route('/api/past_order_listing').get(passport.authenticate('jwt', { session: false }), UserApi.past_order_listing);
  app.route('/api/user_order_listing').get(passport.authenticate('jwt', { session: false }), UserApi.user_order_listing);
  app.route('/api/order_round_by_date').get(passport.authenticate('jwt', { session: false }), UserApi.order_round_by_date);
  app.route('/api/today_customer_listing').get(passport.authenticate('jwt', { session: false }), UserApi.today_customer_listing);
  app.route('/api/order_status').put(passport.authenticate('jwt', { session: false }), UserApi.order_status);
  app.route('/api/collect_order_user').put(passport.authenticate('jwt', { session: false }), UserApi.collect_order_user);

  app.route('/api/venu_order_listing_by_date').get(passport.authenticate('jwt', { session: false }), UserApi.venu_order_listing_by_date);
  app.route('/api/customer_listing_by_name').get(passport.authenticate('jwt', { session: false }), UserApi.customer_listing_by_name);
  app.route('/api/customer_listing_for_particular_date').get(passport.authenticate('jwt', { session: false }), UserApi.customer_listing_for_particular_date);
  app.route('/api/customer_orders').get(passport.authenticate('jwt', { session: false }), UserApi.customer_orders);
  app.route('/api/customer_order_detail').get(passport.authenticate('jwt', { session: false }), UserApi.customer_order_detail);
  app.route('/api/last_order_detail').get(passport.authenticate('jwt', { session: false }), UserApi.last_order_detail);
  app.route('/api/today_trade').get(passport.authenticate('jwt', { session: false }), UserApi.today_trade);
  app.route('/api/suspend_account').post(passport.authenticate('jwt', { session: false }), UserApi.suspend_account);
  app.route('/api/history').get(passport.authenticate('jwt', { session: false }), UserApi.history);
  app.route('/api/delete_sub_category').post(passport.authenticate('jwt', { session: false }), UserApi.delete_sub_category);
  //app.route('/api/paypal_method').post(passport.authenticate('jwt', { session: false }),UserApi.paypal_method);
  // app.route('/api/payout_method').post(UserApi.payout_method);
  app.route('/email_verification/:id').get(UserApi.api_url_verification);

  /// new apis in may month
  app.route('/api/admin_list_product').get(passport.authenticate('jwt', { session: false }), UserApi.admin_list_product);
  app.route('/api/add_new_product').post(passport.authenticate('jwt', { session: false }), UserApi.add_new_product);
  app.route('/api/search_venue').post(passport.authenticate('jwt', { session: false }), UserApi.search_venue);
  app.route('/api/store_venue_search_history').get(passport.authenticate('jwt', { session: false }), UserApi.store_venue_search_history);
  app.route('/api/order_date_listing').get(passport.authenticate('jwt', { session: false }), UserApi.order_date_listing);
  app.route('/api/order_round_listing').get(passport.authenticate('jwt', { session: false }), UserApi.order_round_listing);
  app.route('/api/main_category_in_terminal').post(passport.authenticate('jwt', { session: false }), UserApi.main_category_in_terminal);
  app.route('/api/get_terminal_main_category').get(passport.authenticate('jwt', { session: false }), UserApi.get_terminal_main_category);
  app.route('/api/terminal_categories').get(passport.authenticate('jwt', { session: false }), UserApi.terminal_categories);
  app.route('/api/favourite_venue').post(passport.authenticate('jwt', { session: false }), UserApi.favourite_venue);
  app.route('/api/favourite_venue_list').get(passport.authenticate('jwt', { session: false }), UserApi.favourite_venue_list);
  app.route('/api/venue_category_listing').get(passport.authenticate('jwt', { session: false }), UserApi.venue_category_listing);
  app.route('/api/delete_venue_products').post(passport.authenticate('jwt', { session: false }), UserApi.delete_venue_products);
  app.route('/api/terms_and_conditions').get(UserApi.terms_and_conditions);
  app.route('/api/privacy_policy').get(UserApi.privacy_policy);
  app.route('/api/venue_open_close').post(passport.authenticate('jwt', { session: false }), UserApi.venue_open_close);
  app.route('/api/report').post(passport.authenticate('jwt', { session: false }), UserApi.report);
  app.route('/api/review').post(passport.authenticate('jwt', { session: false }), UserApi.review);
  app.route('/api/search_products').get(passport.authenticate('jwt', { session: false }), UserApi.search_products);
  //app.route('/api/search_products').get(passport.authenticate('jwt', { session: false }), UserApi.search_products);
  // june month work
  app.route('/api/terminal_current_order_listing').get(passport.authenticate('jwt', { session: false }), UserApi.terminal_current_order_listing);
  app.route('/api/terminal_past_order_listing').get(passport.authenticate('jwt', { session: false }), UserApi.terminal_past_order_listing);
  app.route('/api/terminal_today_trade').get(passport.authenticate('jwt', { session: false }), UserApi.terminal_today_trade);
  app.route('/api/terminal_history').get(passport.authenticate('jwt', { session: false }), UserApi.terminal_history);
  app.route('/api/terminal_today_customer_listing').get(passport.authenticate('jwt', { session: false }), UserApi.terminal_today_customer_listing);
  app.route('/api/terminal_customer_listing_by_name').get(passport.authenticate('jwt', { session: false }), UserApi.terminal_customer_listing_by_name);
  app.route('/api/terminal_customer_listing_for_particular_date').get(passport.authenticate('jwt', { session: false }), UserApi.terminal_customer_listing_for_particular_date);
  app.route('/api/terminal_order_listing_by_date').get(passport.authenticate('jwt', { session: false }), UserApi.terminal_order_listing_by_date);
  app.route('/api/terminal_customer_orders').get(passport.authenticate('jwt', { session: false }), UserApi.terminal_customer_orders);
  app.route('/api/terminal_order_detail').get(passport.authenticate('jwt', { session: false }), UserApi.terminal_order_detail);
  app.route('/api/terminal_wise_customer_order_detail').get(passport.authenticate('jwt', { session: false }), UserApi.terminal_wise_customer_order_detail);
  app.route('/api/save_venue_categories').post(passport.authenticate('jwt', { session: false }), UserApi.save_venue_categories);
  app.route('/api/new_categories').get(passport.authenticate('jwt', { session: false }), UserApi.new_categories);
  app.route('/api/conclude_today_trade').post(passport.authenticate('jwt', { session: false }), UserApi.conclude_today_trade);
  app.route('/api/logout').post(passport.authenticate('jwt', { session: false }), UserApi.logout);
  app.route('/api/check_venue_status').get(passport.authenticate('jwt', { session: false }), UserApi.check_venue_status);
  app.route('/api/terminal_listing').get(passport.authenticate('jwt', { session: false }), UserApi.terminal_listing);

  // 
  app.route('/api/venue_order_count').get(passport.authenticate('jwt', { session: false }), UserApi.venue_order_count);
  app.route('/api/customer_order_ready_count').get(passport.authenticate('jwt', { session: false }), UserApi.customer_order_ready_count);
  app.route('/api/venue_order_count_acc_to_categories').get(passport.authenticate('jwt', { session: false }), UserApi.venue_order_count_acc_to_categories);
  app.route('/api/get_order_count_acc_to_cat').get(passport.authenticate('jwt', { session: false }), UserApi.get_order_count_acc_to_cat);
  app.route('/api/terminal_open_close').post(passport.authenticate('jwt', { session: false }), UserApi.terminal_open_close);


  app.route('/api/send_receipt_for_venue_order_history').get(passport.authenticate('jwt', { session: false }), UserApi.send_receipt_for_venue_order_history);
  app.route('/api/cancel_order').post(passport.authenticate('jwt', { session: false }), UserApi.cancel_order);
  app.route('/api/user_refund').post(passport.authenticate('jwt', { session: false }), UserApi.user_refund);
  app.route('/api/rate_venue').post(passport.authenticate('jwt', { session: false }), UserApi.rate_venue);
  app.route('/api/ad_listing').get(passport.authenticate('jwt', { session: false }), UserApi.ad_listing);
  app.route('/api/receipt_of_customer_order_detail').get(passport.authenticate('jwt', { session: false }), UserApi.receipt_of_customer_order_detail);
  app.route('/api/send_receipt_for_customer_order_detail').get(passport.authenticate('jwt', { session: false }), UserApi.send_receipt_for_customer_order_detail);
  app.route('/api/send_venue_receipt_for_order_history').post(passport.authenticate('jwt', { session: false }), UserApi.send_venue_receipt_for_order_history);
  app.route('/api/send_customer_order_detail_receipt').post(passport.authenticate('jwt', { session: false }), UserApi.send_customer_order_detail_receipt);
  app.route('/api/refunded_order_list').get(passport.authenticate('jwt', { session: false }), UserApi.refunded_order_list);
  //  app.route('/api/test_receipt').get(UserApi.test_receipt);









}
