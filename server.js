'use strict';
require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 4000;
const cors = require('cors');
const superagent = require('superagent');
const app = express();
app.use(cors());
app.set('view engine', 'ejs');
// app.use(express.static(__dirname + '/public'));

app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));
app.get('/', (req, res) => {

  res.render('pages/index');
});
// app.get('/',(req,res)=>{
//     res.render('pages/index');
// });
app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new');
  
});
app.get('/error', (req, res) => {
  throw new Error('pages/error');
});
app.get('/show', (req, res) => {
  res.render('pages/searches/show');
});
app.get('/hello', (req, res) => {
  res.render('pages/index');
});


app.get('/searches', (req, res) => {
  res.render('pages/searches/new');
});
app.post('/searches', (req, res) => {

  let SearchForm = request.body.SearchForm;
  let radioInput = request.body.radioInput;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${SearchForm}+in${radioInput}`;
  superagent.get(url).then((apiResponse) => {
    console.log(apiResponse.body.items[0]);
    console.log(path);
    let book = apiResponse.body.items;
    let books = book.map(item => {
      return new Books(item);
    })
    response.render('pages/searches/show', { books: books });
  }).catch((err) => errorHandler(err, req, res));
})
app.use('*', (req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => { console.log(`Server is Running on PORT ${PORT}`) });

function Books(book) {
  this.title = book.title ;
  this.author = book.author;
  this.description = book.description;
  this.image =book.image;
}
function errorHandler(error, req, res) {
  res.status(500).send(error);
}