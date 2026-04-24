import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
})

export default mongoose.model('Team', teamSchema)