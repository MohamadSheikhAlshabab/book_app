'use strict';
require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 4000;
const cors = require('cors');
const pg = require('pg');
const superagent = require('superagent');
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error',(err)=>console.log(err));
client.connect().then(()=>{
  app.listen(PORT,()=>console.log('Running on port',PORT));
})
const app = express();
app.use(cors());
// app.use(express.static(__dirname + '/public'));

app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {

  res.render('./pages/index');
});
// app.get('/',(req,res)=>{
//     res.render('pages/index');
// });
app.get('/',getBooks);
app.get('/books/:id',getOneBook);

app.get('/searches/new', (req, res) => {
// <<<<<<< lab-11
  res.render('pages/searches/show');
// =======
//   res.render('./pages/searches/new');
// >>>>>>> master
  
});
app.get('/error', (req, res) => {
  throw new Error('./pages/error');
});
app.get('/show', (req, res) => {
  res.render('pages/searches/show');
});
app.get('/hello', (req, res) => {
  res.render('./pages/index');
});


// <<<<<<< lab-11
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
// =======
// app.get('/searches', (req, res) => {
//   res.render('./pages/searches/new');
// });
// app.post('/books',addBook);
// app.post('/searches', (req, res) => {

//   console.log(req.body); 
//     console.log(req.body.SearchForm);
//     console.log(req.body.radioInput);
//   let SearchForm = req.body.SearchForm;
//   let radioInput = req.body.radioInput;
//   const url = `https://www.googleapis.com/books/v1/volumes?SearchForm=${req.body.SearchForm}&radioInput${req.body.radioInput}&key=${BOOKS_API_KEY}`;
//   superagent.get(url).then((apiResponse) => {
//     console.log(apiResponse.body.items[0]);
//     console.log(path);
//     let book = apiResponse.body.items;
//     let books = book.map(item => {
// >>>>>>> master
      return new Books(item);
      //  res.render('pages/searches/show', { bookTable: books });
    })
// <<<<<<< lab-11
    console.log(books); 
    console.log('hello')
    res.render('pages/searches/show', { bookTable: books });
  }).catch((err) => errorHandler(err, req, res));
// =======
//     response.render('./pages/searches/show', { bookChoice: books });
//   }).catch((err) =>{ errorHandler(err, req, res)
//   console.log('here error handler from catch')});
// >>>>>>> master
})


function addBook (req, res){
  console.log("body",req.body);
  const {author,title,isbn,image_url,description,bookshelf}=req.body;
const SQL='INSERT INTO books(author,title,isbn,image_url,description,bookshelf)VALUES($1,$2,$3,$4,$5,$6);'
const values=[author,title,isbn,image_url,description,bookshelf];
client.query(SQL,values).then(results=>{
  res.redirect('/');
}).catch(err=>{
  errorHandler(err,req,res);
});
};

function Books(abook) {
  this.title = (abook.volumeInfo.title)?abook.volumeInfo.title:"can't find the Title "; 
  this.author = (abook.volumeInfo.author)?abook.volumeInfo.author:"can't find the Author ";
  this.description = (abook.volumeInfo.description)?abook.volumeInfo.description:" There is no a description";
  this.image =(abook.volumeInfo.imageLinks)?abook.volumeInfo.imageLinks.smallThumbnail:'https://images.vexels.com/media/users/3/157545/isolated/preview/057098b4a63e172134e0f04bbbcd6e8b-school-book-icon-by-vexels.png';
}

function getBooks(req,res){
  const SQL='SELECT * FROM books;'
  client.query(SQL).then((results)=>{
    res.render('/pages/index',{Book:results.rows});
  }).catch(err=>{
    errorHandler(err,req,res);
  })
}

function getOneBook(req,res){
  const SQL='SELECT * FROM books WHERE id=$1;'
  const vals=[req.params.id];
  client.query(SQL,vals).then((results)=>{
    res.render('/pages/books/detail',{oneBook:results.row[0]});
  }).catch(err=>{
    errorHandler(err,req,res);
  })

}



app.use('*',notFoundHandler);

app.listen(PORT, () => { console.log(`Server is Running on PORT ${PORT}`) });

// <<<<<<< lab-11
function Books(data) {
  // this.title = (book.title)? ;
  // this.author = book.author;
  // this.description = book.description;
  // this.image =book.image;
  this.title = data.volumeInfo.title? data.volumeInfo.title: "No Title Available";
    this.imgUrl = (data.volumeInfo.imageLinks && data.volumeInfo.imageLinks.thumbnail) ? data.volumeInfo.imageLinks.thumbnail:"https://i.imgur.com/J5LVHEL.jpg";
    this.authors = data.volumeInfo.authors? data.volumeInfo.authors: "No Authors";
    this.desc = data.volumeInfo.description? data.volumeInfo.description:"No description available";
// =======
// function errorHandler(err, req, res) {
//   res.status(500).render('./pages/error');
//   console.log('here error handler');
// }
// function notFoundHandler(req, res) {
//   res.status(404).send('Page Not Found !!!!!!!!');
// >>>>>>> master
}
