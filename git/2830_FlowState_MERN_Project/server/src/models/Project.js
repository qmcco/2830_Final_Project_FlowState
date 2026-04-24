import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
})

export default mongoose.model('Project', projectSchema)