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
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true}
})

export const linkModel = model("Link", linkSchema)