import httpServer from "./src/http_server/Server";
import dotenv from "dotenv";
dotenv.config();

const PORT = parseInt(process.env.PORT? process.env.PORT: "3000");
httpServer.listen(PORT, () => {console.log(`Start static http server on the ${PORT} port!`);});



