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
  res.render('pages/searches/show');
  
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


app.get('/addNew', (req, res) => {
  res.render('pages/searches/new');
});
app.post('/searches', (req, res) => { 

  let SearchForm = req.body.SearchForm;
  let radioInput = req.body.radioInput;
  console.log(req.body.SearchForm);
  console.log(req.body.radioInput);
  const url = `https://www.googleapis.com/books/v1/volumes?q=${SearchForm}+in${radioInput}`;
   superagent.get(url)
   .then((apiResponse) => {
    // console.log(apiResponse.body);
    // console.log(apiResponse.body.items[0]);
    // console.log(path);
    
    // console.log("Hiiiiiii");
    let bookData = apiResponse.body.items;
    // console.log(bookData);
    let books = bookData.map(item => {
      return new Books(item);
      //  res.render('pages/searches/show', { bookTable: books });
    })
    console.log(books); 
    console.log('hello')
    res.render('pages/searches/show', { bookTable: books });
  }).catch((err) => errorHandler(err, req, res));
})
app.use('*', (req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => { console.log(`Server is Running on PORT ${PORT}`) });

function Books(data) {
  // this.title = (book.title)? ;
  // this.author = book.author;
  // this.description = book.description;
  // this.image =book.image;
  this.title = data.volumeInfo.title? data.volumeInfo.title: "No Title Available";
    this.imgUrl = (data.volumeInfo.imageLinks && data.volumeInfo.imageLinks.thumbnail) ? data.volumeInfo.imageLinks.thumbnail:"https://i.imgur.com/J5LVHEL.jpg";
    this.authors = data.volumeInfo.authors? data.volumeInfo.authors: "No Authors";
    this.desc = data.volumeInfo.description? data.volumeInfo.description:"No description available";
}
function errorHandler(error, req, res) {
  res.status(500).send(error);
}