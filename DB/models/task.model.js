import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({}, {})

const TASK = mongoose.model('TASK', taskSchema)

export default TASK
