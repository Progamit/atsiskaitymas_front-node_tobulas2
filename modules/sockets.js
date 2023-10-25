const { Server } = require('socket.io');
const jwt = require("jsonwebtoken");
const playerDb = require("../schemas/playerSchema");
const { getUserForSocket, login} = require('../controllers/mainController');

module.exports = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
        },
    });
    let userData2 = [];
    let rooms = [];

    io.on('connect', (socket) => {
        socket.on('token', async (val) => {
            const data = jwt.verify(val, process.env.JWT_SECRET);
            socket.userData = data;
            let singleUser = await playerDb.findOne({ _id: data._id }, { password: 0 });
            let singleUserNew = {
                username: singleUser.username,
                weapon: singleUser.weapon,
                armour: singleUser.armour,
                potion: singleUser.potion,
                avatar: singleUser.avatar,
                id: singleUser._id,
                socket: socket.id,
                turn: false,
                hp: 100,
                win: false,
                potionUse: false,
                gold: 0,
            }
            userData2.push(singleUserNew);
            socket.userData = singleUserNew;  // <-- Important change here
            io.emit('login', userData2);
            socket.emit('login2', singleUserNew)
        });
        socket.on('disconnect', () => {
            userData2 = userData2.filter((user) => user.socket !== socket.id);
        });
        socket.on('send_fight_request', (targetUserId) => {
            const targetUser = userData2.find(user => user.socket === targetUserId);
            if (targetUser) {

                io.to(targetUser.socket).emit('fight_request', {
                    from: {
                        id: socket.userData._id,
                        socketId: socket.id,
                        username: socket.userData.username
                    }
                });
            }
        });

        socket.on ('accept_fight', async (opponentId) => {
            const opponentSocket = io.sockets.sockets.get(opponentId);
            if (opponentSocket) {
                const roomId = `${socket.id}_${opponentSocket.id}`;
                socket.join(roomId);
                opponentSocket.join(roomId);

                let singleUser = await playerDb.findOne({ username: socket.userData.username }, { password: 0 });
                let singleUser2 = await playerDb.findOne({username: opponentSocket.userData.username},{password: 0})

                let firstUser= {
                    username: singleUser.username,
                    weapon: singleUser.weapon,
                    armour: singleUser.armour,
                    potion: singleUser.potion,
                    avatar: singleUser.avatar,
                    id: singleUser._id,
                    socket: socket.id,
                    turn: false,
                    hp: 100,
                    win: false,
                    potionUse: false,
                    gold: 0,
                }
                let secondUser= {
                    username: singleUser2.username,
                    weapon: singleUser2.weapon,
                    armour: singleUser2.armour,
                    potion: singleUser2.potion,
                    avatar: singleUser2.avatar,
                    id: singleUser2._id,
                    socket: opponentSocket.id,
                    turn: true,
                    hp: 100,
                    win: false,
                    potionUse: false,
                    gold: 0,
                }
                rooms.push({
                    roomId: roomId,
                    player1: firstUser,
                    player2: secondUser,
                });
                io.to(socket.id).emit('fight_accepted', {
                    opponent: opponentSocket.userData
                });
                io.to(opponentSocket.id).emit('fight_accepted', {
                    opponent: socket.userData
                });

                io.to(roomId).emit('room_created', {
                    roomId: roomId,
                    player1: firstUser,
                    player2: secondUser,
                });
            }
        });
        socket.on('potion',(roomId, val) => {

            const room = rooms.find(r => r.roomId === roomId);
            if (!room) return;
            if (val===2) {
                room.player2.potionUse=true
                room.player2.hp+=room.player2.potion[0].potion
                if (room.player2.hp>100) {
                    room.player2.hp=100
                }
            }
            if (val===1) {
                room.player1.potionUse=true
                room.player1.hp+=room.player1.potion[0].potion
                if (room.player1.hp>100) {
                    room.player1.hp=100
                }
            }
            io.to(roomId).emit('update_players', {
                player1: room.player1,
                player2: room.player2,
                roomId: roomId
            });
        })
        socket.on('hit', (roomId) => {
            const room = rooms.find(r => r.roomId === roomId);
            if (!room) return;

            if (room.player1.turn) {
                let damage=room.player1.weapon[0].weaponPower
                let gold = room.player1.weapon[0].gold


                let defenceChance = room.player2.weapon[0].blockChance + room.player2.armour[0].blockChance
                let defenceRandom = Math.floor(Math.random()+100)

                let doubleChange = room.player1.weapon[0].doubleChance + room.player1.armour[0].doubleChance
                let doubleChangeRandom = Math.floor(Math.random()+100)

                let steelChance = room.player1.weapon[0].stealChance + room.player1.armour[0].stealChance
                let stealChangeRandom = Math.floor(Math.random()*100)

                if(steelChance>stealChangeRandom) {
                    room.player1.hp+=1
                    room.player2.hp-=1
                }
                if (doubleChange>doubleChangeRandom) damage*=2
                if (defenceChance>defenceRandom) {
                    damage=0
                    gold=0
                }
                room.player1.gold+=gold
                room.player2.hp-= damage
                room.player2.turn=true
                room.player1.turn=false

            } else {
                let damage=room.player2.weapon[0].weaponPower
                let gold = room.player2.weapon[0].gold


                let defenceChance = room.player1.weapon[0].blockChance + room.player1.armour[0].blockChance
                let defenceRandom = Math.floor(Math.random()+100)

                let doubleChange = room.player2.weapon[0].doubleChance + room.player2.armour[0].doubleChance
                let doubleChangeRandom = Math.floor(Math.random()+100)

                let steelChance = room.player2.weapon[0].stealChance + room.player2.armour[0].stealChance
                let stealChangeRandom = Math.floor(Math.random()*100)

                if(steelChance>stealChangeRandom) {
                    room.player2.hp+=1
                    room.player1.hp-=1
                }
                if (doubleChange>doubleChangeRandom) damage*=2
                if (defenceChance>defenceRandom) {
                    damage=0
                    gold=0
                }
                room.player2.gold+=gold
                room.player1.hp-= damage
                room.player1.turn=true
                room.player2.turn=false
            }
            if (room.player1.hp < 0) room.player1.hp = 0;
            if (room.player2.hp < 0) room.player2.hp = 0;

            if (room.player1.potionUse) {
                room.player1.potion[0].potion=0}

            if (room.player2.potionUse) {
                room.player2.potion[0].potion=0}


            io.to(roomId).emit('update_players', {
                player1: room.player1,
                player2: room.player2,
                roomId: roomId
            });

            if (room.player1.hp === 0) {
                io.to(roomId).emit('wins', {
                    username: room.player2.username,
                    lose: room.player1.username,
                    winPotion: room.player2.potionUse,
                    losePotion: room.player1.potionUse,
                    win: 2,
                    gold: room.player2.gold
                })
                rooms = rooms.filter(r => r.roomId !== roomId);
            }


            if (room.player2.hp === 0) {
                io.to(roomId).emit('wins', {
                    username: room.player1.username,
                    lose: room.player2.username,
                    winPotion: room.player1.potionUse,
                    losePotion: room.player2.potionUse,
                    win: 1,
                    gold: room.player1.gold
                })
                rooms = rooms.filter(r => r.roomId !== roomId);

            }

        });
        socket.on('decline_fight', (opponentId) => {
            const opponentSocketId = userData2.find(user => user.id === opponentId)?.socket;
            if (opponentSocketId) {
                io.to(opponentSocketId).emit('fight_declined', {
                    opponent: socket.userData.username
                });
            }
        });
    });
};