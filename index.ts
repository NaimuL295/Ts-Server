import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { log } from "console";
import { users } from "./schema.js";
import { eq } from "drizzle-orm";

const app = express();
const port = process.env.PORT || 4000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
});

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5174/",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
const db = drizzle(pool);
pool
  .query("SELECT NEW()")
  .then()
  .catch((error: any) => {
    console.log(error);
  });

app.get("/", async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(users);
    res.status(202).json({ Data: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "fail Data please call engineer " });
  }
});

app.get("/_user/:id", async (req: Request, res: Response) => {
  const userID = Number(req.params.id);
  if (isNaN(userID)) {
    return res.status(400).json({ message: "invalid user ID" });
  }
  try {
    const result = await db.select().from(users).where(eq(users.id, userID));
    if (result.length == 0) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).json({ message: "Data not found " });
  }
});
app.post("_create", async (req: Request, res: Response) => {
  const { name, email } = req.body;

  try {
    if (!name || !email) {
      return res.status(400).json({ message: " user Data not defined" });
    }
    const insert = await db.insert(users).values({ name, email }).returning();
    res.status(2002).json({ message: "user create", Data: insert[0] });
  } catch (error: any) {
    res.status(500).json({ message: "Data not found ", error });
  }
});

app.patch("_/update/:id", async (req: Request, res: Response) => {
  const { name, email } = req.body;
  const userID = Number(req.params.id);

  if (isNaN(userID)) {
    return res.status(400).json({ message: "invalid user" });
  }
  try {
    const update = await db
      .update(users)
      .set({ name: name, email: email })
      .where(eq(users.id, userID))
      .returning();
    res.status(200).json(update);
  } catch (error) {
    res.status(500).json({ message: "Data not found" });
  }
});

app.delete("/_delete/:id", async (req, res) => {
  const userID = Number(req.params.id);
  if (isNaN(userID))
    return res.status(500).json({ message: " invalid user Id" });
  try {
    const deleted = await db
      .delete(users)
      .where(eq(users.id, userID))
      .returning();
    if (deleted.length == 0)
      return res.status(404).json({ message: "Data not Found" });
    res.status(200).json({ message: "User Deleted " });
  } catch (error) {
    res.status(500).json({ message: "failed to delete user" });
  }
});
app.listen(port, () => {
  log("server run now ");
});
