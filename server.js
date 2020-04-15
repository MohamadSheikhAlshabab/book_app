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
  console.log('0000000000000');
  res.render('./pages/index');
});

app.get('/',getBooks);
app.get('/books/:id',getOneBook);

app.get('/searches/new', (req, res) => {
  console.log('111111111111111111');
  res.render('./pages/searches/show');
  
});
app.get('/error', errorHandler);

app.get('/addShow', (req, res) => {
  console.log('3333333333333333333333');
  res.render('./pages/searches/show');
});
app.get('/hello', (req, res) => {
  console.log('44444444444444444444444444');
  res.render('./pages/index');
});


app.get('/addNew', (req, res) => {
  console.log('6666666666666666666666');
  res.render('./pages/searches/new');
});
app.post('/books',addBook);
app.post('/searches', (req, res) => {

  console.log(req.body); 
    console.log(req.body.SearchForm);
    console.log(req.body.radioInput);
  let SearchForm = req.body.SearchForm;
  let radioInput = req.body.radioInput;
  // const url = `https://www.googleapis.com/books/v1/volumes?SearchForm=${req.body.SearchForm}&radioInput${req.body.radioInput}&key=${BOOKS_API_KEY}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${SearchForm}+in${radioInput}`;
  superagent.get(url).then((apiResponse) => {
    //x
    let bookData = apiResponse.body.items;
    let bookks = bookData.map(itemes => {
      return new Books(itemes);
    })
    console.log(bookks); 
    console.log('hello')
    res.render('./pages/searches/show', { abookTable: bookks });
  })
  .catch((err) =>{ errorHandler(err, req, res)});
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

function Books(data) {
  this.title = data.volumeInfo.title? data.volumeInfo.title: "No Title Available";
    this.imgUrl = (data.volumeInfo.imageLinks && data.volumeInfo.imageLinks.thumbnail) ? data.volumeInfo.imageLinks.thumbnail:"https://i.imgur.com/J5LVHEL.jpg";
    this.authors = data.volumeInfo.authors? data.volumeInfo.authors: "No Authors";
    this.desc = data.volumeInfo.description? data.volumeInfo.description:"No description available";
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
    res.render('../pages/books/detail',{oneBook:results.row[0]});
  }).catch(err=>{
    errorHandler(err,req,res);
  })

}



app.use('*',notFoundHandler);

app.listen(PORT, () => { console.log(`Server is Running on PORT ${PORT}`) });

function errorHandler(err, req, res) {
  console.log('here error handler');
  res.status(500).render('./pages/error');
}
function notFoundHandler(req, res) {
  res.status(404).send('Page Not Found !!!!!!!!');
}
