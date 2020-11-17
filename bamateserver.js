var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var models = require('./models');
var fileUpload = require('express-fileupload');
var flash = require('connect-flash');
var app = express();
var crypto = require('crypto');
const passport = require('passport');
const bearerToken = require('express-bearer-token');
const braintree = require('braintree');

// var session = require('express-session');

//session
var session = require('express-session');
app.use(session({ secret: 'hellonodejs' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(flash());
app.use(passport.initialize());
app.use(bearerToken());

require('./passport')(passport);

const middleWare = (req, res, next) => {
    console.log('my middleware 123');
    passport.authenticate('jwt', { session: false });
    next();
}



// var gateway = braintree.connect({
//     environment:  braintree.Environment.Sandbox,
//     merchantId:   'nmfdvfkm7s8f53wx',
//     publicKey:    '5h9xbgrc29nfcv6j',
//     privateKey:   '80751107efc30d8096d4b569f14f5a53'
// });

// gateway.clientToken.generate({
//     // customerId: aCustomerId
//   }, function (err, response) {
//     var clientToken = response.clientToken
// });
// app.get("/client_token", function (req, res) {
//     gateway.clientToken.generate({}, function (err, response) {
//       res.send(response.clientToken);
//     });
// });
// app.post("/checkout", function (req, res) {
//     var nonceFromTheClient = req.body.payment_method_nonce;
//     var deviceDataFromTheClient = req.body.deviceDataFromTheClient;
//     gateway.transaction.sale({
//         amount: "1.00",
//         paymentMethodNonce: nonceFromTheClient,
//         deviceData: deviceDataFromTheClient,
//         options: {
//           submitForSettlement: true
//         }
//       }, function (err, result) {
//           if(err){
//             console.log('=========================================================>>errr',err)
//             res.send(err);
//           }
//           else{
//             console.log('==================================================================resultss',result)
//             res.send(result);
//           }
//     });
//     // Use payment method nonce here
// });

// var gateway = braintree.connect({
//     accessToken: "access_token$sandbox$7svbfw2fqbmpgg4r$1b6e0861b26aa3dc3574ca6e63bc1166"
// });
// app.get("/client_token", function (req, res) {
//     gateway.clientToken.generate({}, function (err, response) {
//       res.send(response.clientToken);
//     });
// });

// app.post("/checkout", function (req, res) {
//     var nonce = req.body.payment_method_nonce;
//     // Use payment method nonce here
// });

// app.use(middleWare);


require('./routes/route')(app);


// const api_routes = require('./routes/api_routes');

// app.use('/api', api_routes);
//view
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
module.exports = app;

app.listen(3009, () => console.log('Barmate app listening on port 3009!'));