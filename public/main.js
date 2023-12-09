const validEditedUsername = (username) => {
    if (!username) return null;
    if (typeof username !== 'string') throw "username must be a string";
    if (username.trim().length === 0) throw "username must be a non-empty string";
    if (username.length < 5 || username.length > 15) throw "username must be between 5 and 15 characters";
    if (!/^[a-zA-Z0-9]+$/.test(username)) throw "username must be a valid string";
    return username;
  }
  
const validEditedPassword = (password) => {
    if (!password) return null;
    if (typeof password !== 'string') throw "Password must be a string";
    if (password.trim().length === 0) throw "Password must be a non-empty string";
    password = password.trim();
    if (password.length < 8) throw "Password must be between 8 and 20 characters";
    if (password.includes(" ")) throw "Password cannot contain spaces";
    if (!/[^a-zA-Z0-9]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) 
        throw "Password must contain at least one uppercase character, one number and one special character";
    return password;
  };

let editForm = document.getElementById("editForm");

if(editForm){
    editForm.addEventListener("submit", (event) => {
        event.preventDefault();
        try{
            let username = document.getElementById("username").value;
            let oldPassword = document.getElementById("oldPassword").value;
            let newPassword = document.getElementById("newPassword").value;
            let newLastfmUsername = document.getElementById("lastfmUsername").value;
            username = validEditedUsername(username);
            oldPassword = validEditedPassword(oldPassword);
            newPassword = validEditedPassword(newPassword);
            newLastfmUsername = validEditedUsername(newLastfmUsername);
            editForm.submit();
            //check if old password is the same as the one in the database

        }
        catch(e){
            console.log("Client side error");
        }
    })
}
