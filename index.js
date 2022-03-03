var sha256 = require('crypto-js/sha256');
const axios = require('axios');
require('dotenv').config();


let apiS = process.env.apiS;
let apiP = process.env.apiP;


const Web3 = require('web3');
var serverbnb = "https://bsc-dataseed1.defibit.io/";
const web3 = new Web3(new Web3.providers.HttpProvider(serverbnb));


function del(id) {
    let u = "https://api.dex-trade.com/v1/private/delete-order";

    let tim = Date.now();
    let data = { "order_id": id, "request_id": tim };

    let hash = id + "" + tim + "" + apiS;

    // console.log(hash);
    const hased = sha256(hash).toString();

    let headers = {
        headers: {
            'content-type': 'application/json',
            'login-token': apiP,
            'secret': apiS,
            'x-auth-sign': hased
        }
    }


    axios.post(u, data, headers)
        .then(function(response) {



        })
        .catch(function(error) {
            console.log(error);
        });

}



let getrate = async function(c = '0x14e5c9b5cb59d2af6d121bbf5a322c6fe9f18657') {


    var abi = [{ "constant": true, "inputs": [], "name": "getReserves", "outputs": [{ "internalType": "uint112", "name": "_reserve0", "type": "uint112" }, { "internalType": "uint112", "name": "_reserve1", "type": "uint112" }, { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" }];

    try {

        var contract = new web3.eth.Contract(abi, c);

        let a = await contract.methods.getReserves().call().then(function(resp) {
            return resp[0] / resp[1];

        });
        return a;
    } catch (error) {
        console.log(error);

    }


}

let LAST_PRICE = 0;

let ask = 0;
let bid =0;

async function ord() {

    let ratt = await getrate();


    if (ratt > 0) {} else return;

    let rat = LAST_PRICE;
    if (rat == 0) rat = ratt;
    else

        rat = rat + (ratt - rat) * 0.1;
    LAST_PRICE = rat;

    console.log("Pancake price ", rat);

    let tim = Date.now();
    let data = { "request_id": tim };

    let hash = tim + "" + apiS;

    // console.log(hash);
    const hased = sha256(hash).toString();

    let headers = {
        headers: {
            'content-type': 'application/json',
            'login-token': apiP,
            'secret': apiS,
            'x-auth-sign': hased
        }
    }
    let PAIR = "NBGUSDT";
    let countb = 0;
    let counts = 0;
    let firstb = 0;
    let firsts = 0;
      ask = 0;
      bid =0;

    axios.post('https://api.dex-trade.com/v1/private/orders', data, headers)
        .then(function(response) {

            let orders = response.data.data.list;
            orders.forEach(e => {
                if (e.pair != PAIR) return;

                let f = {
                    id: e.id,
                    pair: e.pair,
                    price: e.rate,
                    trade: e.type
                }

                if (f.trade == 0) {
                    countb++;
                    if (firstb == 0) { firstb = f.id; ask=f.price*1;}
                    firstb = Math.min(firstb, f.id);
                    ask = Math.max(ask,f.price*1);
                }
                if (f.trade == 1) {
                    counts++;
                    if (firsts == 0) { firsts = f.id; bid =f.price*1;}
                    firsts = Math.min(firsts, f.id);
                    bid = Math.max(bid,f.price*1);
                }

                // console.log(f);
                //  console.log(e);

            });
            // console.log(order);

            console.log(countb, firstb);
            console.log(counts, firsts);



            if (counts < 25) order(PAIR, rat, 70 * Math.random(), 1);
            else
                del(firsts);

            if (countb < 25) order(PAIR, rat, 70 * Math.random(), 0);
            else
                del(firstb);


        })
        .catch(function(error) {
            console.log(error);
        });

}




let order = function(symbol, price, am, orderp) {

    if (orderp == 0) {
        price = price * 0.01 * (101 - Math.random() * 5);
        price = price.toFixed(5) * 1;
        if(bid<price)
        if(Math.random()<0.5) price = Math.max(price,bid);
    }

    if (orderp == 1) {
        price = price * 0.01 * (99 + Math.random() * 5);
        price = price.toFixed(5) * 1;

      
    }

    am = am / price;
    am = am.toFixed(3) * 1;

    let PAIR = symbol;
    let PRICE = price;
    let tim = Date.now();
    let TYPE = orderp;
    let VOLUME = am;


    let data = {
        "pair": PAIR,
        "rate": PRICE,
        "request_id": tim,
        "type": TYPE,
        "type_trade": 0,
        "volume": am
    };

    console.log(data);


    let hash = PAIR + "" + PRICE + "" + tim + TYPE + "0" + VOLUME + apiS;
    const hased = sha256(hash).toString();

    let headers = {
        headers: {
            'content-type': 'application/json',
            'login-token': apiP,
            'secret': apiS,
            'x-auth-sign': hased
        }
    }

    axios.post('https://api.dex-trade.com/v1/private/create-order', data, headers)
        .then(function(response) {


            console.log(response.data);


        })
        .catch(function(error) {
            console.log(error);
        });

}



// function op() {
//     let symbol = "NBGUSDT";

//     order(symbol, 1.4, 20 * Math.random(), 1);
//     order(symbol, 1.5, 20 * Math.random(), 0);
// }


setInterval(ord, 10000);

ord();