const productModel=require('../Models/productModel')

const {isValid,keyValid,priceValid, validString,objectIdValid}=require('../Validator/validation')

const imgUpload=require("../AWS/aws-S3")


const createProduct=async function(req,res){
    try {
        const data=req.body
        const files=req.files

        if(!keyValid(data)) return res.status(400).send({status:false,message:"Please Enter data to Create the Product"})

        const{title,description,price,currencyId,currencyFormat,isFreeShipping,style,availableSizes,installments}=data
        
        if(!isValid(title)) return res.status(400).send({status:false,message:"Title is mandatory and should have non empty String"})

        if(await productModel.findOne({title})) return res.status(400).send({status:false,message:"The Title is already present please Give another Title"})

        if(!isValid(description)) return res.status(400).send({status:false,message:"description is mandatory and should have non empty String"})

        if(!isValid(price)) return res.status(400).send({status:false,message:"Price is mandatory and should have non empty Number"})

        if(!priceValid.test(price)) return res.status(400).send({status:false,message:"email should be in  valid Formate"})

        if(!keyValid(currencyId))  return res.status(400).send({status:false,message:"profile Image is Mandatory"})
     
        if(!/^INR$/.test(currencyId)) return res.status(400).send({status:false,message:`currencyId Should be in this form "INR" only`})

        if(!isValid(currencyFormat)) return res.status(400).send({status:false,message:"currencyFormat is mandatory and should have non empty Number"})
 
        if(!/^₹$/.test(currencyFormat)) return res.status(400).send({status:false,message:`currencyFormat Should be in this form "₹" only`})

        if(isFreeShipping){
           if (!/^(true|false)$/.test(isFreeShipping)) return res.status(400).send({status:false,message:`isFreeShipping Should be in boolean with small letters`})
        }
        
        if(!keyValid(files))  return res.status(400).send({status:false,message:"product Image is Mandatory"})

        if(style){
            if(!validString(style)) return res.status(400).send({status:false,message:"Style should have non empty String"})
        }

        if(!isValid(currencyFormat)) return res.status(400).send({status:false,message:"currencyFormat is mandatory and should have non empty Number"})



        if(!isValid(password)) return res.status(400).send({status:false,message:"Password is mandatory and should have non empty String"})

        if(!isValidPassword(password)) return res.status(400).send({status:false,message:"please provide Valid password with 1st letter should be Capital letter and contains spcial character with Min length 8 and Max length 15"})

        if(!isValid(address)) return res.status(400).send({status:false,message:"Address is mandatory"})

        
        let productImage=await imgUpload.uploadFile(files[0])

        let obj={
            fname,lname,email,productImage:productImage,address:addressParse
        }
    
        const newUser = await userModel.create(obj)

        return res.status(201).send({ status: true, message:"User created successfully", data: newUser })

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}