//Кнопки входа и регистрации
var enterButton = document.getElementById('loginButton');
var signUp = document.getElementById('signupButton');

//поля входа в систему    
var nameEnter = document.getElementById('username');
var passwordEnter = document.getElementById('password');

//поля регистрации
var nameSignUp = document.getElementById('usernamesignup');
var emailSignUp = document.getElementById('emailsignup');
var passwordSignUp = document.getElementById('passwordsignup');
var rePasswordSignUp = document.getElementById('passwordsignup_confirm');

  
//регистрация
signUp.onclick = () => {
    if (passwordSignUp.value !== rePasswordSignUp.value) {
        alert('Введите одинаковый пароль');
        return;
    }
    if (passwordSignUp.value.length < 5) {
        alert('Длина пароля должна быть не менее 5 символов');
        return;   
    }
    var xhr = new XMLHttpRequest();
    var bodyRequest = 'login=' + encodeURIComponent(nameSignUp.value) +
        '&email=' + encodeURIComponent(emailSignUp.value) +
        '&password=' + encodeURIComponent(passwordSignUp.value);
    xhr.open("POST", '/signUp');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(bodyRequest);
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4)
            return;
        var bodyRes = JSON.parse(xhr.responseText);
        if (!bodyRes.status) {
            alert('Произошла ошикба');    
            return;
        }
        if (bodyRes.token) {
            document.cookie = 'ShopSocksToken=' + bodyRes.token + "; path/=;"
            alert('Регистрация прошла успешно');
            location.pathname = '/';
            localStorage.setItem('login', nameSignUp.value);
            localStorage.setItem('isUser', 'true');
            console.log(document.cookie);
        }
    }
}


//вход в систему
enterButton.onclick = () => {
    //проверка входных данных...

    var xhr = new XMLHttpRequest();
    var bodyRequest = 'login=' + encodeURIComponent(nameEnter.value) +
        '&password=' + encodeURIComponent(passwordEnter.value);
    xhr.open("POST", '/entry');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    xhr.send(bodyRequest);
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4)
            return;
        var bodyRes = JSON.parse(xhr.responseText);
        var resss = xhr.response;
        if (!bodyRes.status) {
            alert('Произошла ошикба');
            return;
        }
        if (bodyRes.token) {
            document.cookie = 'ShopSocksToken=' + bodyRes.token + "; path/=;"
            alert('Вы успешно вошли на сайт');
            localStorage.setItem('login', nameEnter.value);
            localStorage.setItem('isUser', 'true');
            location.pathname = '/';
            console.log(document.cookie);
        }
    }
}






