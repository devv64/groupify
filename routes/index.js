// import routes
import userRoutes from './users.js';
import navigationRoutes from './navigation.js';
// import loginRoutes from './login.js';

const constructorMethod = (app) => {
  //app.use routes
  app.use('/', navigationRoutes);
  app.use('/users', userRoutes);
  // app.use('/login', loginRoutes);

  app.use('*', (req, res) => {
    res.status(404).json({error: 'Route Not Found'});
  });
}

export default constructorMethod;
