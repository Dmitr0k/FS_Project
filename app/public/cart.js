var form = document.getElementById('buyAll');

form.onsubmit = () => {
    var firstname = document.getElementById('firstname');
    var lastname = document.getElementById('lastname');
    var email = document.getElementById('email-adress');
    var inputAdress = document.getElementById('inputAddress');
    var inputCity = document.getElementById('inputCity');
    var inputCountry = document.getElementById('inputCoutry');
    var zip = document.getElementById('inputZip');
    var totalCost = document.getElementById('totalCost');
    if (!getCookie('ShopSocksToken')) {
        alert('Чтобы купить товар, Зарегестрируйтесь');
        return;
    }
    var cartItems = document.getElementsByClassName('cart-item');
    alert(cartItems[2].children[3].innerHTML);
    var arraySocks = [];
    for (var i = 0; i < cartItems.length; i++) {
        arraySocks[i] = {
            size: cartItems[i].children[3].textContent.replace(/(^\s*)|(\s*)$/g, ''),
            cost: cartItems[i].children[4].textContent.replace(/(^\s*)|(\s*)$/g, ''),
            feature: cartItems[i].children[2].textContent.replace(/(^\s*)|(\s*)$/g, '')
        };
    }
    var reqBody = 'arrSocks=' + encodeURIComponent(JSON.stringify(arraySocks)) +
        '&dateBuy=' + encodeURIComponent(new Date().toUTCString()) +
        '&firstname=' + encodeURIComponent(firstname.value) +
        '&lastname=' + encodeURIComponent(lastname.value) +
        '&email=' + encodeURIComponent(email.value) +
        '&country=' + encodeURIComponent(inputCountry.value) +
        '&city=' + encodeURIComponent(inputCity.value) +
        '&adress=' + encodeURIComponent(inputAdress.value) +
        '&cost=' + encodeURIComponent(totalCost.textContent.substring(11, totalCost.textContent.length));
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/buyAll');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(reqBody);
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4)
            return;
        //var bodyRes = JSON.parse(xhr.responseText);
        if (xhr.status != 200) {
            alert('Произошла ошикба');
            return;
        }
       alert('Добавлено');
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