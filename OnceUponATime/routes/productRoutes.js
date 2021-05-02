const { log, fs, ProductSection, User, isMongoError, mongoChecker,
    authenticate, upload, router } = require("./utilies.js")
    
const app = router
/*********** Shop (Admin) ****************/
// Add new inventory section
/*
Request body expects JSON:
{
    "name": <section name>,
    "description": <section description>
}
*/
// Returned JSON should be the new ProductSection document
app.post('/api/shop/section', mongoChecker, authenticate, async (req, res) => {

    const name = req.body.name
    const description = req.body.description

    const ps = new ProductSection({
        name: name,
        description: description,
        products: []
    })
    log(`New inventory section`)

    try {
        await ps.save()
        let result = []
        const sections = await ProductSection.find({}, {
            name: 1
        })
        var i;
        for (i = 0; i < sections.length; i++) {
            result.push(sections[i].name)
        }
        res.send(result)
    } catch (error) {
        if (isMongoError(error)) {
            res.status(500).send('Internal server error')
        } else {
            res.status(400).send('Bad Request')
        }
    }
})

// Add new product to sname inventory section
/*
Request body expects form-data:
{
    "name": <new product name>, (String)
    "points": <cost of new product>, (Number)
    "type": "Avatar" or "Level",
    "img": <file> (only accept .jpeg, .jpg, .png),
    "value": <value of the product> (Number)
}
*/
// Returned JSON should be the updated product section document name <sname>
app.post('/api/shop/product/:sname', mongoChecker, authenticate, upload.single('img'), async (req, res) => {
    log(`New product to inventroy section ${req.params.sname}`)
    const product = {
        name: req.body.name,
        img: {
            data: fs.readFileSync(req.file.path),
            contentType: 'image/*'
        },
        points: req.body.points,
        type: req.body.type,
        value: req.body.value
    }

    try {
        const ps = await ProductSection.find({ name: req.params.sname })
        if (ps) {
            ps[0].products.push(product)

            const result = await ps[0].save()
            res.send(result)
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

//get all shop section name
/*Request body empty, return a list of product section name in the database
*/
app.get('/api/shop/sections', mongoChecker, authenticate, async (req, res) => {

    log(`Get all shop section name`)

    try {
        let result = []
        const sections = await ProductSection.find({}, {
            name: 1
        })
        var i;
        for (i = 0; i < sections.length; i++) {
            result.push(sections[i].name)
        }
        res.send(result)
    } catch (error) {
        if (isMongoError(error)) {
            res.status(500).send('Internal server error')
        } else {
            res.status(400).send('Bad Request')
        }
    }
})

// delete shop product section with name <sname>
// Return lsit of all other ProductSection docement
app.delete('/api/shop/sections/:sname', mongoChecker, authenticate, async (req, res) => {
    const sname = req.params.sname
    log(`delete sections ${sname}`)

    try {
        const shop = await ProductSection.findOneAndRemove({
            name: sname
        })
        if (!shop) {
            res.status(404).send("Resource not found")
        } else {
            const result = await ProductSection.find()
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

// delete shop product by id
app.delete('/api/shop/product/:id', mongoChecker, authenticate, async (req, res) => {
    const id = req.params.id
    log(`delete product ${id}`)

    try {
        await ProductSection.updateOne({
            'products._id': id
        }, {
            '$pull': {
                'products': { _id: [id] },
            }
        })
        const result = await ProductSection.find()
        res.send(result)

    } catch (error) {
        if (isMongoError(error)) {
            res.status(500).send('Internal server error')
        } else {
            res.status(400).send('Bad Request')
        }
    }
})

/*********** Shop ****************/
// Get All product section with subdocument products in the database
app.get('/api/allInventory', mongoChecker, authenticate, async (req, res) => {

    log(`Get all Products`)

    try {
        const ps = await ProductSection.find()
        res.send(ps)
    } catch (error) {
        if (isMongoError(error)) {
            res.status(500).send('Internal server error')
        } else {
            res.status(400).send('Bad Request')
        }
    }
})

//buy item
// Deduct the points of product by product id from current user. success if user with enough points.
// Update current user document base of type of product
/* Return:
{
    'success': Boolean
}
*/
app.patch('/api/shop/:id', mongoChecker, authenticate, async (req, res) => {

    const productId = req.params.id
    const username = req.user.username

    log(`user ${username} buy ${productId}`)

    try {
        const users = await User.find({ username: username })
        let user = users[0]
        const ps = await ProductSection.find({
            'products._id': productId
        })
        const product = ps[0].products.id(productId)

        if (user.points >= product.points) {
            user.points = user.points - product.points
            if (product.type == 'Avatar') {
                user.avatar = product.img
            } else if (product.type == 'Level') {
                user.levels = user.levels + product.value
            }
            await user.save()
            res.send({
                'success': true
            })
        } else {
            res.send({
                'success': false
            })
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
