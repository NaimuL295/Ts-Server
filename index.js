import "dotenv/config";
import express from "express";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "./schema.js";
const app = express();
const port = process.env.PORT || 4000;
;
app.use(express.json());
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);
pool.query("SELECT NOW()").then(() => {
}).
    catch((error) => {
    console.log(error, "op");
});
app.get("/", (req, res) => {
    res.send("server run");
});
app.get("/users", async (req, res) => {
    try {
        const result = await db.select().from(users);
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
    }
});
app.listen(port, () => {
    console.log("server run");
});
//# sourceMappingURL=index.js.map