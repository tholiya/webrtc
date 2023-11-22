global.meetingRooms = {};
global.meetings = {};
export default function (socket) {
    socket.on('login', function (user, room, displayName) {
        console.log("login successfully ", displayName)

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
        console.log(meetings[room]);


        socket.on('offer', function (to, data) {
            console.log("offer send to ", to);
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














        // if (meetingRooms[room] === undefined) {
        //     meetingRooms[room] = {
        //         'userList': {},
        //         'mod': [user],
        //         'ban': [],
        //         'mute': []
        //     };
        //     // socket.emit('admin', user, 'mod'); //ToDo
        // }

        // socket.room = room;
        // socket.user = user;
        // socket.emit('userList', Object.keys(meetingRooms[room].userList));
        
        // for (var to in meetingRooms[room].userList) {
        //     io.to(meetingRooms[room].userList[to]).emit('hello', user, "", displayName);
        // }

        // meetingRooms[room].userList[user] = socket.id;

        // socket.on('ice', function (to, data) {
        //     if (meetingRooms[room].userList[to] !== undefined) {
        //         io.to(meetingRooms[room].userList[to]).emit('ice', user, data, displayName);
        //     }
        // });

        // socket.on('offer', function (to, data) {
        //     if (meetingRooms[room].userList[to] !== undefined) {
        //         io.to(meetingRooms[room].userList[to]).emit('offer', user, data, displayName);
        //     }
        // });

        // socket.on('answer', function (to, data, userDisplayName) {
        //     if (meetingRooms[room].userList[to] !== undefined) {
        //         io.to(meetingRooms[room].userList[to]).emit('answer', user, data, userDisplayName);
        //     }
        // });

    });
};