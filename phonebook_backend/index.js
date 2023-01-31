const express = require('express')
const app = express()

// Node's CORS (Cross-Origin Resource Sharing) -middleware
const cors = require('cors')

// Important: gitignore (and also dockerignore) .env-file !!
// To set env.variable to fly.io run: flyctl secrets set MONGODB_URI='<db_address_with_password_here>'
require('dotenv').config()

const Person = require('./models/person') // variable Person's value will be the value that comes from model "person"

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

// JSON-parser = middleware
app.use(express.json())

app.use(requestLogger)

app.use(cors())

// "Static"-middleware is used to show static content (like frontend index.js)
app.use(express.static('build'))

/*const morgan = require('morgan') // morgan is middleware that will log requests (take a look at terminal)
morgan.token('postData', function showPostData (req, res) {return JSON.stringify(req.body)} )
//app.use(morgan('tiny'))
app.use(morgan(`:method :url :status :res[content-length] - :response-time ms :postData`))*/

// Getting everyone's phone numbers
app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

// info page
app.get('/info', (request, response) => {
  let amount = 0
  Person.find({}).then((person) => {
    amount = person.length
    response.send(
      `<p>Phonebook has info for ${amount} persons</p><p>${new Date()}</p>`
    )
  })
})

// Getting selected person's phone number
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end() // If person id doesn't exist -> 404
      }
    })
    .catch((error) => next(error)) // If findById's promise ends up to be rejected = id doesn't mach the format of MongoDB's ids
})

// Delete person
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end() //If operation was successful = if object was deleted or there wasn't object but id was fine
    })
    .catch((error) => next(error)) // if id was malformatted
})

// Add new person
app.post('/api/persons', (request, response, next) => {
  const body = request.body // getting the data of a newly created person

  // person-objects are created by Person-constructor function
  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

// Update the number if person already exists in phone book
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

// Middleware for processing non-existent addresses
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown endpoint' })
}

app.use(unknownEndpoint)

// Express's errorhandler middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'TypeError') {
    return response.status(400).send({ error: 'The person as already removed from the server' })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
