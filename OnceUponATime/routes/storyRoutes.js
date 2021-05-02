const { log, fs, User, Story, isMongoError,
    mongoChecker, authenticate, upload, router } = require("./utilies.js")

const app = router

/*********** Story ****************/
// Add new Story
/*
Request body expects form-data:
{
    "title": <story name>,
    "content": <first node content>,
    "op1": <first node option 1>,
    "op2": <first node option 2>,
    "img": <file> (only accept .jpeg, .jpg, .png)
}
Returned JSON should be the new Story document added to database.
*/
app.post('/api/addStory', mongoChecker, authenticate, upload.single('img'), async (req, res) => {

    log(`Adding new Story by ${req.user.username}`)

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    const story = new Story({
        title: req.body.title,
        contributor: [req.user.username],
        likes: [],
        nodeCount: 1,
        nodes: [],
        closed: false
    });

    story.nodes.push({
        author: req.user.username,
        date: `${mm}/${dd}/${yyyy}`,
        content: req.body.content,
        img: {
            data: fs.readFileSync(req.file.path),
            contentType: 'image/*'
        },
        follow: true,
        options: [['', req.body.op1], ['', req.body.op2]]
    })

    story.nodes.push({ follow: false })
    story.nodes.push({ follow: false })

    story.nodes[0].options[0][0] = story.nodes[1]._id
    story.nodes[0].options[1][0] = story.nodes[2]._id

    try {
        const result = await story.save()
        let user = await User.findById(req.user._id)
        user.contribution.push(story._id)
        user.points = user.points + 50
        await user.save()
        res.send(result)
    } catch (error) {
        if (isMongoError(error)) {
            res.status(500).send('Internal server error')
        } else {
            res.status(400).send('Bad Request')
        }
    }
})

// get list of all stories
/*
Request body is empty
Returned JSON should be the list of all Story document in the database.
*/
app.get('/api/allStory', mongoChecker, authenticate, async (req, res) => {

    log(`Get all story`)

    try {
        const stories = await Story.find()
        res.send(stories)
    } catch (error) {
        if (isMongoError(error)) {
            res.status(500).send('Internal server error')
        } else {
            res.status(400).send('Bad Request')
        }
    }
})

// get list of stories contributed by current user
/*
Request body is empty.
Returned JSON should be the list of Story document in the database with current
user contribution.
*/
app.get('/api/storyContribute/:username', mongoChecker, authenticate, async (req, res) => {

    const curUser = req.params.username
    log(`Get all story contributed by ${curUser}`)

    try {
        const stories = await Story.find({ contributor: curUser })
        res.send(stories)
    } catch (error) {
        if (isMongoError(error)) {
            res.status(500).send('Internal server error')
        } else {
            res.status(400).send('Bad Request')
        }
    }
})

// get list of stories liked by current user
/*
Request body is empty.
Returned JSON should be the list of Story document in the database liked by current user.
*/
app.get('/api/storyLikes/:username', mongoChecker, authenticate, async (req, res) => {

    const curUser = req.params.username
    log(`Get all story liked by ${curUser}`)

    try {
        const stories = await Story.find({ likes: curUser })
        res.send(stories)
    } catch (error) {
        if (isMongoError(error)) {
            res.status(500).send('Internal server error')
        } else {
            res.status(400).send('Bad Request')
        }
    }
})

// get story by id, return the Story document
app.get('/api/story/:id', mongoChecker, authenticate, async (req, res) => {

    const storyId = req.params.id
    log(`Get story ${storyId}`)

    try {
        const story = await Story.findById(storyId)
        res.send(story)
    } catch (error) {
        if (isMongoError(error)) {
            res.status(500).send('Internal server error')
        } else {
            res.status(400).send('Bad Request')
        }
    }
})

// delete a story by id from database
app.delete('/api/story/:id', mongoChecker, authenticate, async (req, res) => {
    const storyId = req.params.id
    log(`delete story ${storyId}`)

    try {
        const story = await Story.findByIdAndRemove(storyId)
        if (!story) {
            res.status(404).send("Resource not found")
        } else {
            res.send(story)
        }
    } catch (error) {
        if (isMongoError(error)) {
            res.status(500).send('Internal server error')
        } else {
            res.status(400).send('Bad Request')
        }
    }
})

