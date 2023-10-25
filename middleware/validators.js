const jwt = require("jsonwebtoken");
module.exports = {
    validation: (req,res,next) => {


        next()
    },
    authorization : (req, res, next) => {
        if (!req.headers.authorization) return;
        const token = req.headers.authorization;
        console.log(token)
        jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {

            if (err) {
                return res.send({ error: true, data: [], message: "false" });
            }
            req.user = data;
            next();
        });
    }}