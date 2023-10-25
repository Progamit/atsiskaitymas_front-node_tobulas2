const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playerSchema = new Schema({
    username: {
        type:String,
        required:true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type:String,
        required:true
    },
    money: {
        type: Number,
        required:true,
        default: 20000
    },
    weapon: {
        type:[],
        required:false,
    },
    armour: {
        type:[],
        required:false,
    },
    potion: {
        type:[],
        required:false,
    },
    items: {
        type: [],
        required:false
    },

})

const Player = mongoose.model("FightGamePlayers", playerSchema);
module.exports = Player;