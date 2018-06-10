
//добавление товаров
var nodeSizeBtnz = document.getElementsByClassName('size-btns')[0];
var nodeGenderBtns = document.getElementsByClassName('gender-btns')[0];
var nodeTypeBtns = document.getElementsByClassName('type-btns')[0];
var choiseFields = document.getElementsByClassName('li-opt');

var buttonAddToCart = document.getElementsByClassName('pink-btn')[0];

var sizeBtnz;
var genderBtns;
var typeBtns;

for (var i = 0; i < choiseFields.length; i++) {
    choiseFields[i].onclick = () => {
        //alert(event.target.textContent);
        if (nodeSizeBtnz.contains(event.target))
            sizeBtnz = event.target.textContent;
        else if (nodeGenderBtns.contains(event.target))
            genderBtns = event.target.textContent;
        else
            typeBtns = event.target.textContent;
    }
}


buttonAddToCart.onclick = () => {
    if (!getCookie('ShopSocksToken')) {
        alert('Чтобы купить товар, Зарегестрируйтесь');
        return;
    }
    if (!sizeBtnz || !genderBtns || !typeBtns) {
        alert('Выберите тип носков');
        return;
    }

    var xhr = new XMLHttpRequest();
    var bodyRequest = 'sizeBtnz=' + encodeURIComponent(sizeBtnz) +
        '&genderBtns=' + encodeURIComponent(genderBtns) +
        '&typeBtns=' + encodeURIComponent(typeBtns);
    xhr.open("POST", '/addToCart');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(bodyRequest);
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4)
            return;
        //var bodyRes = JSON.parse(xhr.responseText);
        if (xhr.status != 200) {
            alert('Произошла ошикба');
            return; 
        }
        var cartText = document.getElementById('cart').innerText;
        var sizeCart = cartText.substring(5,cartText.length-1);
        document.getElementById('cart').innerHTML = "CART("+(parseInt(sizeCart)+1)+")";
    }

    sizeBtnz = undefined;
    genderBtns = undefined;
    typeBtns = undefined;
}


// возвращает cookie с именем name, если есть, если нет, то undefined
function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }








//   const STORAGE_KEY = 'fs_cart'

//     var shop_app = new Vue ({
//         el: ".shop-app",
//         data: {
//             cart: [],
//             user_picture: "",
//             cost: "5 - 7",
//             sizes: {
//                 s: false,
//                 m: false,
//                 l: false,
//                 xl: false,
//                 xxl: false,
//                 xxxl: false
//             },
//             genders: {
//                 male: false,
//                 female: false
//             },
//             types: {
//                 regular: false,
//                 warm: false
//             }
//         },
//         created () {
//             this.cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
//         },
//         computed: {
//             user_picture_html: function () {
//                 return this.user_picture ? "<img src=\"" + this.user_picture + "\" class=\"pictures user-picture\">" : "";
//             }
//         },
//         methods: {
//             set_current_size: function (size) {
//                 for (sz in this.sizes) {
//                     this.sizes[sz] = false;
//                 }
//                 this.sizes[size] = true;
//             },
//             set_current_gender: function (gender) {
//                 for (gen in this.genders) {
//                     this.genders[gen] = false;
//                 }
//                 this.genders[gender] = true;
//             },
//             set_current_type: function (type) {
//                 for (tp in this.types) { 
//                     this.types[tp] = false;
//                 }
//                 this.types[type] = true;
//                 if (this.types.regular && !this.types.warm) {
//                     this.cost = "5"
//                 } else if (!this.types.regular && this.types.warm) {
//                     this.cost = "7"
//                 }
//             },
//             add_to_cart: function () {
//                 var item = {
//                     user_picture: "",
//                     size: "",
//                     gender: "",
//                     type: "",
//                     cost: ""
//                 };
//                 for (sz in this.sizes) {
//                     if (this.sizes[sz]) {
//                         item.size = sz;
//                     } 
//                 }
//                 for (gen in this.genders) {
//                     if (this.genders[gen]) {
//                         item.gender = gen;
//                     }
//                 }
//                 for (tp in this.types) {
//                     if (this.types[tp]) {
//                         item.type = tp;
//                     }
//                 }
//             }
//         }
//     });