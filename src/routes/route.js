const express = require('express')
const router = express.Router()


router.get("/test",function(req,res){
    return res.send({data:"This to test"})
})



// for worng route=============================>

router.all('/*/',async function(req,res){
    return res.status(404).send({status:false,message:"Page Not Found"})
})


module.exports = router