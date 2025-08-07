import express from 'express'
import jwt from 'jsonwebtoken'
import { userModel, tagsModel, contentModel, linkModel } from './db';
import { JWT_PASSWORD } from './config';
import { userMiddleware } from './middleware';
import { contentTypes } from './db';
import { random } from './utils';


const app = express();
app.use(express.json())

app.post('/api/v1/signup', async (req, res) => {
    // zod validation & hash password
    const username = req.body.username;
    const password = req.body.password

    try {
        await userModel.create({
        username: username,
        password: password
    })

    res.json({
        message: "User Signed Up"
    })
    } catch (error) {
        res.status(411).json({
            message: "User already exists"
        })
    }
})

app.post('/api/v1/signin', async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    const existingUser = await userModel.findOne({
        username: username,
        password: password
    })
    if (existingUser) {
        const token = jwt.sign({
            id: existingUser._id
        }, JWT_PASSWORD)

        res.json({
            token
        })
    } else {
        res.status(411).json({
            msg: "Invalid credentials"
        })
    } 
})

app.post('/api/v1/content', userMiddleware, async (req, res) => {
    const link = req.body.link
    const type = req.body.type

    if (!contentTypes.includes(type)) {
        return res.status(400).json({ msg: "Invalid content type" });
    }

    await contentModel.create({
        link,
        type,
        tags: [],
        userId: req.userId
    })
    return res.json({
        msg: "Content added"
    })
})

app.get('/api/v1/content', userMiddleware, async(req, res) => {
    const userId = req.userId
    const content = await contentModel.find({
        userId: userId
    }).populate("userId", "username")
    res.json({
        content
    })
})

app.delete('/api/v1/content', userMiddleware, async (req, res) => {
    const contentId = req.body.contentId

    try {
        await contentModel.deleteMany({
        contentId,
        userId: req.userId
    })
    res.json({
        msg: "Deleted"
    })
    } catch (error) {
        res.status(411).json({
            msg: "Something went wrong"
        })
    }
})

app.post('/api/v1/brain/share', userMiddleware, async (req, res) => {
    const share = req.body.share
    if (share) {
        const existingLink = await linkModel.findOne({
            userId: req.userId
        })
        if (existingLink) {
            res.json({
                hash: existingLink.hash
            })
            return;
        }
        const hash = random(10)
        await linkModel.create({
            userId: req.userId,
            hash: hash
        })

        res.json({
            hash
        })
    } else {
        await linkModel.deleteOne({
            userId: req.userId
        })
    }

    res.json({
        message: "Removed sharable link"
    })
})

app.get('/api/v1/brain/:shareLink', async (req, res) => {
    const hash = req.params.shareLink;

    const link = await linkModel.findOne({
        hash
    });

    if (!link) {
        res.status(411).json({
            message: "Sorry incorrect input"
        })
        return;
    }

    const content = await contentModel.find({
        userId: link.userId
    })

    const user = await userModel.findOne({
        _id: link.userId
    })

    res.json({
        username: user?.username,
        content: content
    })
})

app.listen(3000)