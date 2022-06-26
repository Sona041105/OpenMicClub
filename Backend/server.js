require('dotenv').config();
const express = require('express');
const app = express();
const DbConnect = require('./database');
const router = require('./routes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const ACTIONS = require('./actions');
const server = require('http').createServer(app);


//web socket server set
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

app.use(cookieParser());

const corsOption = {
    credentials: true,
    origin: ['http://localhost:3000'],
};
app.use(cors(corsOption));
app.use('/storage', express.static('storage'));

const PORT = process.env.PORT || 5500;
DbConnect();

app.use(express.json({ limit: '8mb' }));
app.use(router);


const path = require("path");

// Step 1:
if(process.env.NODE_ENV=="production"){
app.use(express.static(path.resolve(__dirname, "./frontend/build")));
app.use(express.static(path.resolve(__dirname, "./storage")));
// Step 2:
app.get("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "./frontend/build", "index.html"));
});

}

app.get('/', (req, res) => {
    res.send('Hello from express Js');
});



// Sockets mapping , track rakhni h for kaun si socket id kis user se connected
const socketUserMapping = {};

io.on('connection', (socket) => {
    console.log('new connection', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, user }) => {
        socketUserMapping[socket.id] = user;
        // new Map jitne bhi clients room ke andr h unko get krna h
        //here what we are doing we are writting code for we are getting that room from 
        //all rooms which id is roomId if it is not present give empty array ,jo milta h vo  map hota h use convert krna hoga aaray me
          // console.log('Map', socketUserMap);
        // get all the clients from io adapter
        // console.log('joining');
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        console.log('All connected clients', clients);
        // Add peers and offers and all
        //get every clients who are joined this room , --clientID-socket Id of clients
        //har clients ko ek event emit karenge ki mujhe add karo , peer to peer connection k liye karna h
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.ADD_PEER, {
                peerId: socket.id,
                createOffer: false,
                user,
            });
            
             // Send myself as well that much msgs how many clients
            //khud ko bhi event emit krna h
            socket.emit(ACTIONS.ADD_PEER, {
                peerId: clientId,
                createOffer: true,
                user: socketUserMapping[clientId],
            });
        });


        //finally join the room, if room of roomID will not exist to create hoga ek room aur aap join kr loge
        socket.join(roomId);


        //ye event hum server se emit kr re h apne client pe ,to client pr listen krna h ,Now handle ADD_PEER emit on frontend, waha offer create karni hogi, uski stream connect krni hogi
    });



    // Handle relay Ice
    socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
            peerId: socket.id,
            icecandidate,
        });
    });



    // Handle relay sdp ( session description )
    socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
        io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerId: socket.id,
            sessionDescription,
        });
    });

    //handle mute/unmute
    socket.on(ACTIONS.MUTE, ({ roomId, userId }) => {
        console.log('mute on server', userId);
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.MUTE, {
                peerId: socket.id,
                userId,
            });
        });
    });

    socket.on(ACTIONS.UNMUTE, ({ roomId, userId }) => {
        console.log('unmute on server', userId);
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.UNMUTE, {
                peerId: socket.id,
                userId,
            });
        });
    });




    // Leaving the room

    const leaveRoom = ({ roomId }) => {
        const { rooms } = socket;//rooms map h

        Array.from(rooms).forEach((roomId) => {
            const clients = Array.from(
                io.sockets.adapter.rooms.get(roomId) || []
            );

            // in clients ko bol ra mujhe nikal do
            clients.forEach((clientId) => {
                io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                    peerId: socket.id,
                    userId: socketUserMapping[socket.id]?.id,
                });

                //utne baar mujhe khudko trigger krna h ki mai in cliets ko apne clients se nikalu
                socket.emit(ACTIONS.REMOVE_PEER, {
                    peerId: clientId,
                    userId: socketUserMapping[clientId]?.id,
                });
            });

            socket.leave(roomId);
        });

        delete socketUserMapping[socket.id];

        console.log('map', socketUserMapping);
    };


    socket.on(ACTIONS.LEAVE, leaveRoom);
    socket.on('disconnecting', leaveRoom);
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));