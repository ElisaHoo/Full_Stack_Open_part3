const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

// Database's address which is obtained through an environmental variable
const url = process.env.MONGODB_URI

console.log('Connecting to', url)
mongoose
  .connect(url)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
  },
  number: {
    type: String,
    minlength: 8,
    validate: {
      validator: function(v) {
        return /^\d{2,3}-\d{1,}/.test(v)
      },
      message: () =>
        'The number should be at least 8 characters long, divided into two groups (first 2-3 numbers) separated with a dash.',
    },
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
