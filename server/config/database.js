const path = require('path');

module.exports = ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
    },
    useNullAsDefault: true,
  },
});

// const parse = require("pg-connection-string").parse;
// const { host, port, database, user, password } = parse(
//   process.env.DATABASE_URL
// );
// const host = '192.168.1.143';
// const database = 'postgres';
// const user = 'postgres';
// const password = 'Z0kESoAryLok';
// const port = 5432;

// module.exports = ({ env }) => ({
//   connection: {
//     client: 'postgres',
//     connection: {
//       host,
//       port,
//       database,
//       user,
//       password,
//     },
//     debug: false,
//   },
// });
