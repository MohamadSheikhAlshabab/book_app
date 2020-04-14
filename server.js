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
  res.render('./pages/searches/new');
  
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


app.get('/searches', (req, res) => {
  res.render('./pages/searches/new');
});
app.post('/books',addBook);
app.post('/searches', (req, res) => {

  console.log(req.body); 
    console.log(req.body.SearchForm);
    console.log(req.body.radioInput);
  let SearchForm = req.body.SearchForm;
  let radioInput = req.body.radioInput;
  const url = `https://www.googleapis.com/books/v1/volumes?SearchForm=${req.body.SearchForm}&radioInput${req.body.radioInput}&key=${BOOKS_API_KEY}`;
  superagent.get(url).then((apiResponse) => {
    console.log(apiResponse.body.items[0]);
    console.log(path);
    let book = apiResponse.body.items;
    let books = book.map(item => {
      return new Books(item);
    })
    response.render('./pages/searches/show', { bookChoice: books });
  }).catch((err) =>{ errorHandler(err, req, res)
  console.log('here error handler from catch')});
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

function errorHandler(err, req, res) {
  res.status(500).render('./pages/error');
  console.log('here error handler');
}
function notFoundHandler(req, res) {
  res.status(404).send('Page Not Found !!!!!!!!');
}
