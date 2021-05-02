const log = console.log;
const env = process.env.NODE_ENV

const fs = require('fs');
const path = require('path')


const USE_TEST_USER = env !== 'production' && process.env.TEST_USER_ON
const TEST_USER_ID = '5fb8b011b864666580b4efe3'
const TEST_USERNAME = 'user'

// mongoose and mongo connection
const { mongoose } = require("./../db/mongoose");
mongoose.set('useFindAndModify', false);

// import the mongoose models
const { ProductSection } = require("./../models/product");
const { User } = require("./../models/user");
const { Story } = require("./../models/story");
// to validate object IDs
const { ObjectID } = require("mongodb");

/*** Helper Functions**************************************/
function isMongoError(error) { // checks for first error returned by promise rejection if Mongo database suddently disconnects
    return typeof error === 'object' && error !== null && error.name === "MongoNetworkError"
}

const mongoChecker = (req, res, next) => {
    // check mongoose connection established.
    if (mongoose.connection.readyState != 1) {
        log('Issue with mongoose connection')
        res.status(500).send('Internal server error')
        return;
    } else {
        next()
    }
}

const authenticate = (req, res, next) => {
    if (env !== 'production' && USE_TEST_USER)
        req.session.user = TEST_USER_ID // test user on development. (remember to run `TEST_USER_ON=true node server.js` if you want to use this user.)

    if (req.session.user) {
        User.findById(req.session.user).then((user) => {
            if (!user) {
                return Promise.reject()
            } else {
                req.user = user
                next()
            }
        }).catch((error) => {
            res.status(401).send("Unauthorized")
        })
    } else {
        res.status(401).send("Unauthorized")
    }
}

var multer = require('multer');

/*** Image Upload**************************************/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, 'StoryImage.png')
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
})

var express = require('express');
var router = express.Router();

module.exports = {
    log, env, fs, path, USE_TEST_USER, TEST_USER_ID, TEST_USERNAME, mongoose,
    ProductSection, User, Story, isMongoError, mongoChecker, authenticate, upload, router
}
