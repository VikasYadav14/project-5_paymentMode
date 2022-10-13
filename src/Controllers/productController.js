const productModel = require("../Models/productModel")
const { keyValid } = require("../Validator/validation")















async function getProducts(req,res) {
    try {
        if (!keyValid(req.body)) {
            let productId = req.params.productId
            let details = await productModel.find({_id:productId,isDeleted:false})
            if(!details) return res.status(404).send({status:false, message:"product not found"})
            return res.status(200).send({status:false,"number of products":details.length, data:details})

        }
         return res.status(404).send({status:false, message:"ok not found"})
        
    } catch (error) {
        return res.status(500).send({status:false, message:error.message})
    }
}

module.exports = getProducts