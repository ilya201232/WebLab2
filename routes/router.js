const fs = require('fs');
const express = require('express');
const router = express.Router();

let booksJSON = require('../public/json/library.json');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.redirect('/library');
});

function generateBooksArray(books) {
    let res = [];

    for (let i = 0; i < books.length; i++) {
        let overdue = false;

        if (!books[i].in_stock) {
            overdue = Date.now() > Date.parse(books[i].return_date);
        }


        let newObj = {
            index: (i + 1),
            name: books[i].name,
            author: books[i].author,
            release_year: books[i].release_year,
            in_stock: books[i].in_stock,
            is_overdue: overdue
        }

        res.push(newObj);
    }

    return res;
}

function filterBooksArray(books, availabilityFilter, overdueFilter) {

    let filtered = [];

    // Filtering for availability
    if (availabilityFilter !== "All") {
        let filter_value = availabilityFilter === "Yes";
        for (let i = 0; i < books.length; i++) {
            if (books[i].in_stock === filter_value) {
                // Filtering for overdue
                if (overdueFilter === "All") {
                    filtered.push(books[i]);
                } else if (filter_value && overdueFilter === "-") {
                    filtered.push(books[i]);
                } else if (!filter_value && overdueFilter === "Yes" && books[i].is_overdue) {
                    filtered.push(books[i]);
                } else if (!filter_value && overdueFilter === "No" && !books[i].is_overdue) {
                    filtered.push(books[i]);
                }
            }
        }
    } else {
        for (let i = 0; i < books.length; i++) {
            if (overdueFilter === "All") {
                filtered.push(books[i]);
            } else if (books[i].in_stock && overdueFilter === "-") {
                filtered.push(books[i]);
            } else if (!books[i].in_stock && overdueFilter === "Yes" && books[i].is_overdue) {
                filtered.push(books[i]);
            } else if (!books[i].in_stock && overdueFilter === "No" && !books[i].is_overdue) {
                filtered.push(books[i]);
            }
        }
    }

    return filtered;
}

function updateBooksJSON() {
    fs.writeFile('./public/json/library.json', JSON.stringify(booksJSON, null, 2), function writeJSON(err) {
        if (err) return console.log(err);
        console.log('Books Json has been updated!');
    });
}

router.post('/edit_reader_data', (req, res, next) => {

    if (!req.query.id || !req.query.was_available) {
        res.status(400);
        res.send('Wrong query data.');
        return next(new Error())
    }

    let id = parseInt(req.query.id) - 1;

    if (req.query.was_available === 'true') {
        booksJSON[id].in_stock = false;
        booksJSON[id].reader_name = req.body.reader_name;
        booksJSON[id].return_date = req.body.return_date;
    } else {
        booksJSON[id].in_stock = true;
        booksJSON[id].reader_name = "";
        booksJSON[id].return_date = "";
    }

    updateBooksJSON();
    res.redirect('/book/' + (id + 1));
})

router.post('/edit_book_data', (req, res, next) => {
    if (!req.query.id) {
        res.status(400);
        res.send('Wrong query data.');
        return next(new Error())
    }

    let id = parseInt(req.query.id) - 1;

    if (req.body.action === 'cancel') {

    } else if (req.body.action === 'save') {
        booksJSON[id].name = req.body.book_name;
        booksJSON[id].author = req.body.book_author;
        booksJSON[id].release_year = req.body.book_year;
    } else {
        res.status(400);
        res.send('Wrong post data.');
        return next(new Error())
    }

    updateBooksJSON();
    res.redirect('/library');
})

router.post('/add_book', (req, res) => {
    let fstream;

    console.log(req.busboy);

    let fieldsData = {};

    req.pipe(req.busboy);
    req.busboy.on('file', (fieldname, file, filename) => {
        console.log("Uploading: " + filename);
        fstream = fs.createWriteStream(__dirname + '/../public/images/books/tmp');
        file.pipe(fstream);
    });

    req.busboy.on('field', (fieldName, value) => {
        fieldsData[fieldName] = value;
        console.log(fieldName + ": " + value);
    });

    req.busboy.on('finish', () => {
        console.log("Upload Finished");
        let name = (fieldsData.book_name + fieldsData.book_author).replace(/[^a-zA-Z0-9]/g, '');

        fs.rename(__dirname + '/../public/images/books/tmp', __dirname + '/../public/images/books/' + name, (err) => {
            if ( err ) console.log('Img rename error: ' + err);
        })

        let newBook = {
            name: fieldsData.book_name,
            author: fieldsData.book_author,
            release_year: fieldsData.book_year,
            in_stock: true,
            reader_name: "",
            return_date: "",
            cover_file_name: name
        }

        booksJSON.push(newBook);

        updateBooksJSON();
        res.redirect('/library');
    })
})

router.post('/delete_book', (req, res) => {

    let bookCoverName = booksJSON[req.body.id - 1].cover_file_name;

    try {
        fs.unlinkSync(__dirname + "/../public/images/books/" + bookCoverName);
    } catch (err) {
        console.error(err);
    }

    booksJSON.splice(req.body.id - 1, 1);
    updateBooksJSON();

    res.redirect('/library');
})


router.get('/library', (req, res) => {
    let books = generateBooksArray(booksJSON);
    res.render('library', {books: books});
});

router.get('/book/:num', (req, res) => {
    let id = req.params.num;
    let book = booksJSON[id - 1];
    res.render('book',
        {
            book_id: id,
            book_name: book.name,
            book_author: book.author,
            book_year: book.release_year,
            is_book_available: book.in_stock,
            reader_name: book.reader_name,
            return_date: book.return_date,
            cover_name: book.cover_file_name,
        });
});

router.get('/filter_book', (req, res) => {
    if (req.query.availability && req.query.overdue) {
        let books = filterBooksArray(generateBooksArray(booksJSON), req.query.availability, req.query.overdue);

        res.end(JSON.stringify(books));
    } else {
        res.status(400);
        res.end("Wrong query formation.");
    }
});


module.exports = router;
