const mongoose = require('mongoose')

const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true,  min: 3, },
    body: { type: String,required: true,min: 3, }
})

module.exports = mongoose.model('Note', NoteSchema, 'notes')