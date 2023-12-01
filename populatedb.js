#! /usr/bin/env node
const bcrypt = require("bcryptjs");

console.log("populate db");

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Post = require("./models/Post");
const User = require("./models/User");

const users = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
    try {
        console.log("Debug: About to connect");
        await mongoose.connect(mongoDB);
        console.log("Debug: Should be connected?");
        await createUsers();
        await createPosts();
        console.log("Debug: Closing mongoose");
        mongoose.connection.close();
      } catch (error) {
        console.error("Error in main:", error);
        process.exit(1); 
      }
}


async function userCreate(index, username, email, password, admin) {
    const hashedPassword = await bcrypt.hash(password, 10); // You can adjust the salt rounds (10 is a common value)
  try {
    const user = new User({ username, email, hashedPassword, admin });
    await user.save();
    users[index] = user;
    console.log(`Added user: ${user}`);
  } catch (error) {
    console.error("Error creating user:", error);
  }
}

async function postCreate(title, copy, author, date, tags, comments, likes, status) {
    try {
        const post = new Post({ title, copy, author, date, tags, comments, likes, status});
        await post.save();
        console.log(`Added post: ${post}`);
    } catch(error) {
        console.error("Error creating post:", error);
    }
}

//name, desc
async function createUsers() {
  console.log("Adding users");
  await Promise.all([
    userCreate(0, "mr admin", "admin@fake.com", "password!", true),
    userCreate(1, "timmy turnip", "timmy@turnip.com", "veg", false),
  ]);
}

async function createPosts() {
  console.log("Adding items");
  await Promise.all([
    postCreate(
        "test post",
        "lorem ipsum ..........",
        users[0]._id, 
        new Date(),
        ["tag1", "tag2"],
        [],
        [users[1]._id],
        "published"
      ),
      postCreate(
        "my first post",
        "Hello and welcome to my first blog post",
        users[1]._id, 
        new Date(),
        ["tag1", "tag3"],
        [],
        [users[0]._id],
        "published"
      ),
  ]);
}
