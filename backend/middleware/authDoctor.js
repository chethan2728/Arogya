import jwt from 'jsonwebtoken';

// backend/middleware/authUser.js
const authDoctor = async (req, res, next) => {
    try {

        const { dtoken } = req.headers

        if (!dtoken) {
            return res.json({ success: false, message: "No Token Provided" })
        }
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
        req.docId = token_decode.id;
        if (!req.body) req.body = {}; 
        req.body.docId = token_decode.id;
        next()


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default authDoctor