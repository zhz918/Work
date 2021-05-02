// environment configurations
import ENV from './../config.js'
const API_HOST = ENV.api_host

export const getAllShop = (comp) => {
    const url = `${API_HOST}/api/allInventory`;

    const request = new Request(url, {
        method: "get"
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200) {
                return res.json();
            }else{

            }
        })
        .then(function (json) {

            if(json) {
                comp.setState({
                    inventory: json
                })
            }
        })
        .catch(error => {
            console.log(error);
        });
}

export const buyProduct = (id, comp) => {
    const url = `${API_HOST}/api/shop/${id}`;

    const request = new Request(url, {
        method: "PATCH"
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200) {
                return res.json();
            }else{

            }
        })
        .then(function (json) {
            comp.setState({
                purchase: json.success
            })
        })
        .catch(error => {
            console.log(error);
        });
}

export const getShopSections = (comp) => {
    const url = `${API_HOST}/api/shop/sections`;

    const request = new Request(url, {
        method: "get"
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200) {
                return res.json();
            }else{

            }
        })
        .then(function (json) {

            if(json) {
                comp.setState({
                    sections: json
                })
            }
        })
        .catch(error => {
            console.log(error);
        });
}

export const addSection = (name, description, comp) => {
    const url = `${API_HOST}/api/shop/section`;

    const data = {
        'name': name,
        'description': description
    }

    const request = new Request(url, {
        body: JSON.stringify(data),
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
        },
        method: "post"
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200) {
                return res.json();
            }else{

            }
        })
        .then(function (json) {
            comp.setState({
                sections: json
            })
        })
        .catch(error => {
            console.log(error);
        });
}

export const addProduct = (sname, name, points, img, type, value) => {
    const url = `${API_HOST}/api/shop/product/${sname}`;

    const formData = new FormData()
    formData.append("name",name)
    formData.append("points",points)
    formData.append("type",type)
    formData.append("img",img)
    formData.append("value",value)

    const request = new Request(url, {
        body: formData,
        method: "post"
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200) {
                return res.json();
            }else{

            }
        })
        .catch(error => {
            console.log(error);
        });
}

export const deleteSection = (name, comp) => {
    const url = `${API_HOST}/api/shop/sections/${name}`;

    const request = new Request(url, {
        method: "DELETE"
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200) {
                return res.json();
            }else{

            }
        })
        .then(function (json) {
            comp.setState({
                inventory: json
            })
        })
        .catch(error => {
            console.log(error);
        });
}

export const deleteProduct = (id, comp) => {
    const url = `${API_HOST}/api/shop/product/${id}`;

    const request = new Request(url, {
        method: "DELETE"
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200) {
                return res.json();
            }else{

            }
        })
        .then(function (json) {
            comp.setState({
                inventory: json
            })
        })
        .catch(error => {
            console.log(error);
        });
}