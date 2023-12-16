// import routes
import userRoutes from './users.js';
import navigationRoutes from './navigation.js';
import postRoutes from './posts.js';
import searchRoutes from './search.js';

const constructorMethod = (app) => {
  //app.use routes
  app.use('/', navigationRoutes);
  app.use('/users', userRoutes);
  app.use('/posts', postRoutes);
  app.use('/search', searchRoutes);

  app.use('*', (req, res) => {
    res.status(404).json({error: 'Route Not Found'});
  });
}

export default constructorMethod;
