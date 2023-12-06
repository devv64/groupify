
let usernameForm = document.getElementById("usernameForm");
let passwordForm = document.getElementById("passwordForm");
let pictureForm = document.getElementById("pictureForm");

function showUsernameForm(){
    if(usernameForm.style.display === "none"){
        usernameForm.style.display = "block";
    }
    else{
        usernameForm.style.display = "none";
    }
}

function showPasswordForm(){
    if(passwordForm.style.display === "none"){
        passwordForm.style.display = "block";
    }
    else{
        passwordForm.style.display = "none";
    }
}

function showPictureForm(){
    if(pictureForm.style.display === "none"){
        pictureForm.style.display = "block";
    }
    else{
        pictureForm.style.display = "none";
    }
}