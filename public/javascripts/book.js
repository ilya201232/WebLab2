
const dialog = document.getElementById("userDataDialog");

function openDialog() {
    dialog.open = true;
    console.log("Opened dialog");
}

function closeDialog() {
    dialog.open = false;
    console.log("Closed dialog");
}