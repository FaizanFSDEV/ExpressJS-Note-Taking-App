const mongoose = require('mongoose')
const Schema = mongoose.Schema

const noteSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  createDate: {
    type: Date,
    required: true,
    default: new Date()
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }
})

const NoteModel = mongoose.model('Note', noteSchema)

module.exports = NoteModel