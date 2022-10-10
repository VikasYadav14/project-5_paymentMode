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

        if(!isValidName.test(fname)) return res.status(400).send({status:false,message:"Please Provide fname in valid formate"})

        if(!isValid(lname)) return res.status(400).send({status:false,message:"lname is mandatory and should have non empty String"})

        if(!isValidName.test(lname)) return res.status(400).send({status:false,message:"Please Provide lname in valid formate"})

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

        if(address.shipping){
            if(!keyValid(address.shipping)) return res.status(400).send({status:false,message:"Please provide address for Shipping"})
 
            if(!isValid(address.shipping.street)) return res.status(400).send({status:false,message:"Street is mandatory and should have non empty String"})

            if(!isValid(address.shipping.city)) return res.status(400).send({status:false,message:"city is mandatory and should have non empty String"})

            if(!isValid(address.shipping.pincode)) return res.status(400).send({status:false,message:"pincode is mandatory and should have non empty String"})

            if(!pincodeValid.test(address.shipping.pincode)) return res.status(400).send({status:false,message:"Please provide valid Pincode with min 4 number || max 6 number"})

        }
        
        if(address.billing){
            if(!keyValid(address.billing)) return res.status(400).send({status:false,message:"Please provide address for billing"})

            if(!isValid(address.billing.street)) return res.status(400).send({status:false,message:"Street is mandatory and should have non empty String"})

            if(!isValid(address.billing.city)) return res.status(400).send({status:false,message:"city is mandatory and should have non empty String"})

            if(!isValid(address.billing.pincode)) return res.status(400).send({status:false,message:"pincode is mandatory and should have non empty String"})

            if(!pincodeValid.test(address.billing.pincode)) return res.status(400).send({status:false,message:"Please provide valid Pincode with min 4 number || max 6 number"})

        }

        let profileImage1=await imgUpload.uploadFile(files[0])

        
        const encyptPassword=await bcrypt.hash(password,10)
        console.log(encyptPassword)

        let obj={
            fname,lname,email,profileImage:profileImage1,phone,password:encyptPassword,address
        }

        const newUser = await userModel.create(obj)
        return res.status(201).send({ status: true, message: 'Success', data: newUser })

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}

module.exports={createUser}