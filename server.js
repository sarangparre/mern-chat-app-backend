const express = require("express");
const cors = require("cors");
const { chats } = require("./data/data");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const path = require("path");
const { notFound, errorHnadler } = require("./middlewares/errorMiddleware");

dotenv.config();

connectDB();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/chats", (req, res) => {
  res.send(chats);
});

app.get("/", (req, res) => {
  res.send("API is running..");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);



//----------------------Deployment------------------------------------

// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/frontend/build")));

//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
//   );
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running..");
//   });
// }

//----------------------Deployment End------------------------------------



app.use(notFound);
app.use(errorHnadler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

const io = require("socket.io")(server, {
  pingTimout: 60000,
  cors: {
    origin: process.env.BASE_URL
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    console.log(userData._id);
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room " + room);
  });

  socket.on("new message", (msg) => {
    var chat = msg.chat;
    if (!chat.users) return console.log("chat.users is not defined");
    chat.users.forEach((user) => {
      if (user._id == msg.sender._id) return;
      socket.in(user._id).emit("message recieved", msg);
    });
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.off("setup", () => {
    console.log("User disconnected");
    socket.leave(userData._id);
  });
});
