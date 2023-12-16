const error = document.getElementById('errid');
const success = document.getElementById('success');

const createPostForm = document.getElementById('create-post');

if (!createPostForm) console.log("create post form not found");

createPostForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // const body = document.getElementById('post-body')?.value;
    // console.log(body);
    try {
      // ? do I have to validate post-body client side
      // success.hidden = false;
      // console.log("post body validated");
      // success.textContent = "Loading...";
      // console.log(success);
      // success.style.display = "block";
      // console.log("submitting create post form");
      createPostForm.submit();
    } catch (error) {
      error.hidden = false;
      error.textContent = error;
      error.innerHTML = error;
      error.style.display = "block";
    }
});