import express from "express";
import {Request, Response, NextFunction} from "express";
import { config } from "./config.js"; 

const app = express();
const PORT = 8080;

function middlewareLogResponses(req: Request, res: Response, next: NextFunction): void {
  res.on("finish", () => {
    const statusCode = res.statusCode;

    if (statusCode < 200 || statusCode >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });

  next();
}

app.use(middlewareLogResponses);

function middlewareMetricsInc(req: Request, res: Response, next: NextFunction): void {
  config.fileserverHits++;
  next();
}

app.use("/app", middlewareMetricsInc, express.static("./src/app"));


function handlerMetrics(req: Request, res: Response): void {
  res.set("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`
<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html>
  `);
}
app.get("/admin/metrics", handlerMetrics);

function handlerAdminReset(req: Request, res: Response): void {
  config.fileserverHits = 0;
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send("OK");
}
app.get("/admin/reset", handlerAdminReset);

function handlerReadiness(req: Request, res: Response): void {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send("OK");
}
app.get("/api/healthz", handlerReadiness);




app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
}); 