// import routes
import userRoutes from './users.js';

const constructorMethod = (app) => {
  //app.use routes
  app.use('/users', userRoutes);

  app.use('*', (req, res) => {
    console.log('helloooo');
    res.status(404).json({error: 'Route Not Found'});
  });
}

export default constructorMethod;
