const validpost = (str) => {
  if (!str) throw "String must be provided";
  if (typeof str !== 'string') throw "String must be a string";
  str = str.trim();
  if (str.length === 0) throw "String must be a non-empty string";
  if (str.length > 1000) throw "String must be less than 1000 characters";
  return str;
}

const validsongartist = (str) => {
  if (!str) return null;
  if (typeof str !== 'string') throw "String must be a string";
  str = str.trim();
  if (str.length > 50) throw "Song/Artist must be less than 50 characters";
  return str;
}


let errid = document.getElementById('error');   
let successid = document.getElementById('success');

const createPostForm = document.getElementById('create-post');

if(createPostForm){
  createPostForm.addEventListener('submit', (event) => {
      event.preventDefault();
      errid.hidden = true;

      successid.textContent = "";
      const body = document.getElementById('body').value;
      const track = document.getElementById('track').value;
      const artist = document.getElementById('artist').value;
      try {
        let cleanbody = validpost(body);
        let cleantrack = validsongartist(track)
        let cleanartist = validsongartist(artist);
        successid.textContent = "Loading...";
        createPostForm.submit();
      } catch (error) {
        errid.hidden = false;
        errid.textContent = error;
        errid.innerHTML = error;
        errid.style.display = "block";
      }
  });
}