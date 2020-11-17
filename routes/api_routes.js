admin = require('../controller/admin_controller');
users = require('../controller/user_controller');
UserApis = require('../controller/UserApiscontroller');

cate = require('../controller/category_controller');
pro = require('../controller/product_controller');
order = require('../controller/order_controller');
subcate = require('../controller/subcategory_controller');
helper = require('../controller/helper_controller')
vanue = require('../controller/vanues_controller')
vanuesOrder = require('../controller/vanuesOrder_controller')
userPayments = require('../controller/userPayments_controller')
terminals = require('../controller/terminals_controller')
module.exports = function (app) {
 
    //~~~~user~~~~~//
    app.route('/signup').get(UserApis.signup);
    // app.route('/user').post(users.add_users);
    // app.route('/users_list').get(users.user_list);
    // app.route('/edit_user').get(users.edit_user);
    // app.route('/update_user').post(users.update_user);
    // app.route('/delete').post(users.deleterow);
    // app.route('/update_status').post(users.update_status);
    
}