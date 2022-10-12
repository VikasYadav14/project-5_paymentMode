const productModel=require('../Models/productModel')

const {isValid,keyValid,priceValid, validString,objectIdValid}=require('../Validator/validation')

const imgUpload=require("../AWS/aws-S3")


const createProduct=async function(req,res){
    try {
        const data=req.body
        const files=req.files

        if(!isValid(files)) return res.status(400).send({status:false,message:"Please Enter data to Create the Product"})

        const{title,description,price,currencyId,currencyFormat,isFreeShipping,style,availableSizes,installments}=data
        
        if(!isValid(title)) return res.status(400).send({status:false,message:"Title is mandatory and should have non empty String"})

        if(await productModel.findOne({title})) return res.status(400).send({status:false,message:"The Title is already present please Give another Title"})

        if(!isValid(description)) return res.status(400).send({status:false,message:"description is mandatory and should have non empty String"})

        if(!isValid(price)) return res.status(400).send({status:false,message:"Price is mandatory and should have non empty Number"})

        if(!priceValid.test(price)) return res.status(400).send({status:false,message:"price should be in  valid Formate with Numbers || Decimals"})

        if(!isValid(currencyId))  return res.status(400).send({status:false,message:"currencyId is Mandatory and should have non empty Number "})
     
        if(!/^INR$/.test(currencyId)) return res.status(400).send({status:false,message:`currencyId Should be in this form 'INR' only`})

        if(!isValid(currencyFormat)) return res.status(400).send({status:false,message:"currencyFormat is mandatory and should have non empty string"})
 
        if(!/^₹$/.test(currencyFormat)) return res.status(400).send({status:false,message:`currencyFormat Should be in this form '₹' only`})

        if(isFreeShipping){
           if (!/^(true|false)$/.test(isFreeShipping)) return res.status(400).send({status:false,message:`isFreeShipping Should be in boolean with small letters`})
        }
        
        if(!keyValid(files))  return res.status(400).send({status:false,message:"product Image is Mandatory"})


        if(style){
            if(!validString(style)) return res.status(400).send({status:false,message:"Style should have non empty String"})
        }

        if(!isValid(availableSizes)) return res.status(400).send({status:false,message:"availableSizes is mandatory and should have non empty String"})
  
        let size=availableSizes.split(',').map(x=>x.trim())
 
        for(let i=0;i<size.length;i++){
            if(!(["S", "XS","M","X", "L","XXL", "XL"].includes(size[i]))) return res.status(400).send({status:false,message:`availableSizes should have only these Sizes ['S' || 'XS'  || 'M' || 'X' || 'L' || 'XXL' || 'XL']`})
        }
   
        if(installments){
            if(!validString(installments)) return res.status(400).send({status:false,message:"installments should have non empty Number"})

            if(!/^\d+$/.test(installments)) return res.status(400).send({status:false,message:"installments should have only Number"})
        }

        let productImage1=await imgUpload.uploadFile(files[0])

        let obj={
            title,description,price,currencyId,currencyFormat,isFreeShipping,productImage:productImage1,style,availableSizes:size,installments
        }
    
        const newProduct = await productModel.create(obj)

        return res.status(201).send({ status: true, message:"User created successfully", data: newProduct })

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}


module.exports={createProduct}