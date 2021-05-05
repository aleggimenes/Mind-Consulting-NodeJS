const express = require('express');
const cors = require('cors');
const app = express();
const port = 3005;
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log('Acessou o Middleware!');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});
app.use(express.urlencoded({ extended: false }));
require('./controllers/authController')(app);
require('./controllers/userController')(app);

app.listen(port, function () {
  console.log(`BACKEND is running on port ${port}.`);
});
