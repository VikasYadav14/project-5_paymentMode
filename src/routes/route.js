const express = require('express')
const router = express.Router()
const {createUser, updateUser, loginUser, getById}=require('../Controllers/userController')
const {authentication}=require("../MiddleWare/auth")

router.get("/test",function(req,res){
    return res.send({data:"This to test"})
})

router.post("/register", createUser)

router.post("/login",loginUser)

router.get("/user/:userId/profile",authentication ,getById)

router.put("/user/:userId/profile",authentication, updateUser)







// for worng route=============================>

router.all('/*/',async function(req,res){
    return res.status(404).send({status:false,message:"Page Not Found"})
})


module.exports = router