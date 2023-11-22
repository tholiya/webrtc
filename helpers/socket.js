import {Server} from "socket.io";
import socketClient from "./socketEvent.js";
// Define a function named socketIO that takes a server object as a parameter.
export default function(server) {
	// Create a new instance of the Socket.io server and store it in the global context as io.
	global.io = new Server(server);
	// Initialize a Map named connectedSockets to keep track of connected sockets.
	global.connectedSockets = new Map();

	// Register an event handler for the "connection" event, which is triggered when a client connects to the WebSocket server.
	io.on("connection", (socket) => {
		// Within the "connection" event handler:

		// Retrieve the userId from the query parameters of the WebSocket handshake.
		const userId = socket.handshake.query.userId;
		if (userId) {
			// Check if the connectedSockets Map doesn't have an entry for the userId.
			connectedSockets.set(userId, socket.id);
		}
        socketClient(socket)

		// Log a message indicating that a WebSocket connection has been established.
		console.log("SocketIO Connected.");
	});
};
