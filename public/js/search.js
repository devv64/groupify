const validsearch = (str) => {
    if (!str) throw "String must be provided";
    if (typeof str !== 'string') throw "String must be a string";
    str = str.trim();
    if (str.length === 0) throw "String must be a non-empty string";
    return str;
}

let errid = document.getElementById('error');   
let successid = document.getElementById('success');
errid.hidden = true;

const searchform = document.getElementById('searchquery');

if (searchform) { 
    searchform.addEventListener('submit', (event) => {
        event.preventDefault();
        error.fadeOut();

        successid.textContent = "";
        const search = document.getElementById('searchinput').value;
        
        try {
            if (search.length > 1000) throw 'Query too long';
            let cleansearch = validsearch(search);
            successid.textContent = "Loading...";
            searchform.submit();
        } catch (error) {
            errid.hidden = false;
            errid.textContent = error;
            errid.innerHTML = error;
            errid.style.display = "block";
        }
    });
}