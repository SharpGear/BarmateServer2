const boom = require('boom');

const get = (res, resData) => {
    return res.json({
        code: 200,
        message: '',
        body: resData
    });
}

const post = (res, resData) => {
    return res.json({
        code: 200,
        message: '',
        body: resData
    });
}

const del = (res, resData) => {
    return res.json({
        code: 200,
        message: '',
        body: resData
    });
}

const put = (res, resData) => {
    return res.json({
        code: 200,
        message: '',
        body: resData
    });
}
const Error = (res, resData, message) => {
    return res.json({
        code: 400,
        message: message,
        body: resData
    });
}

const getError = (message) => {
    return {
        code: 400,
        message: message,
        body: {}
    };
}

const unauthorized = (res, message) => {
    return res.status(401).json({
        code: 401,
        message: 'User is Unauthorized',
        body: {}
    });
}

const onError = (res, err, message) => {
    console.log(err);
    console.log(boom.badRequest(message));
    console.log(getError(message));
    //   res.writeHead(400, {'Content-Type': 'application/json'});

    return res.json(getError(message));
}

module.exports = {
    get,
    post,
    put,
    del,
    onError,
    unauthorized,
    Error
}