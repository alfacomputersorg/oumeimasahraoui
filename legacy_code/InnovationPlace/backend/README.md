# Backend source code

##Commands to run

```
// install dependencies
npm install -g yarn
yarn install
yarn global add nodemon

// seed the database
node ./seed_database.js

// start the server by
nodemon app.js
```

// Delete the database
```
mongo
use innovation-place;
db.dropDatabase();
exit
```

##Admin section
http://localhost:4200/admin
email: admin@email.com
password: password
