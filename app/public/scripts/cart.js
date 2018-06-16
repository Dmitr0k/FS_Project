var form = document.getElementById('buyAll');
var firstname = document.getElementById('firstname');
var lastname = document.getElementById('lastname');
var email = document.getElementById('email-adress');
var inputAdress = document.getElementById('inputAddress');
var inputCity = document.getElementById('inputCity');
var inputCountry = document.getElementById('inputCoutry');
var zip = document.getElementById('inputZip');
var totalCost = document.getElementById('totalCost');

form.onsubmit = () => {

    //console.log(localStorage.getItem('isUser'));
    if (localStorage.getItem('isUser') == 'false' || getCookie('ShopSocksToken') == "") {
        alert('Чтобы купить товар, Зарегестрируйтесь или войдите в свою учетную запись');
        return false;
    }
    //var localSt = JSON.parse(localStorage.fs_cart);
    //var cartItems = document.getElementsByClassName('cart-item');
    var arraySocks = [];
    // for (var i = 0; i < localSt.length; i++) {
    //     arraySocks[i] = {
    //         size: localSt[i].size,
    //         cost: localSt[i].cost,
    //         feature: localSt[i].gender+' '+ localSt[i].type
    //     };
    // }


    var reqBody = 'arrSocks=' + encodeURIComponent(localStorage.fs_cart) +
        '&dateBuy=' + encodeURIComponent(new Date().toUTCString()) +
        '&firstname=' + encodeURIComponent(firstname.value) +
        '&lastname=' + encodeURIComponent(lastname.value) +
        '&email=' + encodeURIComponent(email.value) +
        '&country=' + encodeURIComponent(inputCountry.value) +
        '&city=' + encodeURIComponent(inputCity.value) +
        '&adress=' + encodeURIComponent(inputAdress.value) +
        '&cost=' + encodeURIComponent(totalCost.textContent.substring(11, totalCost.textContent.length)) +
        '&zip=' + encodeURIComponent(zip.value);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/buyAll');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(reqBody);
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4)
            return;
        //var bodyRes = JSON.parse(xhr.responseText);
        if (xhr.status != 200) {
            alert('Произошла ошибка');
            return;
        }
        alert('Ваш заказ принят');
        localStorage.removeItem('fs-cart');
        location.reload(true);
    }
    return false;
}


// возвращает cookie с именем name, если есть, если нет, то undefined
function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}