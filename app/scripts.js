window.onload = function () {
    var app = new Vue ({
        el: ".shop-app",
        data: {
            cart: [],
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
                    item.cost = this.cost;
                    this.cart.push(item);
                }
            }
        }
    })
}