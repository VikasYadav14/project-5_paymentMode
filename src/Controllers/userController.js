const userModel=require("../Models/userModel")
const {isValid,isValidName,isvalidEmail,isvalidMobile,isValidPassword,pincodeValid,keyValid}=require('../Validator/validation')

const imgUpload=require("../AWS/aws-S3")

const bcrypt=require('bcrypt')

const createUser=async function(req,res){
    try {
        const data=req.body
        const files=req.files

        if(!keyValid(data)) return res.status(400).send({status:false,message:"Please Enter data to Create the User"})

        const{fname,lname,email,profileImage,phone,password,address}=data
        
        if(!isValid(fname)) return res.status(400).send({status:false,message:"fname is mandatory and should have non empty String"})

        if(!isValidName.test(fname)) return res.status(400).send({status:false,message:"Please Provide fname in valid formate and Should Starts with Capital Letter"})

        if(!isValid(lname)) return res.status(400).send({status:false,message:"lname is mandatory and should have non empty String"})

        if(!isValidName.test(lname)) return res.status(400).send({status:false,message:"Please Provide lname in valid formate and Should Starts with Capital Letter"})

        if(!isValid(email)) return res.status(400).send({status:false,message:"email is mandatory and should have non empty String"})

        if(!isvalidEmail.test(email)) return res.status(400).send({status:false,message:"email should be in  valid Formate"})

        if(await userModel.findOne({email})) return res.status(400).send({status:false,message:"This email is already Registered Please give another Email"})

        if(!keyValid(files))  return res.status(400).send({status:false,message:"profile Image is Mandatory"})
     
        if(!isValid(phone)) return res.status(400).send({status:false,message:"Phone is mandatory and should have non empty Number"})
 
        if(!isvalidMobile.test(phone)) return res.status(400).send({status:false,message:"please provide Valid phone Number with 10 digits starts with 6||7||8||9"})

        if(await userModel.findOne({phone})) return res.status(400).send({status:false,message:"This Phone is already Registered Please give another Phone"})

        if(!isValid(password)) return res.status(400).send({status:false,message:"Password is mandatory and should have non empty String"})

        if(!isValidPassword(password)) return res.status(400).send({status:false,message:"please provide Valid password with 1st letter should be Capital letter and contains spcial character with Min length 8 and Max length 15"})

        if(!isValid(address)) return res.status(400).send({status:false,message:"Address is mandatory"})

        const addressParse=JSON.parse(address)
       
        if(addressParse.shipping){
            if(!keyValid(addressParse.shipping)) return res.status(400).send({status:false,message:"Please provide address for Shipping"})
 
            if(!isValid(addressParse.shipping.street)) return res.status(400).send({status:false,message:"Street is mandatory and should have non empty String in Shipping"})
 
            if(!isValid(addressParse.shipping.city)) return res.status(400).send({status:false,message:"city is mandatory and should have non empty String in Shipping"})

            if(!isValid(addressParse.shipping.pincode)) return res.status(400).send({status:false,message:"pincode is mandatory and should have non empty String in Shipping"})

            if(!pincodeValid.test(addressParse.shipping.pincode)) return res.status(400).send({status:false,message:"Please provide valid Pincode with min 4 number || max 6 number in Shipping"})
        }else{
            return res.status(400).send({status:false,message:"Please provide address for Shipping"})
        }
        
        if(addressParse.billing){
            if(!keyValid(addressParse.billing)) return res.status(400).send({status:false,message:"Please provide address for billing"})

            if(!isValid(addressParse.billing.street)) return res.status(400).send({status:false,message:"Street is mandatory and should have non empty String in billing"})

            if(!isValid(addressParse.billing.city)) return res.status(400).send({status:false,message:"city is mandatory and should have non empty String in billing"})

            if(!isValid(addressParse.billing.pincode)) return res.status(400).send({status:false,message:"pincode is mandatory and should have non empty String in billing"})

            if(!pincodeValid.test(addressParse.billing.pincode)) return res.status(400).send({status:false,message:"Please provide valid Pincode with min 4 number || max 6 number in billing"})

        }else{
            return res.status(400).send({status:false,message:"Please provide address for billing"})
        }

        let profileImage1=await imgUpload.uploadFile(files[0])

        const encyptPassword=await bcrypt.hash(password,10)

        let obj={
            fname,lname,email,profileImage:profileImage1,phone,password:encyptPassword,address:addressParse
        }
    
        const newUser = await userModel.create(obj)

        return res.status(201).send({ status: true, message: 'Success', data: newUser })

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}

module.exports={createUser}