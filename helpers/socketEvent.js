global.meetingRooms = {};
global.meetings = {};
import users from '../models/users.js';
export default function (socket) {
    socket.on('login', function (user, room, displayName) {

        if (meetings[room] === undefined) {
            meetings[room] = {};
        }
        socket.emit("existingUser", meetings[room]);
        for (let to in meetings[room]) {
            if (to != user) {
                io.to(meetings[room][to]).emit('newUser', user);
            }
        }
        meetings[room][user] = socket.id;

        socket.on('offer', function (to, data) {
            if (meetings[room][to] !== undefined) {
                io.to(meetings[room][to]).emit('offer', user, data, displayName);
            }
        });

        socket.on('answer', function (to, data) {
            if (meetings[room][to] !== undefined) {
                io.to(meetings[room][to]).emit('answer', user, data, displayName);
            }
        });

        socket.on('ice', function (to, data) {
            if (meetings[room][to] !== undefined) {
                io.to(meetings[room][to]).emit('ice', user, data);
            }
        });

        socket.on("screenStop", function (by) {
            for (let to in meetings[room]) {
                if (to != user) {
                    io.to(meetings[room][to]).emit('screenStop', by);
                }
            }
        });
        socket.on('disconnect', async function () {
            for (let to in meetings[room]) {
                if (to != user) {
                    io.to(meetings[room][to]).emit('bye', user);
                }
            }
            await users.deleteOne({
                _id: user
            });
            delete meetings[room][user];
        });
        socket.on('timeout', async function () {
            for (let to in meetings[room]) {
                io.to(meetings[room][to]).emit('dis', user);
            }
        });
    });
};