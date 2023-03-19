import express from 'express'
import App from './services/ExpressApp'
import dbConnection from './services/Database'


const StartServer = async () => {
  
  const app = express()

  await dbConnection()

  await App(app);

  app.listen(8000, () => {
    console.log('Listening to port 8000');
  })
}

StartServer();













// import express from 'express';
// import bodyParser from 'body-parser';
// import mongoose, { ConnectOptions } from 'mongoose';
// import  path  from 'path';

// import {AdminRoute, VandorRoute} from './routes'
// import { MONGO_URI } from './config';

// const app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use('/images', express.static(path.join(__dirname, 'images')))

// app.use('/admin', AdminRoute) 
// app.use('/vandor', VandorRoute)

// mongoose
//   .connect(MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     autoIndex: true,
//   } as ConnectOptions)
//   .then((db) => {
//     console.log("Database Connected Successfuly.");
//   })
//   .catch((err) => {
//     console.log("Error Connectiong to the Database");
//   });

// app.listen(8000, () => {
//     console.log('App is running at 8000')
// })