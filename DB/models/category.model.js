import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({}, {})

const CATEGORY = mongoose.model('CATEGORY', categorySchema)

export default CATEGORY
