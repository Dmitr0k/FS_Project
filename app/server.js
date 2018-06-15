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
var url = "mongodb://admin:123qweasdzxc@ds153380.mlab.com:53380/fs";
const secret = 'kursachIVT261';
const session = [];

app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
//app.use(parser);
app.use(urlencodedParser);
app.use(bodyParser.raw());
app.use(bodyParser.text());

// mongoClient.connect(url, (err, databases) => {
//     var db = databases.db('fs');
//     db.collection('users').find({}, { projection: { token: 1, _id: false } }).toArray((err, arrDocs) => {
//         if (err) {
//             console.log('Ошибка загрузки токенов');
//             return;
//         }

//         arrDocs.forEach((currDoc) => {
//             session.push(currDoc.token);
//         });
//     });
// });


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
        const db = databases.db('fs');


        db.collection('users').find({ 'info.password': bodyToken.password }).toArray((error, users) => {
            if (error) return res.status(400).send();
            if (users.length != 0) {
                for (var i = 0; i < users.length; i++) {
                    if (CryptoJS.AES.decrypt(users[i].info.login, secret).toString(CryptoJS.enc.Utf8) ===
                        CryptoJS.AES.decrypt(req.body.login, secret).toString(CryptoJS.enc.Utf8) &&
                        CryptoJS.AES.decrypt(users[i].info.email, secret).toString(CryptoJS.enc.Utf8) ===
                        CryptoJS.AES.decrypt(req.body.email, secret).toString(CryptoJS.enc.Utf8)) {
                        console.log('Пользователь с такими данными уже существует');
                        return res.send({ status: 'alreadyIs', token: false });
                        return;
                    }
                }
            }


            db.collection("users").insertOne({ token: newToken, info: bodyToken, cart: [] }, (err, newUser) => {
                if (err) {
                    console.log('Ошибка при добавлении пользователя в базу данных');
                    return res.status(400).send();
                }

                databases.close();
                console.log('Added new User');
                res.send({ status: 'ok', 'token': newToken });
            });

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
        const db = databases.db('fs');
        var passw = CryptoJS.SHA224(req.body.password).toString();
        db.collection('users').find({ 'info.password': CryptoJS.SHA224(req.body.password).toString() },
            { info: true, token: true }).toArray((error, users) => {
                if (error) return res.status(400).send();
                if (users.length == 0) {
                    databases.close();
                    return res.send({ status: 'noMatch', token: false });
                }

                for (var i = 0; i < users.length; i++) {
                    if (CryptoJS.AES.decrypt(users[i].info[typeLogin], secret).toString(CryptoJS.enc.Utf8) === login) {
                        var token = users[i].token;
                        databases.close();
                        console.log('успешный вход');
                        return res.send({ status: 'ok', token: token });
                        return;
                    }
                }

                databases.close();
                return res.send({ status: 'noMatch', token: false });
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
    if (!req.body || !req.cookies.ShopSocksToken) return res.sendStatus(400);
    if (!req.cookies.ShopSocksToken) {
        console.log('Invalid token');
        return res.sendStatus(404);
    }
    var buy = {};
    buy.arrSocks = JSON.parse(req.body.arrSocks);
    buy.dateBuy = req.body.dateBuy;
    buy.firstname = req.body.firstname;
    buy.lastname = req.body.lastname;
    buy.email = req.body.email;
    buy.country = req.body.country;
    buy.city = req.body.city;
    buy.adress = req.body.adress;
    buy.cost = req.body.cost;
    buy.zip = req.body.zip;

    mongoClient.connect(url, (err, databases) => {
        if (err) {
            console.log('Ошибка при подключении к базе данных по адресу: ' + url);
            return res.status(400).send();
        }
        const db = databases.db('fs');
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

                    db.collection('users').findOneAndUpdate({ token: req.cookies.ShopSocksToken },
                        { $push: { cart: { ref: newBuy.ops[0]._id.toString() } } }, { returnOriginal: false },
                        //  {projection: {cart: 1, _id: false}}, 
                        (err, user) => {
                            if (err) return res.status(400).send();
                            console.log('added new buy');
                            res.end();
                            databases.close();
                            return;
                        });
                });
            });
    });
});


app.get('/myProfile', (req, res) => {
    if (!req.cookies.ShopSocksToken) {
        console.log('Invalid token');
        return res.sendStatus(404);
    }

    mongoClient.connect(url, (err, databases) => {
        if (err) {
            console.log('Ошибка при подключении к базе данных по адресу: ' + url);
            return res.status(400).send();
        }
        const db = databases.db('fs');
        var arrBuysForUsers = [];
        db.collection('users').find({ token: req.cookies.ShopSocksToken },
            { projection: { cart: true, _id: false } }).toArray((err, users) => {
                if (err || users.length < 1) {
                    res.status(400).send();
                    return;
                }
                var cart = users[0].cart;
                for (let indexBuy = 0; indexBuy < cart.length; indexBuy++) {
                    db.collection('buys').find({ _id: new objectId(cart[indexBuy].ref) },
                        { projection: { _id: false } }).toArray((err, currenBuy) => {
                            if (err || currenBuy.length < 1) {
                                res.status(400).send();
                                return;
                            }
                            delete currenBuy[0].login;
                            arrBuysForUsers.push(currenBuy[0]);
                            if (indexBuy + 1 == cart.length)
                                res.send(JSON.stringify(arrBuysForUsers));
                        });

                }


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


app.use(function(req, res, next) {
    //res.status(404).send('Sorry cant find that!');
    res.sendFile(__dirname + "/public/404.html")
});


const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('server started on http://localhost:3000');
});



// function getCountSocksInCart(currentToken, res) {
//     mongoClient.connect(url, (err, databases) => {
//         if (err) {
//             console.log('Ошибка при подключении к базе данных по адресу: ' + url);
//             return res.status(400).send();
//         }
//         const db = databases.db('fs');
//         //var passw = CryptoJS.SHA224(req.body.password).toString();
//         db.collection('users').find({ token: currentToken },
//             { projection: { cart: true, _id: false } }).toArray((error, users) => {
//                 if (error) return res.status(400).send();
//                 if (users.length == 0) {
//                     databases.close();
//                     res.send({ 'status': false, token: false });
//                     return;
//                 }

//                 for (var i = 0; i < users.length; i++) {
//                     res.render(__dirname + '/public/views/' + 'index.hbs', {
//                         countSocks: users[i].cart.length + ''
//                     });
//                 }

//                 // databases.close();
//                 //res.send({ 'status': false });
//             });
//     });
// }