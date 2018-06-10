var mongoClient = require("mongodb").MongoClient;
var fs = require('fs');
var objectId = require("mongodb").ObjectID;
var express = require("express");
var bodyParser = require('body-parser');
const CryptoJS = require('crypto-js');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: true });
var hbs = require("hbs");

const app = express();
app.set("view engine", "hbs");
var url = "mongodb://localhost:27017";
const secret = 'kursachIVT261';
const session = [];

app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
//app.use(parser);
app.use(urlencodedParser);
app.use(bodyParser.raw());
app.use(bodyParser.text());

mongoClient.connect(url, (err, databases) => {
    var db = databases.db('socksShopDb');
    db.collection('users').find({}, { projection: { token: 1, _id: false } }).toArray((err, arrDocs) => {
        if (err) {
            console.log('Ошибка загрузки токенов');
            return;
        }

        arrDocs.forEach((currDoc) => {
            session.push(currDoc.token);
        });
    });
});


// hbs.registerHelper('getCartItem', (arrSock) => {
//     var textCartItem = fs.readFileSync(__dirname + '/public/views/cartItem.hbs').toString();
//     var regexItemGender = '/\\\\{\\\\{itemGender\\\\}\\\\}/';
//     var regexItemType = '/\\\\{\\\\{itemType\\\\}\\\\}/';
//     var regexItemCost = '/\\\\{\\\\{itemCost\\\\}\\\\}';
//     var regexItemSize = '/\\\\{\\\\{itemSize\\\\}\\\\}';
//     var newHTML = "";
//     for (var i = 0; i < arrSock.data.root.length; i++) {
//         newHTML += textCartItem.replace(regexItemGender, arrSock[i].data.root.genderBtns);
//         newHTML = newHTML.replace(regexItemType, arrSock.data.root[i].typeBtns);
//         newHTML = newHTML.replace(regexItemCost, arrSock.data.root[i].cost);
//         newHTML = newHTML.replace(regexItemSize, arrSock.data.root[i].sizeBtnz);
//     }
//     return new hbs.SafeString(newHTML);
// });



app.get('/', (req, res) => {
    res.sendFile(__dirname + 'public/index.html');
    // for (var indexSession = 0; indexSession < session.length; indexSession++) {
    //     if (session[indexSession] === req.cookies.ShopSocksToken) {
    //         getCountSocksInCart(session[indexSession], res);
    //         console.log('Главная страница');
    //         return;
    //     }
    // }

    // res.render(__dirname + '/public/views/' + 'index.hbs', {
    //     countSocks: '0'
    // });
});

app.post('/signUp', urlencodedParser, (req, res) => {
    if (!req.body) return res.sendStatus(400);
    const hashPassword = CryptoJS.SHA224(req.body.password).toString();
    delete req.body.password;

    const bodyToken = req.body;
    for (let field in req.body) {
        bodyToken[field] = CryptoJS.AES.encrypt(req.body[field], secret).toString();
    }

    var currentDate = new Date();
    bodyToken.password = hashPassword;
    bodyToken.date = currentDate.toUTCString();

    const newToken = jwt.sign(bodyToken, secret);
    session.push({ token: newToken });

    mongoClient.connect(url, (err, databases) => {
        if (err) {
            console.log('Ошибка при подключении к базе данных по адресу: ' + url);
            return res.status(400).send();
        }
        const db = databases.db('socksShopDb');
        db.collection("users").insertOne({ token: newToken, info: bodyToken, cart: [] }, (err, newUser) => {
            if (err) {
                console.log('Ошибка при добавлении пользователя в базу данных');
                return res.status(400).send();
            }

            databases.close();
            console.log('Added new User');
            res.send({ 'status': true, 'token': newToken });
        });
    });
});

app.post('/entry', urlencodedParser, (req, res) => {
    if (!req.body) return res.sendStatus(400);
    var typeLogin;
    var login;
    if (req.body.login != undefined) {
        typeLogin = 'login';
        login = req.body.login;
    }
    else {
        typeLogin = 'email';
        login = req.body.email;
    }
    mongoClient.connect(url, (err, databases) => {
        if (err) {
            console.log('Ошибка при подключении к базе данных по адресу: ' + url);
            return res.status(400).send();
        }
        const db = databases.db('socksShopDb');
        var passw = CryptoJS.SHA224(req.body.password).toString();
        db.collection('users').find({ 'info.password': CryptoJS.SHA224(req.body.password).toString() },
            { info: true, token: true }).toArray((error, users) => {
                if (error) return res.status(400).send();
                if (users.length == 0) {
                    databases.close();
                    res.send({ 'status': false, token: false });
                    return;
                }

                for (var i = 0; i < users.length; i++) {
                    if (CryptoJS.AES.decrypt(users[i].info[typeLogin], secret).toString(CryptoJS.enc.Utf8) === login) {
                        var token = users[i].token;
                        databases.close();
                        console.log('успешный вход');
                        res.send({ 'status': true, token: token });
                        return;
                    }
                }

                databases.close();
                res.send({ 'status': false });
            });
    });
});

