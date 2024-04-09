const server = require('./src/server');
require('dotenv').config()

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`%s listening at http://localhost:${PORT}`); // eslint-disable-line no-console
});