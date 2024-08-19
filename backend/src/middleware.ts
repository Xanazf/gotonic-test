import type { Express } from "express"
import cors, { type CorsOptions } from 'cors';
import bodyParser from 'body-parser';

export function jsonMiddleware(app: Express, route: string, corsOpts: CorsOptions) {
  return app.use(route, cors(corsOpts), bodyParser.json(), (req, res, next) => {
    console.log(route + " received");
    if (req.headers["content-type"]?.toLowerCase() === "application/json") next();
    else {
      console.log(route + " failed");
      res.sendStatus(400)
    }
  })
}

export function paramMiddleware(app: Express, route: string, corsOpts: CorsOptions) {
  return app.use("/api/requests/:id/received", cors(corsOpts), (req, res, next) => {
    console.log("receive request request received");
    console.log(req.params.id)
    if (req.params.id) next();
    else {
      console.log("receive request request failed");
      res.sendStatus(400)
    }
  })
}
