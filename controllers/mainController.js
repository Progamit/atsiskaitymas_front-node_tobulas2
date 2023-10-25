const playerDb = require("../schemas/playerSchema");
const bCrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const avatarsUrl = [
    {
        number: 0,
        url:'https://media.istockphoto.com/id/1167562360/photo/senior-knight-wearing-traditional-clothes-with-sword.webp?b=1&s=170667a&w=0&k=20&c=PEEFIpzO7Vf24J8JnNddoq76zvozpbxwCyR0CkTHELg=',
        used: false
    },
    {
        number: 1,
        url:'https://media.istockphoto.com/id/1262273987/photo/portrait-of-a-warrior-king.jpg?s=612x612&w=0&k=20&c=D2V3U6nPzykGnz-g1Dk-hzDueign0TaUXL8VOZLQAj0=',
        used: false
    },
    {
        number: 2,
        url:'https://media.istockphoto.com/id/1287805436/photo/portrait-of-a-snow-viking-warrior-king-in-the-mountains.jpg?s=612x612&w=0&k=20&c=F72Ggm0Fmxa7H50CbM8tyFe-Qj3w9pGDmasC-hrDCzU=',
        used: false
    },
    {
        number: 3,
        url:'https://media.istockphoto.com/id/1207246618/photo/portrait-of-a-viking-warrior.jpg?s=612x612&w=0&k=20&c=BBXWrTf7i_GBLuiX9prNXUJ8CuosvKMj9nt5nEa4GkA=',
        used: false
    },
    {
        number: 4,
        url:'https://media.istockphoto.com/id/966517020/photo/weapon-wielding-bloody-medieval-warrior-alone-on-a-cold-seashore.jpg?s=612x612&w=0&k=20&c=WNKdRGdpD6z_90tVgEq-nMsNtb1qZg7cV5MkPmiXwIo=',
        used: false
    },
    {
        number: 5,
        url:'https://media.istockphoto.com/id/1198008447/photo/beautiful-viking-woman.jpg?s=612x612&w=0&k=20&c=FBJvgYvP_QRvSVg43tgEIO-FnweZDFehpcD65Z3YJHM=',
        used: false
    },
    {
        number: 6,
        url:'https://media.istockphoto.com/id/1463834917/photo/beautiful-blonde-warrior-woman.jpg?s=612x612&w=0&k=20&c=PFWZ8pl1DCM8mCQjKQmRgHbrdQ0aWMsO7hcwydPkSFs=',
        used: false
    },
    {
        number: 7,
        url:'https://media.istockphoto.com/id/1399256527/photo/portrait-of-beautiful-blonde-fantasy-viking-woman.jpg?s=612x612&w=0&k=20&c=CnXJ8pvaYMF-DufB7ib5i2enZz9F-NTW92t3wmLsbno=',
        used: false
    },
    {
        number: 8,
        url:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRjAAD_LSf1qFWpCb08oq88sMU32q3vMlSvw&usqp=CAU',
        used: false
    },
    {
        number: 9,
        url:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjTZyYjSWz0P354h7mHOZG49BVXSj5BmPYmg&usqp=CAU',
        used: false
    },
]
let userForSocket = []
let lastGenerate = ""
module.exports = {
    avatars: async (req,res) => {
        res.send ({error: false, data: avatarsUrl, message:"work"})
    },
    register: async (req, res) => {
        const info = req.body;
        if (!info.avatar && info.avatar!==0) return res.send({ error: true, data: [], message: "no avatar" });
        const singleUser = await playerDb.findOne({ username: info.username});
        if (singleUser) return res.send({ error: true, data: [], message: "username exist" });
        const avatar = await playerDb.findOne ({avatar: avatarsUrl[info.avatar].url})
        if (avatar) return res.send({ error: true, data: [], message: "avatar exist" });
        const player = new playerDb({
            username: info.username,
            password: info.password,
            avatar: avatarsUrl[info.avatar].url,
            weapon: [{
                name:"weapon",
                color:"white",
                weaponUrl: "https://media.istockphoto.com/id/180184242/photo/key-of-success.jpg?s=612x612&w=0&k=20&c=4ADnSBIFAEvREwibHEc9CupTqRj1wRcCz_8PvaoYeuc=",
                weaponPower: 1,
                weaponLevel:1,
                gold: 1,
                doubleChance: 0,
                blockChance: 0,
                stealChance: 0,
            }],
            armour: [{
                name:"armour",
                armourDefence: 0,
                armourLevel: 1,
                armourUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxnS1WNu5vKfh7uimuMgTacIvNM4UV6YbIBQ&usqp=CAU",
                weaponPower: 1,
                doubleChance: 0,
                blockChance: 0,
                stealChance: 0,
            }],
            potion: [{
                name: "potion",
                potion:1,
                potionUrl:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWfCvi5_VS96SpDnctfEg32ETHymowDex-cw&usqp=CAU",
            }]
        });
        const hash = await bCrypt.hash(player.password, 10);
        player.password = hash;

        player.save().then(() => {
            res.send({ error: false, data: [], message: "REGISTER" });
        }).catch(e => {
            res.send({ error: true, data: [], message: "FAULT" });
        });
    },
    login: async (req,res) => {
        const info = req.body
        const singleUser = await playerDb.findOne({ username: info.username});
        if (!singleUser) return
        const samePass= await bCrypt.compare (info.password, singleUser.password)
        if (samePass) {
            const newUser = {
                username: singleUser.username,
                _id: singleUser._id
            }
            userForSocket= newUser
            const token = jwt.sign(newUser, process.env.JWT_SECRET,  )
            res.send({error:false, data: token, message: "login successful"})
        } else {
            res.send({ error: true, data: [], message: "Login failed. Bad username or password." });
        }
    },
    gameInfoLoad: async (req,res) => {
        const info = req.params
        res.send({error:false, data: [], message: ""})
    },
    generateGame:async (req,res) => {

        const single = await playerDb.findOne({ _id: req.user._id }, { password: 0 });
        if(single.money<50) return res.send({error:true, data: [], message:"enough money"})
        single.money -= 50

        const userNew = await playerDb.findOneAndUpdate(
            { _id: req.user._id },
            {
                $set: {
                    money: single.money
                }
            },
            { new: true, projection: { password: 0 } }
        );


        const weapons = [
            "https://media.istockphoto.com/id/601924068/photo/two-blade-battle-axe-isolated.jpg?s=612x612&w=0&k=20&c=YGB2Czu_mrOKEehHBKkQLaSDkj6u_H_nxBWGAi8LAgM=",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS72dWqk0OsJ5fgETWKwr5sVezmCaEbGrebMw&usqp=CAUg",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk_PH9jvf4NgDapTqyN_RDT4XGJSGNdu3zDw&usqp=CAU",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp3So2zgU_blXJgQtNmn2qNaNNQjIt0psniw&usqp=CAU",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQKcA86-UQKA8fqwCKc5CxpAy2l7y7_nrkOA&usqp=CAU",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ78XQ1sCVZ14Qdm8eu9HYEwvtKw_GudaBdIA&usqp=CAU",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPR07jSZ-YGgj6Gp0yUUzLoHZGySnoKVtFSg&usqp=CAU",
            "https://media.istockphoto.com/id/1306391006/photo/an-old-axe-on-the-table-surface.jpg?s=612x612&w=0&k=20&c=XDRyxgLAaj5GDpFht56WsxarBDcqva9ePb__Z8meqvo=",
            "https://media.istockphoto.com/id/1170953351/photo/medieval-gun-smith-shop-swords-and-armor-for-sale.jpg?s=612x612&w=0&k=20&c=0neLfEjGsblHI3kyIxTGqke8JAt72bwd_NinjHSGzdU=",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQr8VDpQ__EvzlgbsyYkuIfp_NVSZaO7I0k8cEWR4kEPc7teo7Cwv9behn_spojGwJ0MwQ&usqp=CAU",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7-Y4IJd3l4BkrFM0JsPWo0510kJ6-cWxfOQ&usqp=CAU",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz8J3mFBqUMNCtNkA-af4L07uuJGBejpGq0g&usqp=CAU",
        ]
        const armours = [
            "https://media.istockphoto.com/id/1391325116/photo/samurai-sits-on-one-knee-in-the-smoke-3d-illustration.webp?b=1&s=170667a&w=0&k=20&c=8ktiQXWZkFI-TtaIwTJbzi-HXii__tjE9PDZOuPgKIw=",
            "https://media.istockphoto.com/id/1251355287/photo/medieval-knight-armor-isolated.webp?b=1&s=170667a&w=0&k=20&c=A3lelI7TX0FK-jZnIphI8_wgNZbddmjPIK2vL1fjmvo=",
            "https://media.istockphoto.com/id/1392984356/photo/soldier-in-gloves-holding-miltary-armor-vest.webp?b=1&s=170667a&w=0&k=20&c=CaFqaaLt00Z6lP2abscPy-1M3TUvO_egqNGNEj2_qhE=",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiWtaKNmxfI6FfMcmctbc0AeW9-luFbh-NOA&usqp=CAU",
            "https://media.istockphoto.com/id/1406627702/photo/protection.webp?b=1&s=170667a&w=0&k=20&c=NNt9CQgqhtyJQnTH9wa8J0KBTFh2nifeAE54JxDCjxs=",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCUXoB9IESBPh-Dj3hCeafXJEOCscxotXIOg&usqp=CAU",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVgCb23ZEWDeZEf0zaxukeUdoxr9ok-2-IFA&usqp=CAU",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8O-s_dT6liYdSBDzkRWYMvgQrpZtTxaq6cQ&usqp=CAU",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRORc5Nkcvq3EAT5lrs9VV16ugpx-1nj0ZzKQ&usqp=CAU",
            "https://www.lrt.lt/img/2014/11/30/60815-772343-756x425.jpg",
            "https://www.vle.lt/uploads/_CGSmartImage/105921_2-333c35ef795eda657f62b4b25593cc5c.jpg",
            "https://www.vle.lt/uploads/_CGSmartImage/105921_3-2f7548da8e1217e7af8847e8b72d9958.jpg",
        ]
        const effectSlots = [
            { slotName: 'criticalChance',
                doubleChance: 50,
                blockChance: 0,
                stealChance: 0,
            },
            {
                slotName: 'dodgeChance',
                doubleChance: 0,
                blockChance: 40,
                stealChance: 0,
            },
            {
                slotName: 'criticalChance',
                doubleChance: 0,
                blockChance: 0,
                stealChance: 50,
            }
        ]
        let items = {}
        let randomWeapon = Math.floor(Math.random()*12)
        let randomArmour = Math.floor(Math.random()*12)
        let randomPotion = Math.floor(Math.random()*100)+1
        let weaponLevel = 1
        let armourLevel = 1
        let weaponPower = 0
        let armourPower= 0
        let weaponEffectSlots= 0
        let weaponsSlots =  []
        let armourEffectSlots = 0
        let weaponEffects  = []
        let armourEffects = []
        let armourSlots=[]
        let goldGeneration = 0
        if (randomWeapon) {
            if(randomWeapon>7) {
                weaponEffectSlots = (Math.round(Math.random()))+ (Math.round(Math.random()))+(Math.round(Math.random()))
                weaponLevel = 3
                weaponPower=Math.floor(Math.random()*23)+7
                goldGeneration = (Math.floor(Math.random()*10)+1)
            }
            if(randomWeapon>3 && randomWeapon<8){
                weaponLevel = 2
                weaponEffectSlots = (Math.round(Math.random()))
                weaponPower=Math.floor(Math.random()*16)+4
                goldGeneration = (Math.floor(Math.random()*6)+1)
            }
            if(randomWeapon<4)
                weaponPower=Math.floor(Math.random()*5)+1
            goldGeneration = (Math.floor(Math.random()*3)+1)
        }
        if (randomArmour) {
            if (randomArmour > 7) {
                armourLevel = 3
                armourEffectSlots = (Math.round(Math.random())) + (Math.round(Math.random())) + (Math.round(Math.random()))
                armourPower = Math.floor(Math.random() * 90)
            }
            if (randomArmour > 3 && randomArmour < 8) {
                armourLevel = 2
                armourEffectSlots = (Math.round(Math.random()))
                armourPower = Math.floor(Math.random() * 50)
            }
            if (randomArmour < 4) armourPower = Math.floor(Math.random() * 20)

        }


        if (weaponEffectSlots) {
            if (weaponEffectSlots=== 1) {
                let randomSlot = Math.floor(Math.random()*3)
                weaponsSlots.push(randomSlot)
            }
            if (weaponEffectSlots===2) {
                let randomSlot = Math.floor(Math.random()*3)
                let randomSlot2 = 0
                let random = Math.floor(Math.random()*2)
                if (randomSlot===0) {
                    if (random===0) randomSlot2=1
                    else { randomSlot2=2}
                }
                if(randomSlot===1) {
                    if (random===0) randomSlot2=0
                    else { randomSlot2=2}
                }
                if(randomSlot===2) {
                    if (random===0) randomSlot2=0
                    else { randomSlot2=1}
                }
                weaponsSlots.push(randomSlot)
                weaponsSlots.push(randomSlot2)
            }
            if (weaponEffectSlots===3) {
                weaponsSlots = [1,2,3]
            }}

        if (armourEffectSlots) {

            if (armourEffectSlots=== 1) {
                let randomSlot = Math.floor(Math.random()*3)
                armourSlots.push(randomSlot)
            }
            if (armourEffectSlots===2) {
                let randomSlot = Math.floor(Math.random()*3)
                let randomSlot2 = 0
                let random = Math.floor(Math.random()*2)
                if (randomSlot===0) {
                    if (random===0) randomSlot2=1
                    else { randomSlot2=2}
                }
                if(randomSlot===1) {
                    if (random===0) randomSlot2=0
                    else { randomSlot2=2}
                }
                if(randomSlot===2) {
                    if (random===0) randomSlot2=0
                    else { randomSlot2=1}
                }
                armourSlots.push(randomSlot)
                armourSlots.push(randomSlot2)
            }
            if (armourEffectSlots===3) {
                armourSlots = [1,2,3]
            }}
        for (let i = 0; i < weaponsSlots.length ; i++) {
            if (weaponsSlots[i]===1) {
                let random = Math.floor(Math.random()*50)+1
                let slot = {
                    slotName: 'criticalChance',
                    doubleChance: random,
                    blockChance: 0,
                    stealChance: 0,
                }
                weaponEffects.push(slot)
            }
            if (weaponsSlots[i]===2) {
                let random = Math.floor(Math.random()*40)+1
                let slot = {
                    slotName: 'dodgeChance',
                    doubleChance: 0,
                    blockChance: random,
                    stealChance: 0,
                }
                weaponEffects.push(slot)
            }
            if (weaponsSlots[i]===3) {
                let random = Math.floor(Math.random()*50)+1
                let slot = {
                    slotName: 'stealChance',
                    doubleChance: 0,
                    blockChance: 0,
                    stealChance: random,
                }
                weaponEffects.push(slot)
            }
        }

        for (let i = 0; i < armourSlots.length ; i++) {
            if (armourSlots[i]===1) {
                let random = Math.floor(Math.random()*50)+1
                let slot = {
                    slotName: 'criticalChance',
                    doubleChance: random,
                    blockChance: 0,
                    stealChance: 0,
                }
                armourEffects.push(slot)
            }
            if (armourSlots[i]===2) {
                let random = Math.floor(Math.random()*40)+1
                let slot = {
                    slotName: 'dodgeChance',
                    doubleChance: 0,
                    blockChance: random,
                    stealChance: 0,
                }
                armourEffects.push(slot)
            }
            if (armourSlots[i]===3) {
                let random = Math.floor(Math.random()*50)+1
                let slot = {
                    slotName: 'stealChance',
                    doubleChance: 0,
                    blockChance: 0,
                    stealChance: random,
                }
                armourEffects.push(slot)
            }
        }

        if (weaponEffects.length===0) {
            let slot = {
                slotName: 'empty',
                doubleChance: 0,
                blockChance: 0,
                stealChance: 0,
            }
            weaponEffects.push(slot)
            weaponEffects.push(slot)
            weaponEffects.push(slot)
        }
        if (weaponEffects.length===1) {
            let slot = {
                slotName: 'empty',
                doubleChance: 0,
                blockChance: 0,
                stealChance: 0,
            }
            weaponEffects.push(slot)
            weaponEffects.push(slot)

        }
        if (weaponEffects.length===2) {
            let slot = {
                slotName: 'empty',
                doubleChance: 0,
                blockChance: 0,
                stealChance: 0,
            }
            weaponEffects.push(slot)
        }
        if (armourEffects.length===0) {
            let slot = {
                slotName: 'empty',
                doubleChance: 0,
                blockChance: 0,
                stealChance: 0,
            }
            armourEffects.push(slot)
            armourEffects.push(slot)
            armourEffects.push(slot)
        }
        if (armourEffects.length===1) {
            let slot = {
                slotName: 'empty',
                doubleChance: 0,
                blockChance: 0,
                stealChance: 0,
            }
            armourEffects.push(slot)
            armourEffects.push(slot)

        }
        if (armourEffects.length===2) {
            let slot = {
                slotName: 'empty',
                doubleChance: 0,
                blockChance: 0,
                stealChance: 0,
            }
            armourEffects.push(slot)
        }
        let color = {
            weapon: "",
            armour: ""
        }

        if (weaponLevel===1) color.weapon="#fdfdbc"
        if (weaponLevel===2) color.weapon="#7a88a8"
        if (weaponLevel===3) color.weapon="#f88c8c"
        if (armourLevel===1) color.armour="#fdfdbc"
        if (armourLevel===2) color.armour="#7a88a8"
        if (armourLevel===3) color.armour="#f88c8c"

        items = {
            weapon: {
                gold: goldGeneration,
                color: color.weapon,
                name: "weapon",
                weaponUrl: weapons[randomWeapon],
                weaponPower: weaponPower,
                weaponLevel: weaponLevel,
                doubleChance: weaponEffects[0].doubleChance+weaponEffects[1].doubleChance+weaponEffects[2].doubleChance,
                blockChance: weaponEffects[0].blockChance+weaponEffects[1].blockChance+weaponEffects[2].blockChance,
                stealChance: weaponEffects[0].stealChance+weaponEffects[1].stealChance+weaponEffects[2].stealChance,
            },
            armour: {
                color: color.armour,
                name: "armour",
                armourUrl: armours[randomArmour],
                armourDefence: armourPower,
                armourLevel: armourLevel,
                doubleChance: armourEffects[0].doubleChance+armourEffects[1].doubleChance+armourEffects[2].doubleChance,
                blockChance: armourEffects[0].blockChance+armourEffects[1].blockChance+armourEffects[2].blockChance,
                stealChance: armourEffects[0].stealChance+armourEffects[1].stealChance+armourEffects[2].stealChance,
            },
            potion: {
                name: "potion",
                potion: randomPotion,
                potionUrl: "https://i.redd.it/cfc2ey1jz7141.png"
            }
        }
        lastGenerate= items

        res.send({error:false, data: [items,userNew], message: "login successful"})
    },
    takeItems:async (req,res) => {
        const singleUser = await playerDb.findOne({ _id: req.user._id }, { password: 0 });
        if (singleUser.items.length>7) return res.send({error:true, data: [], message: "FULL ITEMS"})
        let itemsNew = singleUser.items
        const data = req.params
        const takeItem = lastGenerate[data.id];
        itemsNew.push(takeItem)
        const user = await playerDb.findOneAndUpdate(
            { _id: req.user._id },
            { $set: { items: itemsNew } },
            { new: true, projection: { password: 0 } }
        );

        res.send({error:false, data: user, message: "new Items"})
    },
    updateItems: async (req,res) => {
        const singleUser = await playerDb.findOne({ _id: req.user._id }, { password: 0 });
        if (!singleUser) res.send({error:true, data: user, message: "no user"})

        res.send({error:false, data: singleUser, message: "user"})
    },


    updateFightItem: async (req,res) => {
        const info = req.body
        const singleUser = await playerDb.findOne({ _id: req.user._id }, { password: 0 });
        const filteredItems = singleUser.items.filter(item => item && item.name);



        const userNew = await playerDb.findOneAndUpdate(
            { _id: req.user._id },
            {
                $set: {
                    items: filteredItems
                }
            },
            { new: true, projection: { password: 0 } }
        );

        let itemToItems = []
        let index = info.index
        if (info.name === "weapon") {
            itemToItems = userNew.weapon
            let updatedItems = userNew.items.filter((item, i) => i !== index);
            if (itemToItems) {
                updatedItems.push(itemToItems[0])
            }
            const user = await playerDb.findOneAndUpdate(
                { _id: req.user._id },
                { $set: { weapon: userNew.items[index],
                        items: updatedItems } },
                { new: true, projection: { password: 0 } }
            );
            res.send({error:false, data: user, message: "user"})

        }
        if (info.name === "armour") {
            itemToItems = userNew.armour
            let updatedItems = userNew.items.filter((item, i) => i !== index);
            if (itemToItems) {
                updatedItems.push(itemToItems[0])
            }
            const user = await playerDb.findOneAndUpdate(
                { _id: req.user._id },
                { $set: { armour: userNew.items[index],
                        items: updatedItems } },
                { new: true, projection: { password: 0 } }
            );
            res.send({error:false, data: user, message: "user"})

        }
        if (info.name === "potion") {
            itemToItems= userNew.potion
            let updatedItems = userNew.items.filter((item, i) => i !== index);
            if (itemToItems) {
                updatedItems.push(itemToItems[0])
            }
            const user = await playerDb.findOneAndUpdate(
                { _id: req.user._id },
                { $set: { potion: userNew.items[index],
                        items: updatedItems } },
                { new: true, projection: { password: 0 } }
            );
            res.send({error:false, data: user, message: "user"})
        }
    },
    autoLogin: (req, res) => {
        const userInfos = req.user;
        userForSocket = userInfos;
        res.send({ error: false, data: userInfos, message: "user" });
    },
    removeItem: async (req,res) => {
        const info = req.body;
        try {
            await playerDb.findOneAndUpdate(
                { _id: req.user._id },
                { $unset: { [`items.${info.index}`]: 1 } }
            );
            const user = await playerDb.findOneAndUpdate(
                { _id: req.user._id },
                { $pull: { items: null } },
                { new: true, projection: { password: 0 } }
            );
            res.send({error:false, data: user, message: ""})
        } catch(err) {
            res.send({error:true, data:[], message: "cant delete"})
        }
    },

    winGame: async (req, res) => {
        try {
            const info = req.body;
            if (info.winPotion) {
                const potion = await playerDb.findOneAndUpdate(
                    { username: info.username },
                    { $set: { potion: [] }},
                    { new: true, projection: { password: 0 } }
                )

            }
            if (info.losePotion) {
                const potion2 = await playerDb.findOneAndUpdate(
                    { username: info.lose },
                    { $set: { potion: [] }},
                    { new: true, projection: { password: 0 } }
                )
            }
            const user = await playerDb.findOneAndUpdate(
                { username: info.username },
                { $inc: { money: info.gold }},
                { new: true, projection: { password: 0 } }
            )
            if (!user) {
                return res.status(404).send({ error: true,data:[], message: 'User not found' });
            }
            res.send({ error: false, data: user, message: "" });
        } catch (error) {
            console.error('Error updating user money:', error);
            res.status(500).send({ error: true,data:[], message: 'Internal server error' });
        }
    }
}