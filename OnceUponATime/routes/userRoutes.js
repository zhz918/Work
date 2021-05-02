const {log, env, fs, USE_TEST_USER, TEST_USER_ID, TEST_USERNAME,
    User, isMongoError, mongoChecker, authenticate, upload, router} = require("./utilies.js")

const app = router
/*********** User Account ****************/

// A route to login and create a session
/* Request body expects JSON:
{
    "username": <user username>
    "password": <user password>
}
Returned JSON should be:
{
    "currentUser": <user username>
}
*/
app.post("/user/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Use the static method on the User model to find a user
    // by their username and password
    User.findByUsernamePassword(username, password)
        .then(user => {
            // Add the user's id to the session.
            // We can check later if this exists to ensure we are logged in.
            req.session.user = user._id;
            req.session.username = user.username;
            res.send({ currentUser: user.username });
        })
        .catch(error => {
            res.status(400).send()
        });
});

// A route to logout a user
/*
Both request & response body is empty
*/
app.get("/user/logout", (req, res) => {
    // Remove the session
    req.session.destroy(error => {
        if (error) {
            res.status(500).send(error);
        } else {
            res.send()
        }
    });
});

// A route to check if a user is logged in on the session
/* Request body is empty.
If there is a user loged in: returned JSON should be:
{
    "currentUser": <user username>
}
else send error 401
*/
app.get("/user/check-session", (req, res) => {
    if (env !== 'production' && USE_TEST_USER) {
        req.session.user = TEST_USER_ID;
        req.session.username = TEST_USERNAME;
        res.send({ currentUser: TEST_USERNAME })
        return;
    }

    if (req.session.user) {
        res.send({ currentUser: req.session.username });
    } else {
        res.status(401).send();
    }
});

//User registration
/* Request body expects JSON:
{
    "username": <new user username>
    "password": <new user password>
}
Returned JSON should be the new User document added to database, with type user
*/
app.post('/api/register', mongoChecker, async (req, res) => {
    log(`Adding user ${req.body.username}`)

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    const user = new User({
        username: req.body.username,
        password: req.body.password,
        levels: 1,
        joined: `${mm}/${dd}/${yyyy}`,
        points: 1000,
        avatar: {
            data: fs.readFileSync("./client/src/components/images/t-rex.jpg"),
            contentType: 'image/jpg'
        },
        contribution: [],
        likes: [],
        admin: false
    })

    try {
        const result = await user.save()
        res.send(result)
    } catch (error) {
        if (isMongoError(error)) {
            res.status(500).send('Internal server error')
        } else {
            res.status(400).send('Bad Request')
        }
    }
})

//Admin registration
/* Request body expects JSON:
{
    "username": <new admin username>
    "password": <new admin password>
}
Returned JSON should be the new User document added to database, with type admin
*/
app.post('/api/admin', mongoChecker, async (req, res) => {
    log(`Adding user ${req.body.username}`)

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    const user = new User({
        username: req.body.username,
        password: req.body.password,
        levels: 1,
        joined: `${mm}/${dd}/${yyyy}`,
        points: 1000,
        avatar: {
            data: fs.readFileSync("./client/src/components/images/t-rex.jpg"),
            contentType: 'image/jpg'
        },
        contribution: [],
        likes: [],
        admin: true
    })

    try {
        const result = await user.save()
        res.send(result)
    } catch (error) {
        if (isMongoError(error)) {
            res.status(500).send('Internal server error')
        } else {
            res.status(400).send('Bad Request')
        }
    }
})

/*********** User Info ****************/
// Check User Type (admin: true/false)
/* Request body is empty:
Returned JSON should be:
{
    "type": Boolean
}
depends on user type (admin/user)
*/
app.get("/user/type", mongoChecker, authenticate, (req, res) => {
    log(`User Type ${req.user.username}`)
    try {
        res.send({ 'type': req.user.admin })
    } catch (error) {
        log(error)
        res.status(500).send("Internal Server Error")
    }
});

// get list of users for ranking (only username, avatar, points, levels, contribution)
/* Request body is empty
Returned list of User document, with only username, avatar, points, levels, contribution field
*/
app.get('/api/userList', mongoChecker, authenticate, async (req, res) => {
    log(`Get all user info`)

    try {
        const users = await User.find({}, {
            username: 1,
            levels: 1,
            points: 1,
            avatar: 1,
            contribution: 1
        })
        res.send(users)
    } catch (error) {
        if (isMongoError(error)) {
            res.status(500).send('Internal server error')
        } else {
            res.status(400).send('Bad Request')
        }
    }
})

// get current user info
/* Request body is empty
Returned the document of current user, expect password
*/
app.get('/api/user/:username', mongoChecker, authenticate, async (req, res) => {
    const userName = req.params.username
    log(`Get current user info`)

    try {
        const users = await User.find({
            username: userName
        }, {
            username: 1,
            levels: 1,
            points: 1,
            avatar: 1,
            contribution: 1,
            joined: 1
        })
        res.send(users[0])
    } catch (error) {
        if (isMongoError(error)) {
            res.status(500).send('Internal server error')
        } else {
            res.status(400).send('Bad Request')
        }
    }
})

//get userAvatar image by username
/* Request body is empty, with params <username>
Returned the avatar of user with username <username>.
{
    "data": {
        "type": "Buffer",
        "data": [<Buffer>]
    },
    "contentType": <file type>
}
*/
app.get('/api/user/avatar/:username', mongoChecker, authenticate, async (req, res) => {

    const username = req.params.username
    log(`Get ${username}'s avatar`)

    try {
        let user = await User.findOne({
            "username": username
        })
        if (user) {
            res.send(user.avatar)
        } else {
            res.status(404).send("Resource not found")
        }

    } catch (error) {
        if (isMongoError(error)) {
            res.status(500).send('Internal server error')
        } else {
            res.status(400).send('Bad Request')
        }
    }
})

module.exports = router
