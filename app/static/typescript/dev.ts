

const out = document.getElementById('storageOut');

function outputStorage() {
    
    console.log("abc")
    var content = localStorage.getItem('sold: ');

    out.innerHTML = content;

}