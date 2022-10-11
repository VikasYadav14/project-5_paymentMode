const express = require('express')
const router = express.Router()
const {createUser, updateUser, loginUser}=require('../Controllers/userController')

router.get("/test",function(req,res){
    return res.send({data:"This to test"})
})

router.post("/register", createUser)

router.post("/login",loginUser)

router.put("/user/:userId/profile", updateUser)




// for worng route=============================>

router.all('/*/',async function(req,res){
    return res.status(404).send({status:false,message:"Page Not Found"})
})


module.exports = router