//udpate likes list in story with correspond <id> &
//add the story with correspond <id> to like list for current user
/*
Request body expects the updated Story document
*/
app.patch('/api/story/likes/:id', mongoChecker, authenticate, async (req, res) => {

    const storyId = req.params.id
    const username = req.user.username

    try {
        let story = await Story.findById(storyId)
        let user = await User.findById(req.user._id)
        if (story && user) {
            if (story.likes.includes(username)) {
                log(`User ${username} unliked story ${storyId}`)
                story.likes = story.likes.filter(e => e !== username);
                user.likes = user.likes.filter(e => e !== storyId);
            } else {
                log(`User ${username} liked story ${storyId}`)
                story.likes.push(username)
                user.likes.push(storyId)
            }
            await user.save()
            const result = await story.save()
            res.send(result)
        }
    } catch (error) {
        if (isMongoError(error)) {
            res.status(500).send('Internal server error')
        } else {
            res.status(400).send('Bad Request')
        }
    }
})

//update node <nid> in story <id> with new information
/*
Request body expects form-data:
{
    "content": <new story content>,
    "op1": <node option 1>,
    "op2": <node option 2>,
    "img": <file> (only accept .jpeg, .jpg, .png)
}
*/
// Returned JSON should have the updated Story <id> document and the node <nid> subdocument:
//   { "story": <story document>, "node": <node subdocument>}
app.patch('/api/story/:id/:nid', mongoChecker, authenticate, upload.single('img'), async (req, res) => {
    const username = req.user.username
    log(`Update Node ${req.params.nid} from Story ${req.params.id} by ${req.user.username}`)

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    try {
        let story = await Story.findById(req.params.id)
        let user = await User.findById(req.user._id)
        if (story && user) {
            const node = story.nodes.id(req.params.nid);
            if (node && (!node.follow)) {
                if (!story.contributor.includes(username)) {
                    story.contributor.push(username)
                    user.contribution.push(story._id)
                }
                user.points = user.points + 100
                await user.save()
                story.nodes.push({ follow: false })
                story.nodes.push({ follow: false })

                node.author = req.user.username
                node.date = `${mm}/${dd}/${yyyy}`
                node.content = req.body.content
                node.img = {
                    data: fs.readFileSync(req.file.path),
                    contentType: 'image/*'
                }
                node.follow = true
                const id1 = story.nodes[story.nodes.length - 1]._id
                const id2 = story.nodes[story.nodes.length - 2]._id
                node.options = [[id1, req.body.op1], [id2, req.body.op2]]
                const result = await story.save()
                res.send({
                    story: result,
                    node: node
                })
            } else {
                res.status(400).send('Bad Request')
            }
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

//delete nodes in story <id>
/*
Request body expects a list of id of nodes in story <id>.
Returned JSON should be the update story document
*/
app.delete('/api/story/nodes/:id/', mongoChecker, authenticate, async (req, res) => {

    log(`Delete Nodes from Story ${req.params.id}`)

    const nodes = req.body.nodes
    try {
        await Story.updateMany({
            '_id': req.params.id
        }, {
            '$pull': {
                'nodes': { _id: nodes },
            }
        })
        const update = await Story.findById(req.params.id)
        if (update) {
            res.send(update)
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

//clear all field in node <nid> in story <id>, set follows: false
/*
No request body.
*/
// Returned JSON should have the updated Story <id> document and the node <nid> subdocument:
//   { "story": <story document>, "node": <node subdocument>}
app.patch('/api/story/nodes/:id/:nid', mongoChecker, authenticate, async (req, res) => {

    log(`Clear Nodes ${req.params.nid} from Story ${req.params.id}`)

    try {
        const result = await Story.updateOne(
            {
                '_id': req.params.id,
                'nodes._id': req.params.nid
            }, {
            '$unset': {
                'nodes.$.author': '',
                'nodes.$.date': '',
                'nodes.$.content': '',
                'nodes.$.img': '',
                'nodes.$.options': '',
            },
            '$set': {
                'nodes.$.follow': false
            }
        }
        )

        let node = await Story.findOne({
            "nodes._id": req.params.nid
        }, { "nodes.$": true })
        let story = await Story.findById(req.params.id)
        if (node && story) {
            node = node.nodes[0]
            res.send({
                story: story,
                node: node
            })
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
