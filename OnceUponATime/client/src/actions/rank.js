// environment configurations
import ENV from './../config.js'
const API_HOST = ENV.api_host

export const getUsers = (comp, cb) => {
    const url = `${API_HOST}/api/userList`

    const request = new Request(url, {
        method: "get"
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200) {
                return res.json();
            }
            throw "Users could not be retrieved"
        })
        .then(function (json) {
            if (json) {
                comp.setState({
                    users: json
                })
            }
        })
        .then(function () {
            cb()
        })
        .catch(error => {
            console.log(error);
        });
}
