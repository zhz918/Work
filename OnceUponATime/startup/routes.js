let storyRouter = require("./../routes/storyRoutes")
let productRouter = require("./../routes/productRoutes")
let userRouter = require("./../routes/userRoutes")

module.exports = function(app) {
    app.use("/", storyRouter);
    app.use("/", productRouter);
    app.use("/", userRouter);
}
