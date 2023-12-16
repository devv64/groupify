// Client side validation for login and signup forms

const validEmail = (email) => {
    if (email.split("@").length !== 2) throw "invalid email";; //throw "More than one @ in email";
    const [prefix, domain] = email.split("@");
    if (domain.split(".").length !== 2) throw "invalid email";; //throw "More than one . in email";
    const [d1, suffix] = domain.split(".");
    if (suffix.length < 2) throw "invalid email";; //throw "url is less than 2";
    const reg = /^[a-zA-Z0-9]+$/; const sym = /^[_.-]+$/;
    for (let i = 0; i < prefix.length; i++) {
      if (!reg.test(prefix[i])) {
        if (sym.test(prefix[i]) && i !== prefix.length-1 && i !== 0 &&
        (!sym.test(prefix[i-1])) && (!sym.test(prefix[i+1])) ) {
          continue; 
        } 
        else throw "invalid email";; //throw "Weird String character";
      }
    }
    for (const i of d1) {
      if (!reg.test(i)) {
        if (i ==='-' && (i !== prefix[prefix.length] || i !== prefix[0])) continue; 
        else throw "invalid email";; //throw "Weird String character";
      }
    }
    if (!reg.test(suffix)) throw "invalid email";; //throw "url suffix invalid";
    return email;
};

const validPassword = (password) => {
    if (password.length < 8) throw "Password must be between 8 and 20 characters";
    if (password.includes(" ")) throw "Password cannot contain spaces";
    if (!/[^a-zA-Z0-9]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw "Password must contain at least one uppercase character, one number and one special character";
    }
    return password;
};

const validName = (name) => {
    if (name.length < 2 || name.length > 25) throw "name must be between 2 and 25 characters";
    if (!/^[a-zA-Z0-9]+$/.test(name)) throw "name must be a valid string";
    return name;
};

let errid = document.getElementById('errid');   
let successid = document.getElementById('successid');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

if (registerForm) {
  registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      successid.textContent = "";
      errid.hidden = true;
      errid.textContent = "";
      const email = document.getElementById('regemailinput').value;
      const username = document.getElementById('regusernameinput').value;
      const password = document.getElementById('regpasswordinput').value;
      const confirmpassword = document.getElementById('regconfirmpasswordinput').value;
      
      try {
          let cleanEmail = validEmail(email);
          let cleanUsername = validName(username);
          let cleanPassword = validPassword(password);
          let cleanConfirmPass = validPassword(confirmpassword);
          if (cleanPassword !== cleanConfirmPass) throw "Passwords do not match";
          successid.textContent = "Loading...";
          registerForm.submit();
      } catch (error) {
          errid.hidden = false;
          errid.textContent = error;
          errid.innerHTML = error;
          errid.style.display = "block";
      }
  });
}

else if (loginForm) { 
  loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      successid.textContent = "";
      errid.hidden = true;
      const email = document.getElementById('liemailinput').value;
      const password = document.getElementById('lipasswordinput').value;
      
      try {
          let cleanEmail = validEmail(email);
          let cleanPassword = validPassword(password);
          successid.textContent = "Loading...";
          loginForm.submit();
      } catch (error) {
          errid.hidden = false;
          errid.textContent = error;
          errid.innerHTML = error;
          errid.style.display = "block";
      }
  });
}
else {
  console.log("No form found");
}