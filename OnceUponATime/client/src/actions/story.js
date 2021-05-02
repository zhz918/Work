// environment configutations
import ENV from './../config.js'
const API_HOST = ENV.api_host
//console.log('Current environment:', ENV.env)

export const addStory = (title, content, op1, op2, img, app, user) => {
    const url = `${API_HOST}/api/addStory`;
    const formData = new FormData()
    formData.append("title",title)
    formData.append("content",content)
    formData.append("op1",op1)
    formData.append("op2",op2)
    formData.append("img",img)

    const request = new Request(url, {
        method: "post",
        body: formData,
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200) {
                app.history.push({
                    pathname: '/home',
                    currUser: user
                });
            }
        })
        .catch(error => {
            console.log(error);
        });
};

export const getAllStory = (comp, cb) => {
    const url = `${API_HOST}/api/allStory`;

    const request = new Request(url, {
        method: "get"
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200){
                return res.json();
            }
            else{
                alert("Could not find any story");
            }
        })
        .then(function (json) {
            if (json){
                comp.setState({
                    stories: json,
                    allStories: json
                })
            }
        })
        .then (function () {
            cb()
        })
        .catch(error => {
            console.log(error);
        });
}

export const getStoryById = (id, comp) => {

    const url = `${API_HOST}/api/story/${id}`;

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
                    story: json,
                    node: json.nodes[0],
                    curNode: json.nodes[0]._id
                })
                const firstAuthor = json.nodes[0].author
                getAuthorAvatar(firstAuthor, comp)
            }
        })
        .catch(error => {
            console.log(error);
        });
}

export const deleteStoryById = (id, comp) => {
    const url = `${API_HOST}/api/story/${id}`;

    const request = new Request(url, {
        method: "DELETE",
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200) {
                return res.json();
            } else {
                alert("Could not delete the story")
            }
        })
        .then(function (json) {
            let stories = comp.state.stories
            let newStories = stories.filter(story => story._id != id)
            if (json) {
                comp.setState({
                    stories: newStories
                })
            }
        })
        .catch(error => {
            console.log(error);
        });
}

export const likeStory = (id, comp) => {
    const url = `${API_HOST}/api/story/likes/${id}`;

    const request = new Request(url, {
        method: "PATCH"
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200) {
                return res.json();
            }else{
                return {}
            }
        })
        .then(function (json) {
            if(json) {
                comp.setState({
                    story: json
                })
            }
        })
        .catch(error => {
            console.log(error);
        });

}

export const updateNode = (content, op1, op2, img, id, nid, comp) => {
    const url = `${API_HOST}/api/story/${id}/${nid}`;
    const formData = new FormData()
    formData.append("content",content)
    formData.append("op1",op1)
    formData.append("op2",op2)
    formData.append("img",img)

    const request = new Request(url, {
        method: "PATCH",
        body: formData,
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
                    story: json.story,
                    node: json.node
                })
            }
        })
        .catch(error => {
            console.log(error);
        });
}

export const deleteNodes = (id, nodes, comp) => {

    const url = `${API_HOST}/api/story/nodes/${id}`;

    const data = {
        nodes: nodes
    }

    const request = new Request(url, {
        method: "DELETE",
        body: JSON.stringify(data),
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
        }
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
                    story: json
                })
            }
        })
        .catch(error => {
            console.log(error);
        });
}

export const clearNode = (id, nid, comp) => {

    const url = `${API_HOST}/api/story/nodes/${id}/${nid}`;

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

            if(json) {
                comp.setState({
                    story: json.story,
                    node: json.node
                })
            }
        })
        .catch(error => {
            console.log(error);
        });
}

// get user's avatar by username
export const getAuthorAvatar = (username, comp) => {
    const url = `${API_HOST}/api/user/avatar/${username}`;

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
            comp.setState({
                userAvatar: json
            })
        })
        .catch(error => {
            console.log(error);
        });
}
