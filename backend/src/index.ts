import express from 'express'
import jwt from 'jsonwebtoken'
import { userModel, tagsModel, contentModel, linkModel, ensureContentIndexes } from './db';
import { JWT_PASSWORD } from './config';
import { userMiddleware } from './middleware';
import { contentTypes } from './db';
import { random } from './utils';


const app = express();
app.use(express.json())

// Lightweight link preview endpoint for fetching Open Graph metadata (image/title)
app.get('/api/v1/preview', async (req, res) => {
    const url = (req.query.url as string) || ''
    try {
        const u = new URL(url)
        if (!['http:', 'https:'].includes(u.protocol)) {
            return res.status(400).json({ msg: 'Invalid protocol' })
        }
        if (['localhost', '127.0.0.1', '::1'].includes(u.hostname)) {
            return res.status(400).json({ msg: 'Blocked host' })
        }

        const resp = await fetch(u.toString(), {
            headers: {
                // Pretend to be a browser for better OG responses
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
            }
        })
        const html = (await resp.text()).slice(0, 300000)

        const pick = (name: string, attr: 'property' | 'name' = 'property'): string | null => {
            const r1 = new RegExp(`<meta[^>]+${attr}=["']${name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}["'][^>]+content=["']([^"']+)`, 'i')
            const r2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}["']`, 'i')
            const m1 = html.match(r1)
            if (m1 && m1[1]) return m1[1]
            const m2 = html.match(r2)
            return m2 && m2[1] ? m2[1] : null
        }

        const image = pick('og:image') || pick('twitter:image', 'name')
        const title = pick('og:title') || pick('twitter:title', 'name')
        const siteName = pick('og:site_name') || u.hostname

        return res.json({ image: image || null, title: title || null, siteName })
    } catch (e) {
        return res.status(400).json({ msg: 'Invalid URL' })
    }
})

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

    try {
        await contentModel.create({
            link,
            type,
            tags: [],
            userId: req.userId
        })
        return res.json({ msg: "Content added" })
    } catch (error: any) {
        // Ensure we always return JSON on failure so the frontend can display it
        const message = (error && error.message) ? error.message : "Something went wrong while adding content"
        return res.status(500).json({ msg: message })
    }
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
        await contentModel.deleteOne({
            // match document by id and owner
            _id: contentId,
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
            return res.json({ hash: existingLink.hash })
        }
        const hash = random(10)
        await linkModel.create({
            userId: req.userId,
            hash: hash
        })
        return res.json({ hash })
    } else {
        await linkModel.deleteOne({
            userId: req.userId
        })
        return res.json({ message: "Removed sharable link" })
    }
})

app.get('/api/v1/brain/share', userMiddleware, async (req, res) => {
    const existingLink = await linkModel.findOne({ userId: req.userId })
    if (!existingLink) {
        return res.json({ hash: null })
    }
    return res.json({ hash: existingLink.hash })
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

ensureContentIndexes()
  .catch((e) => console.warn('Index ensure failed:', (e as any)?.message || e))

app.listen(3000)