const deleteForm = document.getElementById("deleteForm");
const overdueFilterDropdown = document.getElementById("overdue-dropdown-content");

const newBookDialog = document.getElementById("newBookDialog");
const availabilityFilterDropdown = document.getElementById("availability-dropdown-content");

const booksTBodyTable = document.getElementById("booksTbody");

let availabilityFilter = "All"
let overdueFilter = "All"

function applyFilters() {
    getBooksDataAJAX((response) => {
        let books = JSON.parse(response);

        console.log(books);

        setBookDataToTable(books);
    });
}

function getBooksDataAJAX(callback) {
    let xmlHttp = new XMLHttpRequest();

    xmlHttp.onload = function() {
        if (xmlHttp.status !== 200) {
            console.error(`Error ${xmlHttp.status}: ${xmlHttp.statusText}`);
        } else {
            callback(xmlHttp.response);
        }
    };

    xmlHttp.onerror = function() {
        console.error(`Connection Error`);
    };

    xmlHttp.onprogress = function(event) {
        if (event.lengthComputable) {
            console.log(`Loaded ${event.loaded} of ${event.total} bytes`);
        } else {
            console.log(`Loaded ${event.loaded} bytes`);
        }
    };

    xmlHttp.open("GET", "/filter_book?availability=" + availabilityFilter + "&overdue=" + overdueFilter);
    xmlHttp.send();
}



function setBookDataToTable(books) {
    booksTBodyTable.innerHTML = "";

    for (let i = 0; i < books.length; i++) {
        createRow(i + 1, books[i].index, books[i].name, books[i].author, books[i].release_year,
            books[i].in_stock, books[i].is_overdue);
    }
}

function createRow(tableId, realId, name, author, year, available, overdue) {
    let row = booksTBodyTable.insertRow(tableId - 1);

    let idCell = row.insertCell(0);
    idCell.innerHTML = tableId;

    let nameCell = row.insertCell(1);
    nameCell.innerHTML = name;

    let authorCell = row.insertCell(2);
    authorCell.innerHTML = author;

    let yearCell = row.insertCell(3);
    yearCell.innerHTML = year;

    let availableCell = row.insertCell(4);
    availableCell.innerHTML = available ? "Yes" : "No";

    let overdueCell = row.insertCell(5);
    overdueCell.innerHTML = available ? "-" : (overdue ? "Yes" : "No");

    let btnsCell = row.insertCell(6);


    let btnsSpan = document.createElement('span');
    btnsSpan.setAttribute('class', 'table-btns');

    let eyeBtn = document.createElement('a');
    eyeBtn.setAttribute('class', 'table_btn eye_btn');
    eyeBtn.setAttribute('href', 'book/' + realId);

    let eyeImg = document.createElement('img');
    eyeImg.setAttribute('src', '/images/eye.svg');
    eyeBtn.appendChild(eyeImg);

    btnsSpan.appendChild(eyeBtn);


    let deleteBtn = document.createElement('button');
    deleteBtn.setAttribute('class', 'table_btn eye_btn');
    deleteBtn.setAttribute('id', 'delete_btn' + realId);
    deleteBtn.setAttribute('onclick', 'openDeleteDialog(this.id)');

    let deleteImg = document.createElement('img');
    deleteImg.setAttribute('src', '/images/trash_bin.svg');
    deleteBtn.appendChild(deleteImg);

    btnsSpan.appendChild(deleteBtn);


    btnsCell.appendChild(btnsSpan);
}


function showAvailabilityFilter() {
    availabilityFilterDropdown.classList.add('visible');
}

function applyAvailabilityFilter(chosenFilter) {
    availabilityFilter = chosenFilter;
    hideAvailabilityFilter();

    applyFilters();
}

function hideAvailabilityFilter() {
    availabilityFilterDropdown.classList.remove('visible');
}

function showOverdueFilter() {
    overdueFilterDropdown.classList.add('visible');
}

function applyOverdueFilter(chosenFilter) {
    overdueFilter = chosenFilter;
    hideOverdueFilter();

    applyFilters();
}

function hideOverdueFilter() {
    overdueFilterDropdown.classList.remove('visible');
}

function moveToBookPage(bookIndex) {
    console.log("Opening " + bookIndex + " book page");
}

let delete_id;

function openDeleteDialog(book_id) {
    deleteDialog.open = true;
    delete_id = book_id.slice(10, 10000);
}

function closeDeleteDialog() {
    deleteDialog.open = false;
    delete_id = -1;
    console.log("Closed dialog");
}

function saveData() {
    // Some save logic here...
    // closeDeleteDialog();
    deleteForm.innerHTML = '<input name="id" value="' + delete_id + '">';
    console.log("Saving?");
    deleteForm.submit();
}

function openNewBookDialog() {
    newBookDialog.open = true;
    console.log("Opened dialog");
}

function closeNewBookDialog() {
    newBookDialog.open = false;
    console.log("Closed dialog");
}