const express = require("express")
const router = express.Router()

const {
    avatars,
    register,
    login,
    gameInfoLoad,
    generateGame,
    takeItems, updateItems, updateFightItem, autoLogin,  removeItem, winGame

} = require("../controllers/mainController")

const validators = require ('../middleware/validators')

router.post ("/register", register)
router.get("/avatars", avatars)
router.post("/login", login)
router.get("/gameInfoLoad", gameInfoLoad)
router.get ("/generateGame",validators.authorization, generateGame)
router.get ("/takeItems/:id",validators.authorization, takeItems)
router.get ("/updateItems", validators.authorization, updateItems)
router.post ("/updateFightItem",validators.authorization, updateFightItem)
router.post ("/autoLogin",validators.authorization, autoLogin)
router.post ("/removeItem", validators.authorization, removeItem)
router.post ("/winGame", validators.authorization, winGame)

module.exports=router