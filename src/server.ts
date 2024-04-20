const http = require("http");
import app from "./app";
import mongocoonnect from "./services/DB/mongo";
const server = http.createServer(app);

async function startServer() {
  await mongocoonnect();
  server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
}
startServer();
