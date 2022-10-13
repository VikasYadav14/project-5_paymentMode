const express = require('express')
const router = express.Router()
const {authentication}=require("../MiddleWare/auth")

const { createProduct, getProducts, deleteProductById } = require('../Controllers/productController')
const {createUser, updateUser, loginUser, getById}=require('../Controllers/userController')

router.get("/test",function(req,res){
    return res.send({data:"This to test"})
})

router.post("/register", createUser)

router.post("/login",loginUser)

router.get("/user/:userId/profile",authentication ,getById)

router.put("/user/:userId/profile",authentication, updateUser)

router.post("/products", createProduct)

router.get("/products", getProducts)

router.delete("/products/:productId", deleteProductById)


// for worng route=============================>

router.all('/*/',async function(req,res){
    return res.status(404).send({status:false,message:"Page Not Found"})
})


module.exports = router