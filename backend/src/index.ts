import "dotenv/config"
import express from "express"
import cors, { type CorsOptions } from 'cors';
import bodyParser from 'body-parser';
import { sequelize } from './db_connect.ts';
import { UserController } from "./io/UserController.ts";
import { RequestController } from "./io/RequestController.ts";
import { verifyJWT, decrypt, encrypt, check } from "./utils/cryptography.ts";

const app = express()

const devMode = process.env.NODE_ENV === 'development'
const backPort = process.env.BACKEND_PORT || 5000
const frontPort = process.env.FRONTEND_PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET
const whitelist = [`http://localhost:${frontPort}`, ""]

console.log("DEV MODE: " + devMode)

// cors
const corsOptions: CorsOptions = devMode ? { origin: "*" } : {
  origin: ((origin, callback) => {
    if (origin && whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  })
}

// DB Connect
sequelize
  .authenticate()
  .then(() => {
    console.log('Database online.');
  })
  .catch(() => {
    console.log('Database failed to connect.');
  })

// API Routes
app.get("/api", (req, res) => {
  res.send("Is someone there?.. Must have been the wind.")
})

// -- /create/order
app.use("/api/create/order", cors(corsOptions), bodyParser.json(), (req, res, next) => {
  console.log("create order request received");
  console.log(req.body);
  if (req.headers["content-type"]?.toLowerCase() === "application/json") next();
  else {
    console.log("create order request failed");
    res.sendStatus(400);
  }
})
app.post("/api/create/order", (req, res) => {
  console.log("create order request started");
})

// -- /create/deliver
app.use("/api/create/deliver", cors(corsOptions), bodyParser.json(), (req, res, next) => {
  console.log("create deliver request received");
  if (req.headers["content-type"]?.toLowerCase() === "application/json") next();
  else {
    console.log("create deliver request failed");
    res.sendStatus(400);
  }
})
app.post("/api/create", (req, res) => {
  console.log("create deliver request started");
})

// -- /requests
app.use("/api/requests", cors(corsOptions), bodyParser.json(), (req, res, next) => {
  console.log("show requests request received");
  if (req.headers["content-type"]?.toLowerCase() === "application/json") next();
  else {
    console.log("show requests request failed");
    res.sendStatus(400);
  }
})
app.post("/api/requests", async (req, res) => {
  console.log("show requests request started");
  const { userId } = req.body
  const decodedUserId = await verifyJWT(userId, JWT_SECRET!);
  const userController = new UserController(decodedUserId.payload as string);
  const userRequests = await userController.getRequests();
  res.send(userRequests).status(200)
})

// -- /requests/create
app.use("/api/requests/create", cors(corsOptions), bodyParser.json(), (req, res, next) => {
  console.log("create request request received");
  if (req.headers["content-type"]?.toLowerCase() === "application/json") next();
  else {
    console.log("create request request failed");
    res.sendStatus(400)
  }
})
app.post("/api/requests/create", async (req, res) => {
  console.log("create request request started");
  const requestController = new RequestController();
  const userController = new UserController();
  const { userId, type, parcel, route, description, date } = req.body;
  if (!userId) return res.sendStatus(400);
  const userIdDecoded = await verifyJWT(userId, JWT_SECRET!);
  requestController.create(type, parcel, route, description, userIdDecoded.payload as string, date).then(async result => {
    if (result !== 400) {
      console.log("USERS", await userController.showAll())
      const user = await userController.show(userIdDecoded.payload as string);
      console.log("USER: ", user)
      const requestIds = type === "order" ? user!.orderIds : user!.deliveryIds;
      requestIds.push(result)
      user!.update(type === "order" ? "orderIds" : "deliveryIds", requestIds)
      console.log("request created")
      res.send(`${type} with id ${result} created`).status(200)
    } else {
      res.sendStatus(400)
    }
  })
})

// -- /requests/:id
app.use("/api/requests/:id", cors(corsOptions), bodyParser.json(), (req, res, next) => {
  console.log("create change request received");
  console.log(req.params.id)
  if (req.headers["content-type"]?.toLowerCase() === "application/json" && req.params.id) next();
  else {
    console.log("create change request failed");
    res.sendStatus(400)
  }
})
app.post("/api/requests/:id", async (req, res) => {
  console.log("create change request started");
  const requestController = new RequestController();
  const changedRequest = await requestController.change(req.params.id, req.body.status || null, req.body.description || null)
  if (changedRequest) {
    console.log("change request successful")
    res.send("request change staged").status(200)
  } else {
    res.sendStatus(400)
  }
})
// -- /requests/:id/received
app.use("/api/requests/:id/received", cors(corsOptions), bodyParser.json(), (req, res, next) => {
  console.log("receive request request received");
  console.log(req.params.id)
  if (req.params.id) next();
  else {
    console.log("receive request request failed");
    res.sendStatus(400)
  }
})
app.put("/api/requests/:id/received", (req, res) => {
  console.log("receive request request started");
  const requestController = new RequestController(req.params.id);
  requestController.show().then(async result => {
    if (result !== 400) {
      await requestController.change(req.params.id, "received")
      console.log(await requestController.show())
      res.send("change staged").status(200)
    }
    else res.sendStatus(400)
  })
})
// -- /requests/:id/cancel
app.use("/api/requests/:id/cancel", cors(corsOptions), bodyParser.json(), (req, res, next) => {
  console.log("cancel request request received");
  console.log(req.params.id)
  if (req.params.id) next();
  else {
    console.log("cancel request request failed");
    res.sendStatus(400)
  }
})
app.put("/api/requests/:id/cancel", (req, res) => {
  console.log("cancel request request started");
  const requestController = new RequestController(req.params.id);
  requestController.show().then(result => {
    if (result !== 400) {
      requestController.change(req.params.id, "cancelled")
      res.send("change staged").status(200)
    }
    else res.sendStatus(400)
  })
})

// -- /signin
app.use("/api/signin", cors(corsOptions), bodyParser.json(), (req, res, next) => {
  console.log("signin request received");
  if (req.headers["content-type"]?.toLowerCase() === "application/json") next();
  else {
    console.log("signin request failed");
    res.sendStatus(400);
  }
})
app.post("/api/signin", (req, res) => {
  console.log("signin request started");
  const { email, token } = req.body;
  const userController = new UserController();
  userController.showByEmail(email).then(async result => {
    if (result === 400) {
      res.sendStatus(result)
      return;
    }
    const password = await verifyJWT(token, JWT_SECRET!)

    const isCorrect = await check(password.payload as string, result.password)
    if (isCorrect) {
      const generatedToken = await userController.getToken(result.id)
      res.send(generatedToken)
    } else res.sendStatus(400)
  })
})

// -- /signup
app.use("/api/signup", cors(corsOptions), bodyParser.json(), (req, res, next) => {
  console.log("signup request received");
  if (req.headers["content-type"]?.toLowerCase() === "application/json") next();
  else {
    console.log("signup request failed");
    res.sendStatus(400);
  }
})
app.post("/api/signup", async (req, res) => {
  console.log("signup request started");
  const userController = new UserController();
  const { name, email, location, locale, password } = req.body;
  await userController.create(name, email, location, locale, password).then(result => {
    console.log(result)
    res.appendHeader("content-type", "application/json")
    result !== 400 ? res.send({ token: result }) : res.sendStatus(400)
  })
})

// DB Sync
sequelize
  .sync({ force: false })
  .then(() => {
    console.log('Database synced.');
  })
  .catch(() => {
    console.log('Database failed to sync.');
  })

// Flush the database (for testing purposes)
app.get('/api/flush', cors(corsOptions), (req, res) => {
  // Drop all tables in the database
  sequelize
    .drop({ cascade: true })
    .then(() => {
      console.log('All tables dropped successfully');
      res.send('database flushed');
    })
    .catch(error => {
      console.error('Error dropping tables:', error);
      res.send('error flushing database');
    });
});

// API Start
app.listen(backPort, () => {
  console.log(`App listening on port ${backPort}`)
})
