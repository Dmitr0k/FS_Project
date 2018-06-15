const STORAGE_KEY = 'fs_cart'
const NAME_KEY = 'login'
const IS_USER_KEY = 'isUser'

var shop_app = new Vue({
    el: ".shop-app",
    data: {
        name: "",
        is_user: false,
        cart: [],
        user_picture: "",
        cost: "5 - 7",
        sizes: {
            s: false,
            m: false,
            l: false,
            xl: false,
            xxl: false,
            xxxl: false
        },
        genders: {
            male: false,
            female: false
        },
        types: {
            regular: false,
            warm: false
        }
    },
    created() {
        this.cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        this.is_user = (localStorage.getItem(IS_USER_KEY) == 'true') || false;
        this.name = localStorage.getItem(NAME_KEY) || "";
    },
    computed: {
        user_picture_html: function () {
            return this.user_picture ? "<img src=\"" + this.user_picture + "\" class=\"pictures user-picture\">" : "";
        }
    },
    methods: {
        set_current_size: function (size) {
            for (sz in this.sizes) {
                this.sizes[sz] = false;
            }
            this.sizes[size] = true;
        },
        set_current_gender: function (gender) {
            for (gen in this.genders) {
                this.genders[gen] = false;
            }
            this.genders[gender] = true;
        },
        set_current_type: function (type) {
            for (tp in this.types) {
                this.types[tp] = false;
            }
            this.types[type] = true;
            if (this.types.regular && !this.types.warm) {
                this.cost = "5"
            } else if (!this.types.regular && this.types.warm) {
                this.cost = "7"
            }
        },
        add_to_cart: function () {
            var item = {
                user_picture: "",
                size: "",
                gender: "",
                type: "",
                cost: ""
            };
            for (sz in this.sizes) {
                if (this.sizes[sz]) {
                    item.size = sz;
                }
            }
            for (gen in this.genders) {
                if (this.genders[gen]) {
                    item.gender = gen;
                }
            }
            for (tp in this.types) {
                if (this.types[tp]) {
                    item.type = tp;
                }
            }
            if (item.size && item.gender && item.type) {
                item.user_picture = this.user_picture;
                item.cost = this.cost;
                this.cart.push(item);
                var cart_json = JSON.stringify(this.cart);
                localStorage.setItem(STORAGE_KEY, cart_json);
            }
        }
    }
});

var cart_app = new Vue({
    el: ".cart-app",
    data: {
        cart: [],
        name: "",
        is_user: false
    },
    created() {
        this.cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        this.is_user = (localStorage.getItem(IS_USER_KEY) == 'true') || false;
        this.name = localStorage.getItem(NAME_KEY) || "";
    },
    computed: {
        total_cost: function () {
            var tc = 0;
            for (item in this.cart) {
                tc += parseInt(this.cart[item].cost);
            }
            return tc;
        }
    },
    methods: {
        delete_from_cart: function (index) {
            this.cart.splice(index, 1);
            var cart_json = JSON.stringify(this.cart);
            localStorage.setItem(STORAGE_KEY, cart_json);
        },
        isValidUrl: function (index) {
            var regexp_url = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
            return regexp_url.test(this.cart[index].user_picture);
        }
    }
});

var login_page = new Vue({
    el: ".login-app",
    data: {
        cart: []
    },
    created() {
        this.cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }
});

var about_page = new Vue({
    el: ".about-app",
    data: {
        cart: [],
        name: "",
        is_user: false
    },
    created() {
        this.cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        this.is_user = (localStorage.getItem(IS_USER_KEY) == 'true') || false;
        this.name = localStorage.getItem(NAME_KEY) || "";
    }
});

var profile_page = new Vue({
    el: ".profile-app",
    data: {
        cart: [],
        orders: [],
        name: "",
        is_user: false,
    },
    created() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/myProfile');
        xhr.send();
        xhr.onreadystatechange = () => {
            if (xhr.readyState != 4)
                return;

            this.orders = JSON.parse(xhr.responseText);
           console.log(this.orders);
        }
        this.cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        this.is_user = (localStorage.getItem(IS_USER_KEY) == 'true') || false;
        this.name = localStorage.getItem(NAME_KEY) || "";
        console.log(this.cart);
    },
    methods: {
        isValidUrl: function (index) {
            var regexp_url = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
            return regexp_url.test(this.cart[index].user_picture);
        }
    }
});