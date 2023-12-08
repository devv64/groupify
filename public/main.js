
let editForm = document.getElementById("editForm");
let editButton = document.getElementById("editProfile");
editForm.style.display = "none";

editButton.addEventListener("click", () => {
    if(editForm.style.display === "none"){
        editForm.style.display = "block";
    }
    else{
        editForm.style.display = "none";
    }
});