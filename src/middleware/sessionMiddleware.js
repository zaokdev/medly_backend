import { RedisStore } from "connect-redis";
import session from "express-session";
import redisClient from "../db/redis.js";

export const sessionConfig = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || "12346drgkpmyohrnijhopk",
  resave: false,
  saveUninitialized: false,
  name: "pharmaflow_auth",
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  },
});
