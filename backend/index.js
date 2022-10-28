const express = require("express");
const { Deta } = require("deta");
const dotenv = require("dotenv");

const deta = Deta("myDetaKeyProject"); // configure your Deta project
const db = deta.Base("simpleDB"); // access your DB

// Define .env config
dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express(); // instantiate express

app.use(express.json()); // for parsing application/json bodies

// Creating users
app.post("/users", async (req, res) => {
	const { name, age, hometown } = req.body;
	const toCreate = { name, age, hometown };
	const insertedUser = await db.put(toCreate); // put() will autogenerate a key for us
	res.status(201).json(insertedUser);
});

// Reading records using id
app.get("/users/:id", async (req, res) => {
	const { id } = req.params;
	const user = await db.get(id);
	if (user) {
		res.json(user);
	} else {
		res.status(404).json({ message: "user not found" });
	}
});

// Search users by age
app.get("/search-by-age/:age", async (req, res) => {
	const { age } = req.params;
	const { items } = await db.fetch({ age: age });
	return items;
});

// Update records
app.put("/users/:id", async (req, res) => {
	const { id } = req.params;
	const { name, age, hometown } = req.body;
	const toPut = { key: id, name, age, hometown };
	const newItem = await db.put(toPut);
	return res.json(newItem);
});

// Delete an existing item
app.delete("/users/:id", async (req, res) => {
	const { id } = req.params;
	await db.delete(id);
	res.json({ message: "deleted" });
});

app.use("*", (req, res) => {
	res.status(400).json({ error: "Not route found" });
});

app.listen(PORT, () => {
	try {
		console.log(`Server running on port ${PORT}`);
	} catch (err) {
		console.log(err);
		process.exit();
	}
});