// app.post('/addToCart', urlencodedParser, (req, res) => {
//     if (!req.body) return res.sendStatus(400);
//     var newSock = {};
//     newSock.sizeBtnz = req.body.sizeBtnz;
//     newSock.genderBtns = req.body.genderBtns;
//     newSock.typeBtns = req.body.typeBtns;
//     newSock.dateCreation = new Date().toUTCString();
//     newSock.cost = 5;
//     mongoClient.connect(url, (err, databases) => {
//         if (err) {
//             console.log('Ошибка при подключении к базе данных по адресу: ' + url);
//             return res.status(400).send();
//         }
//         const db = databases.db('socksShopDb');
//         db.collection('users').findOneAndUpdate({ token: req.cookies.ShopSocksToken },
//             { $push: { cart: newSock } }, { returnOriginal: false },
//             //  {projection: {cart: 1, _id: false}}, 
//             (err, user) => {
//                 if (err) return res.status(400).send();
//                 console.log('В корзину добавлен новый товар');
//                 res.end();
//                 databases.close();
//                 return;
//             });
//     });
// });

app.post('/buyAll', urlencodedParser, (req, res) => {
    if (!req.body) return res.sendStatus(400);
    var buy = {};
    buy.arrSockss = JSON.parse(req.body.arrSocks);
    buy.dateBuy = req.body.dateBuy;
    buy.firstname = req.body.firstname;
    buy.lastname = req.body.lastname;
    buy.email = req.body.email;
    buy.country = req.body.coutry;
    buy.city = req.body.city;
    buy.adress = req.body.adress;
    buy.cost = req.body.cost;

    mongoClient.connect(url, (err, databases) => {
        if (err) {
            console.log('Ошибка при подключении к базе данных по адресу: ' + url);
            return res.status(400).send();
        }
        const db = databases.db('socksShopDb');
        db.collection('users').find({ token: req.cookies.ShopSocksToken },
            { projection: { info: true, _id: false } }).toArray((err, users) => {
                if (err) {
                    res.status(400).send();
                    return;
                }
                if (users.length < 1) {
                    res.status(400).send();
                    return;
                }
                buy.login = users[0].info.login;
                db.collection('buys').insertOne(buy, (err, newBuy) => {
                    if (err) {
                        console.log('Ошибка при добавлении нового заказа в базу данных');
                        return res.status(400).send();
                    }
        
                    databases.close();
                    console.log('Added new buy');
                    res.send();
                });
            });
    });
});


app.get('/myCart', (req, res) => {
    res.sendFile(__dirname + "/public/cart.html");
    // mongoClient.connect(url, (err, databases) => {
    //     if (err) {
    //         console.log('Ошибка при подключении к базе данных по адресу: ' + url);
    //         return res.status(400).send();
    //     }
    //     const db = databases.db('socksShopDb');
    //     //var passw = CryptoJS.SHA224(req.body.password).toString();
    //     db.collection('users').find({ token: req.cookies.ShopSocksToken },
    //         { projection: { cart: true, _id: false } }).toArray((error, users) => {
    //             if (error) return res.status(400).send();
    //             //проверка есть ли товары в корзине

    //             res.render(__dirname + '/public/views/' + 'cart.hbs', users[0].cart);
    //         });
    // });

});

app.listen(3000, () => {
    console.log('server started on http://localhost:3000');
});



function getCountSocksInCart(currentToken, res) {
    mongoClient.connect(url, (err, databases) => {
        if (err) {
            console.log('Ошибка при подключении к базе данных по адресу: ' + url);
            return res.status(400).send();
        }
        const db = databases.db('socksShopDb');
        //var passw = CryptoJS.SHA224(req.body.password).toString();
        db.collection('users').find({ token: currentToken },
            { projection: { cart: true, _id: false } }).toArray((error, users) => {
                if (error) return res.status(400).send();
                if (users.length == 0) {
                    databases.close();
                    res.send({ 'status': false, token: false });
                    return;
                }

                for (var i = 0; i < users.length; i++) {
                    res.render(__dirname + '/public/views/' + 'index.hbs', {
                        countSocks: users[i].cart.length + ''
                    });
                }

                // databases.close();
                //res.send({ 'status': false });
            });
    });
}