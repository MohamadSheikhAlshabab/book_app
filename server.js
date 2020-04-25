'use strict';
require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 4000;
const cors = require('cors');
const pg = require('pg');
const superagent = require('superagent');
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', (err) => console.log(err));

app.use(cors());
// app.use(express.static(__dirname + '/public'));

app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));
app.use(express.json());
app.set('view engine', 'ejs');
// app.get('/', (req, res) => {
//   console.log('0000000000000');
//   res.render('./pages/index');
// });

app.get('/', getBooks);

function getBooks(req, res) {
  const SQL = 'SELECT * FROM books;'
  client.query(SQL).then((results) => {
    res.render('./pages/index', { book: results.rows });
  }).catch(err => {
    errorHandler(err, req, res);
  })
}

app.get('/hello', (req, res) => {
  res.render('./pages/index');
});

app.get('/searches/new', newSearch);

function newSearch(req, res) {
  res.render('./pages/searches/new');
}
app.post('/searches', (request, response) => {
  const inputt = request.body.search;
  const radio = request.body.radio;
  let url = `https://www.googleapis.com/books/v1/volumes?q=${inputt}+in${radio}:${inputt}`;
  superagent.get(url)
    .then(bookData => {
      let dataArray = bookData.body.items.map(value => {
        return new Books(value);
      })
      response.render('./pages/searches/show', { book: dataArray });
    })
    .catch((error) => {
      errorHandler(error, request, response);
    });
})


app.get('/books/:id', getOneBook);

function getOneBook(req, res) {
  const SQL = 'SELECT * FROM books WHERE id=$1;'
  const vals = [req.params.id];
  return client.query(SQL, vals).then((results) => {
    res.render('./pages/books/show', { book: results.row[0] });
  }).catch(err => {
    errorHandler(err, req, res);
  })

}


app.get('/error', errorHandler);

function errorHandler(err, req, res) {
  console.log('here error handler');
  res.status(500).render('./pages/error');
}

app.get('/addShow', (req, res) => {
  console.log('3333333333333333333333');
  res.render('./pages/searches/show');
});



app.get('/addNew', (req, res) => {
  console.log('6666666666666666666666');
  res.render('./pages/searches/new');
});


app.post('/books', addBook);

function addBook(req, res) {
  let ln;
  const { author, title, isbn, image_url, description, bookshelf } = req.body;
  const SQL = 'INSERT INTO books(author,title,isbn,image_url,description,bookshelf)VALUES($1,$2,$3,$4,$5,$6);';
  const values = [author, title, isbn, image_url, description, bookshelf];
  client.query(SQL, values).then(results => {
    ln = results.rows.length;
  })
  return client.query(SQL, values)
    .then(() => {
      res.redirect(`/books/${ln + 1}`);
    }).catch(err => {
      errorHandler(err, req, res);
    });

}

function Books(data) {
  this.title = data.volumeInfo.title ? data.volumeInfo.title : "No Title Available";
  this.image_url = (data.volumeInfo.imageLinks && data.volumeInfo.imageLinks.thumbnail) ? data.volumeInfo.imageLinks.thumbnail : "https://i.imgur.com/J5LVHEL.jpg";
  this.author = data.volumeInfo.author ? data.volumeInfo.author : "No Authors";
  this.description = data.volumeInfo.description ? data.volumeInfo.description : "No description available";
  this.isbn = data.volumeInfo.industryIdentifiers[0].type + data.volumeInfo.industryIdentifiers[0].identifier ? data.volumeInfo.industryIdentifiers[0].type + data.volumeInfo.industryIdentifiers[0].identifier : '000000';
}

app.use('*', notFoundHandler);

function notFoundHandler(req, res) {
  res.status(404).send('Page Not Found !!!!!!!!');
}

// app.listen(PORT, () => { console.log(`Server is Running on PORT ${PORT}`) });
client.connect().then(() => {
  app.listen(PORT, () => console.log('Running on port', PORT));
})