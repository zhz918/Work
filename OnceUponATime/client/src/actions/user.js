// Functions to help with user actions.

// environment configutations
import ENV from './../config.js'
const API_HOST = ENV.api_host

// Send a request to check if a user is logged in through the session cookie
export const checkSession = (app) => {
    const url = `${API_HOST}/user/check-session`;

    if (!ENV.use_frontend_test_user) {
        fetch(url)
        .then(res => {
            if (res.status === 200) {
                return res.json();
            }
        })
        .then(json => {
            if (json && json.currentUser) {
                app.setState({ currentUser: json.currentUser });
            } else {
                app.setState({ currentUser: null})
            }
        })
        .catch(error => {
            console.log(error);
        });
    } else {
        app.setState({ currentUser: ENV.user });
    }

};

export const register = (username, password, registerRespond) => {
    const url = `${API_HOST}/api/register`;

    const data = {
        "username": username,
        "password": password
    }

    const request = new Request(url, {
        method: "post",
        body: JSON.stringify(data),
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
        }
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200) {
                registerRespond.innerHTML = "Register Success"
            } else {
                // If server couldn't add the student, tell the user.
                // Here we are adding a generic message, but you could be more specific in your app.
                registerRespond.innerHTML = "Register Failed"
            }
        })
        .catch(error => {
            console.log(error);
        });
};

export const login = (username, password, registerRespond, app) => {
    const url = `${API_HOST}/user/login`;

    const data = {
        "username": username,
        "password": password
    }

    const request = new Request(url, {
        method: "post",
        body: JSON.stringify(data),
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
        }
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200) {
                registerRespond.innerHTML = "Login Success"
                app.history.push({
                    pathname: '/home',
                    currUser: username
                  });
            } else {
                // If server couldn't add the student, tell the user.
                // Here we are adding a generic message, but you could be more specific in your app.
                registerRespond.innerHTML = "Login Failed"
                alert("Wrong username or password!")
            }
        })
        .catch(error => {
            console.log(error);
        });
};

// A function to send a POST request with the user to be logged in
export const login2 = (loginComp, app, history) => {
    // Create our request constructor with all the parameters we need
    const request = new Request(`${API_HOST}/user/login`, {
        method: "post",
        body: JSON.stringify(loginComp.state),
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
        }
    });

    // Send the request with fetch()
    fetch(request)
        .then(res => {
            if (res.status === 200) {
                return res.json();
            }
        })
        .then(json => {
            if (json.currentUser !== undefined) {
                app.setState({
                    currentUser: json.currentUser
                });
            }
            history.push({
                pathname: '/home',
                currUser: json.currentUser
            });
        })
        .catch(error => {
            console.log(error);
        });
};

// A function to send a GET request to logout the current user
export const logout = (app) => {
    const url = `${API_HOST}/user/logout`;

    fetch(url)
        .then(res => {
            app.setState({
                currentUser: null,
                loading: false,
                message: { type: "", body: "" }
            });
        })
        .catch(error => {
            console.log(error);
        });
};

export const checkUserType = (comp) => {
    const url = `${API_HOST}/user/type`;

    const request = new Request(url, {
        method: "get"
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200) {
                return res.json();
            }
            throw "User type could not be retrieved"
        })
        .then(function (json) {
            comp.setState({
                admin: json["type"]
            })
        })
        .catch(error => {
            console.log(error);
        });

};

//TODO
export const getUserInfo = (comp, user) => {
    const url = `${API_HOST}/api/user/${user}`;

    const request = new Request(url, {
        method: "get"
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200) {
                return res.json();
            }
            throw "can not find such user"
        })
        .then(function (json) {
            if (json){
                comp.setState({
                    user: json
                })
            }
        })
        .catch(error => {
            console.log(error);
        });
};

export const getUserContribution = (comp, user) => {
    const url = `${API_HOST}/api/storyContribute/${user}`;

    const request = new Request(url, {
        method: "get",
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200){
                return res.json();
            }
            throw "no such user"
        })
        .then(function (json) {
            if (json){
                comp.setState({
                    contribution: json
                })
            }
        })
        .catch(error => {
            console.log(error)
        })
}

export const getUserLikes = (comp, user) => {
    const url = `${API_HOST}/api/storyLikes/${user}`;

    const request = new Request(url, {
        method: "get",
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200){
                return res.json();
            }
            throw "no such user"
        })
        .then(function (json) {
            if (json){
                comp.setState({
                    likes: json
                })
            }
        })
        .catch(error => {
            console.log(error)
        })
}
