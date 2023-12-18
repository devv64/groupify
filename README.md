# harmoniq 🎵

*Make sure to have NodeJS installed*

**✨Here are the steps✨**
### Create a .env file:

1. Obtain an API key from [Last.fm](https://www.last.fm/api/account/create).
2. In the root directory of the project, create a file named `.env`.
3. Add the following lines to the `.env` file:
    ```
    LAST_FM_API_KEY=YOUR_API_KEY_HERE
    LAST_FM_SHARED_SECRET=YOUR_SHARED_SECRET_HERE
    ```
    Replace `YOUR_API_KEY_HERE` and `YOUR_SHARED_SECRET_HERE` with the obtained keys from Last.fm. 

### Installation and Setup:

- Install dependencies: `npm i`
- Seed the database: `npm run seed`
- Start the server: `npm start`
