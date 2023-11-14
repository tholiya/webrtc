// Import the WebSocket library
import { WebSocketServer } from 'ws';
import users from '../models/users.js';
// Define a function named socketIO that takes a server object as a parameter.
export default async (expressServer) => {
    let userData = {};
    const websocketServer = new WebSocketServer({
        noServer: true,
        path: "/websockets",
    });

    expressServer.on("upgrade", (request, socket, head) => {
        websocketServer.handleUpgrade(request, socket, head, (websocket) => {
            websocketServer.emit("connection", websocket, request);
        });
    });

    websocketServer.on("connection", function connection(websocketConnection, connectionRequest) {
        console.log("websocket connected");
        websocketConnection.on("message", async (message) => {
            let data = JSON.parse(message);
            console.log(data);
            switch (data.type) {
                case "start":
                    userData[data.userId] = websocketConnection;
                    websocketConnection.name = data.userId;
                    break;

                case "participant-join":
                    {
                        let userOwner = await users.findOne({ meetingId: data.meetingId, type: 'owner' }).lean();
                        userData[userOwner._id.toString()].send(JSON.stringify({ type: 'participant-join' }))
                        break;
                    }
                case "offer":
                    {
                        let userParticipant = await users.findOne({ meetingId: data.meetingId, type: 'participant' }).lean();
                        userData[userParticipant._id.toString()].send(JSON.stringify({ type: 'offer', offer: data.offer }))
                        break;
                    }
                case "answer":
                    {
                        let userOwner = await users.findOne({ meetingId: data.meetingId, type: 'owner' }).lean();
                        userData[userOwner._id.toString()].send(JSON.stringify({ type: 'answer', answer: data.answer }))
                        break;
                    }
                case "candidate":
                    {
                        let user = await users.findOne({ meetingId: data.meetingId, _id: { $ne: data.userId } }).lean();
                        userData[user._id.toString()].send(JSON.stringify({ type: "candidate", candidate: data.candidate }))
                        break;
                    }
            }
        });
    });

    return websocketServer;
};
