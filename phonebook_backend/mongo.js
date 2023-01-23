// This file is made only for assignment 3.12

const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

function login() {
  const password = process.argv[2]
  const url =
        `mongodb+srv://fullstack:${password}@cluster0.8ufdgnr.mongodb.net/?retryWrites=true&w=majority`

  mongoose.set('strictQuery', false)
  mongoose.connect(url)
}

if (process.argv.length < 3) {
  console.log('Please give password as argument')
  process.exit(1)
} else if (process.argv.length === 3) {
  login()
  Person.find({}).then(persons => {
    console.log('Phonebook:')
    persons.forEach(person => {
      console.log(person['name'], person['number'])
    })
    mongoose.connection.close()
  })
} else if (process.argv.length === 4) {
  console.log('Please enter also the number')
  process.exit(1)
} else if (process.argv.length === 5) {
  login()
  const nimi = process.argv[3]
  const numero = process.argv[4]
  const person = new Person({
    name: nimi,
    number: numero,
  })
  person.save().then(() => {
    console.log(`Added ${nimi} number ${numero} to phonebook`)
    mongoose.connection.close()
  })
}