const userModel=require("../Models/userModel")
const {isValid,isValidName,isvalidEmail,isvalidMobile,isValidPassword,pincodeValid,keyValid,isValidImg, validString,objectIdValid}=require('../Validator/validation')

const imgUpload=require("../AWS/aws-S3")

const bcrypt=require('bcrypt')

const jwt=require('jsonwebtoken')

const createUser=async function(req,res){
    try {
        const data=req.body
        const files=req.files

        if(!keyValid(data)) return res.status(400).send({status:false,message:"Please Enter data to Create the User"})

        const{fname,lname,email,phone,password,address}=data
        
        if(!isValid(fname)) return res.status(400).send({status:false,message:"fname is mandatory and should have non empty String"})

        if(!isValidName.test(fname)) return res.status(400).send({status:false,message:"Please Provide fname in valid formate and Should Starts with Capital Letter"})

        if(!isValid(lname)) return res.status(400).send({status:false,message:"lname is mandatory and should have non empty String"})

        if(!isValidName.test(lname)) return res.status(400).send({status:false,message:"Please Provide lname in valid formate and Should Starts with Capital Letter"})

        if(!isValid(email)) return res.status(400).send({status:false,message:"email is mandatory and should have non empty String"})

        if(!isvalidEmail.test(email)) return res.status(400).send({status:false,message:"email should be in  valid Formate"})

        if(await userModel.findOne({email})) return res.status(400).send({status:false,message:"This email is already Registered Please give another Email"})

        if(!keyValid(files))  return res.status(400).send({status:false,message:"profile Image is Mandatory"})

        if(!isValidImg.test(profileImage)) return res.status(400).send({status:false,message:"profile Image should be valid with this extensions .png|.jpg|.gif"})
     
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

        return res.status(201).send({ status: true, message:"User created successfully", data: newUser })

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}

const loginUser = async function(req, res) {
    try {
        let data = req.body
        const { email, password } = data
        //=====================Checking the validation=====================//
        if (!keyValid(data)) return res.status(400).send({ status: false, msg: "Email and Password Required !" })

        //=====================Validation of EmailID=====================//
        if (!email) return res.status(400).send({ status: false, msg: "email is required" })


        //=====================Validation of Password=====================//
        if (!password) return res.status(400).send({ status: false, msg: "password is required" })

        //===================== Checking User exsistance using Email and password=====================//
        const user = await userModel.findOne({ email: email })
        if (!user) return res.status(400).send({ status: false, msg: "Email is Invalid Please try again !!" })

        const verifyPassword=await bcrypt.compare(password,user.password)

        if(!verifyPassword) return res.status(400).send({ status: false, msg: "Password is Invalid Please try again !!" })


        //===================== Creating Token Using JWT =====================//
        const token = jwt.sign({
            userId: user._id.toString()
        }, "this is a private key",{expiresIn:'25h'})

        res.setHeader("x-api-key", token)

       let obj={
        userId:user._id,
        token:token
       }

        res.status(200).send({ status: true, message:"User login successfull", data: obj})
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


const updateUser=async function(req,res){
    try {
        let userId = req.params.userId

        const files=req.files

        if(!keyValid(req.body)) return res.status(400).send({status:false,message:"Please Enter data to Create the User"})

        const{fname,lname,email,phone,password,address}=req.body

        const data = {}
        if(fname){
            if(!isValidName.test(fname)) return res.status(400).send({status:false,message:"Please Provide fname in valid formate and Should Starts with Capital Letter"})
            data.fname=fname
        }

        if(lname){
            if(!isValidName.test(lname)) return res.status(400).send({status:false,message:"Please Provide lname in valid formate and Should Starts with Capital Letter"})
            data.lname=lname
        }

        if(email){
            if(!validString(email)) return res.snd(400).send({status:false, message:"You cant send empty email. you have to fill or deselect"})
            if(!isvalidEmail.test(email)) return res.status(400).send({status:false,message:"email should be in  valid Formate"})
            if(await userModel.find({email})) return res.status(400).send({status:false,message:"This email is already Registered Please give another Email"})
            data.email = email
        }

        if(phone){
            if(!isvalidMobile.test(phone)) return res.status(400).send({status:false,message:"please provide Valid phone Number with 10 digits starts with 6||7||8||9"})
            if(await userModel.findOne({phone})) return res.status(400).send({status:false,message:"This Phone is already Registered Please give another Phone"})
            data.phone=phone
        }
        
        if(password){
            if(!isValidPassword(password)) return res.status(400).send({status:false,message:"please provide Valid password with 1st letter should be Capital letter and contains spcial character with Min length 8 and Max length 15"})
            data.password=await bcrypt.hash(password,10)
        }

        if(address){
            const addressParse=JSON.parse(address)
        
            if(addressParse.shipping){
                if(addressParse.shipping.street){
                    data.address.shipping.street=addressParse.shipping.street
                }
    
                if(addressParse.shipping.city){
                    data.address.shipping.city=addressParse.shipping.city
                }

                if(addressParse.shipping.pincode){
                    if(!pincodeValid.test(addressParse.shipping.pincode)) return res.status(400).send({status:false,message:"Please provide valid Pincode with min 4 number || max 6 number in Shipping"})
                    data.addressParse.shipping.pincode=addressParse.shipping.pincode
                }
            }          
            if(addressParse.billing){

                if(addressParse.billing.street){
                    data.address.billing.street=addressParse.billing.street
                }
    
                if(addressParse.billing.city){
                    data.address.billing.city=addressParse.billing.city
                }

                if(addressParse.billing.pincode){
                    if(!pincodeValid.test(addressParse.billing.pincode)) return res.status(400).send({status:false,message:"Please provide valid Pincode with min 4 number || max 6 number in billing"})
                    data.addressParse.billing.pincode=addressParse.billing.pincode
                }
            }
        }

        if(files.length==1){
            data.profileImage = await imgUpload.uploadFile(files[0])
        }

        const newUser = await userModel.findByIdAndUpdate(userId,data,{new:true})

        return res.status(201).send({ status: true, message:"User updated successfully", data: newUser })

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}

let getById = async (req, res) => {
    try {
        const UserIdData = req.params.userId

        if (!objectIdValid(UserIdData)) return res.status(400).send({ status: false, message: 'userId is not valid' })

        let user = await userModel.findById(UserIdData)

        if (!user) return res.status(404).send({ status: false, messgage: ' user not found' })

        return res.status(200).send({ status: true, message: 'User profile details', data: user })
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}


module.exports={createUser,loginUser,updateUser,getById}
