import mongoose, { model, Schema} from 'mongoose'
import { MONGODB_URI } from './config'

mongoose.connect(MONGODB_URI)

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true}
})

export const userModel = model("User", userSchema)

const tagsSchema = new Schema({
    title: {type:String, required: true, unique: true}
})
export const tagsModel = model("Tags", tagsSchema)

export const contentTypes = ['image', 'video', 'article', 'audio']
const contentSchema = new Schema({
    link: String,
    type: { type: String, enum: contentTypes, required: true },
    tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
});

export const contentModel = model("Content", contentSchema)

const linkSchema = new Schema({
    hash: {type: String, required: true},
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true},
    // unique: true
})

export const linkModel = model("Link", linkSchema)

// Ensure indexes are sane when the app boots. In some environments a unique
// index may have been created on `type`, which would incorrectly prevent
// multiple documents with the same type (e.g., many 'article' items).
export async function ensureContentIndexes(): Promise<void> {
    // Wait until mongoose connection is open
    if (mongoose.connection.readyState !== 1) {
        await new Promise((resolve) => mongoose.connection.once('open', resolve))
    }

    try {
        const indexes = await contentModel.collection.indexes()
        const typeIdx = indexes.find((idx: any) => idx.name === 'type_1')
        if (typeIdx && typeIdx.unique) {
            await contentModel.collection.dropIndex('type_1')
            console.log('Dropped unique index type_1 on contents')
        }
    } catch (err: any) {
        if (err && err.codeName !== 'IndexNotFound' && err.code !== 27) {
            console.warn('ensureContentIndexes: inspection/drop warning:', err?.message || err)
        }
    }

    try {
        // Ensure a non-unique index exists for query performance
        await contentModel.collection.createIndex({ type: 1 }, { name: 'type_1', unique: false })
    } catch (err: any) {
        console.warn('ensureContentIndexes: createIndex warning:', err?.message || err)
    }
}