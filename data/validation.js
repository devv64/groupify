//You can add and export any helper functions you want here. If you aren't using any, then you can just leave this file as is.
export const validString = (str) => {
    if (!str) throw "String must be provided";
    if (typeof str !== 'string') throw "String must be a string";
    str = str.trim();
    if (str.length === 0) throw "String must be a non-empty string";
    return str
}

export const validEmail = (email) => {
    if (!email) throw "Email must be provided";
    if (typeof email !== 'string') throw "Email must be a string";
    if (email.trim().length === 0) throw "Email must be a non-empty string";
    email = email.trim().toLowerCase();
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

export const validPassword = (password) => {
    if (!password) throw "Password must be provided";
    if (typeof password !== 'string') throw "Password must be a string";
    if (password.trim().length === 0) throw "Password must be a non-empty string";
    password = password.trim();
    if (password.length < 8) throw "Password must be between 8 and 20 characters";
    if (password.includes(" ")) throw "Password cannot contain spaces";
    if (!/[^a-zA-Z0-9]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) 
        throw "Password must contain at least one uppercase character, one number and one special character";
    return password;
};

export const validName = (name) => {
    if (!name) throw "name must be provided";
    if (typeof name !== 'string') throw "name must be a string";
    if (name.trim().length === 0) throw "name must be a non-empty string";
    name = name.trim().toLowerCase();
    if (name.length < 2 || name.length > 25) throw "name must be between 2 and 25 characters";
    if (!/^[a-zA-Z0-9]+$/.test(name)) throw "name must be a valid string";
    return name;
}

export const validUsername = (username) => {
    if (!username) throw "username must be provided";
    if (typeof username !== 'string') throw "username must be a string";
    if (username.trim().length === 0) throw "username must be a non-empty string";
    if (username.length < 5 || username.length > 15) throw "username must be between 5 and 15 characters";
    if (!/^[a-zA-Z0-9]+$/.test(username)) throw "username must be a valid string";
    return username;
}

export const validEditedUsername = (username) => {
  if (!username) return null;
  if (typeof username !== 'string') throw "username must be a string";
  if (username.trim().length === 0) throw "username must be a non-empty string";
  if (username.length < 5 || username.length > 15) throw "username must be between 5 and 15 characters";
  if (!/^[a-zA-Z0-9]+$/.test(username)) throw "username must be a valid string";
  return username;
}

export const validEditedPassword = (password) => {
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

export const validId = (id) => {
    //Validates id strings
    //Throws {status, errMsg}
    if (!id) throw {status:400, errMsg:"Error: You must provide an id to search for"};
    if (typeof id !== "string") throw {status:400, errMsg:"Error: id must be a string"};
    id = id.trim();
    if(id.length === 0) throw {status:400, errMsg:"Error: id cannot be an empty string or just spaces"};
    if (!ObjectId.isValid(id)) throw {status:400, errMsg:"Error: invalid object ID"};

    return id;
}