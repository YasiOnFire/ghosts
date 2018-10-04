const express = require('express')
const app = express()
const path = require('path')
const sassMiddleware = require('node-sass-middleware')

app.set("view engine", "pug")

app.set("views", path.join(__dirname, ""))

app.use(sassMiddleware({
  src: path.join(__dirname, '/style'),
  dest: path.join(__dirname),
  debug: false,
  outputStyle: 'compressed',
  prefix: ''
}))

app.use(express.static(path.join(__dirname)))

app.get("/", (req, res) => {
  res.render("index")
})

app.listen(3003, () => console.log('\x1b[36m', 'Serving this beautiful dish at http://localhost:3003 !', '\x1b[0m'))
