var sha256 = require('crypto-js/sha256');
const axios = require('axios');
let api = "61b74128e12187a78d9df05c14f42726d35b217e31d19120a23fa5451d6e092e";

let data = { "abc": "abc", "request_id": "123123123" };

let hash = "abc" + "123123123" + api;
const hased = sha256(hash).toString();

let headers = {
    headers: {
        'content-type': 'application/json',
        'login-token': api,
        'x-auth-sign': hased
    }
}



axios.post('https://api.dex-trade.com/v1/private/orders', data, headers)
    .then(function(response) {
        console.log(response);
    })
    .catch(function(error) {
        console.log(error);
    });