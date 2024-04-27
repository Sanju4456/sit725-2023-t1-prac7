const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const { addCards, connectToDatabase } = require("./database");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
// Middleware
app.use(express.static(path.join(__dirname, '')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.get('/', (req, res) => {
  // Serve the index.html file
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.post("/api/cards", async function(req, res) {
  try {
    // Add cards to the database
    await addCards(req.body.first_name, req.body.last_name, req.body.email, req.body.password);
    res.status(201).send("Data inserted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while inserting data");
  }
});

app.get('/api/formDetails', (req, res) => {
  // Return input data as JSON
  const inputData = {
    message: 'This is the input data you requested',
    data: req.query // Assuming input data is passed as query parameters
  };
  res.json(inputData);
});

// Listen for new connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Emit a random number every second to connected clients
  const interval = setInterval(() => {
    socket.emit('number', Math.floor(Math.random() * 100));
  }, 1000);

  // Listen for disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected');
    clearInterval(interval); // Stop emitting numbers when client disconnects
  });
});

// After adding the cat to the database successfully
io.on('connection', (socket) => {
  socket.on('catAdded', () => {
    console.log('Cat posted');
  });
});

// Start the server
server.listen(PORT, async() => {
  await connectToDatabase();
  console.log(`Server running on port ${PORT}`);
});

// Export the app instance (optional, but useful for testing)
module.exports = app;