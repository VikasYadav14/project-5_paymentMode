const productModel = require('../Models/productModel')

const { isValid, keyValid, priceValid, validString, objectIdValid } = require('../Validator/validation')

const imgUpload = require("../AWS/aws-S3")
const { isValidObjectId } = require('mongoose')


const createProduct = async function (req, res) {
    try {
        const data = req.body
        const files = req.files

        if (!isValid(files)) return res.status(400).send({ status: false, message: "Please Enter data to Create the Product" })

        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

        if (!isValid(title)) return res.status(400).send({ status: false, message: "Title is mandatory and should have non empty String" })

        if (await productModel.findOne({ title })) return res.status(400).send({ status: false, message: "The Title is already present please Give another Title" })

        if (!isValid(description)) return res.status(400).send({ status: false, message: "description is mandatory and should have non empty String" })

        if (!isValid(price)) return res.status(400).send({ status: false, message: "Price is mandatory and should have non empty Number" })

        if (!priceValid(price)) return res.status(400).send({ status: false, message: "price should be in  valid Formate with Numbers || Decimals" })

        if (!isValid(currencyId)) return res.status(400).send({ status: false, message: "currencyId is Mandatory and should have non empty Number " })

        if (!/^INR$/.test(currencyId)) return res.status(400).send({ status: false, message: `currencyId Should be in this form 'INR' only` })

        if (!isValid(currencyFormat)) return res.status(400).send({ status: false, message: "currencyFormat is mandatory and should have non empty string" })

        if (!/^₹$/.test(currencyFormat)) return res.status(400).send({ status: false, message: `currencyFormat Should be in this form '₹' only` })

        if (!validString(isFreeShipping)) return res.status(400).send({ status: false, message: "isFreeShipping should have non empty" })
        if (isFreeShipping) {
            if (!/^(true|false)$/.test(isFreeShipping)) return res.status(400).send({ status: false, message: `isFreeShipping Should be in boolean with small letters` })
        }

        if (!keyValid(files)) return res.status(400).send({ status: false, message: "product Image is Mandatory" })

        if (!validString(style)) return res.status(400).send({ status: false, message: "Style should have non empty String" })

        if (!isValid(availableSizes)) return res.status(400).send({ status: false, message: "availableSizes is mandatory and should have non empty String" })

        let size = availableSizes.split(',').map(x => x.trim())

        for (let i = 0; i < size.length; i++) {
            if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size[i]))) return res.status(400).send({ status: false, message: `availableSizes should have only these Sizes ['S' || 'XS'  || 'M' || 'X' || 'L' || 'XXL' || 'XL']` })
        }

        if (!validString(installments)) return res.status(400).send({ status: false, message: "installments should have non empty Number" })
        if (installments) {
            if (!/^\d+$/.test(installments)) return res.status(400).send({ status: false, message: "installments should have only Number" })
        }

        let productImage1 = await imgUpload.uploadFile(files[0])

        let obj = {
            title, description, price, currencyId, currencyFormat, isFreeShipping, productImage: productImage1, style, availableSizes: size, installments
        }

        const newProduct = await productModel.create(obj)

        return res.status(201).send({ status: true, message: "User created successfully", data: newProduct })

    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

async function getProducts(req, res) {
    try {
        let filter = req.query;
        let query = { isDeleted: false };


        if (keyValid(filter)) {
            let { name, size, priceSort, priceGreaterThan, priceLessThan } = filter;

            if (!validString(size)) { return res.status(400).send({ status: false, message: "If you select size than it should have non empty" }) }
            if (size) {
                size = size.toUpperCase()
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size))) return res.status(400).send({ status: false, message: `availableSizes should have only these Sizes ['S' || 'XS'  || 'M' || 'X' || 'L' || 'XXL' || 'XL']` })
                query.availableSizes = size
            }

            if (!validString(name)) return res.status(400).send({ status: false, message: "If you select name than it should have non empty" })
            if (name) {
                const regexName = new RegExp(name, "i");
                query.title = { $regex: regexName };
            }

            if (!validString(priceGreaterThan)) return res.status(400).send({ status: false, message: "If you select priceGreaterThan than it should have non empty" })
            if (priceGreaterThan) {
                if (!priceValid(priceGreaterThan)) { return res.status(400).send({ status: false, messsage: "Enter a valid price in priceGreaterThan" }) }
                query.price = { '$gt': priceGreaterThan }
            }

            if (!validString(priceLessThan)) return res.status(400).send({ status: false, message: "If you select priceLessThan than it should have non empty" })
            if (priceLessThan) {
                if (!priceValid(priceLessThan)) { return res.status(400).send({ status: false, messsage: "Enter a valid price in priceLessThan" }) }
                query['price'] = { '$lt': priceLessThan }
            }
            if (priceLessThan && priceGreaterThan) {
                query.price = { '$lte': priceLessThan, '$gte': priceGreaterThan }
            }

            if (!validString(priceSort)) return res.status(400).send({ status: false, message: "If you select priceSort than it should have non empty" })
            if (priceSort) {
                if ((priceSort == 1 || priceSort == -1)) {
                    let filterProduct = await productModel.find(query).sort({ price: priceSort })

                    if (filterProduct.length == 0) {
                        return res.status(404).send({ status: false, message: "No products found with this query" })
                    }
                    return res.status(200).send({ status: true, message: "Success", "number of products": filterProduct.length, data: filterProduct })
                }
                return res.status(400).send({ status: false, message: "priceSort must have 1 or -1 as input" })
            }
        }

        let data = await productModel.find(query).sort({ price: -1 });

        if (data.length == 0) {
            return res.status(404).send({ status: true, message: "No products found with this query" });
        }

        return res.status(200).send({ status: true, message: "Success", "number of products": data.length, data })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

async function deleteProductById(req, res) {
    try {
        let productId = req.params.productId
        if(!isValidObjectId(productId)) return res.status(400).send({ status: false, message: 'productId is not valid' })
        let data = await productModel.findOne({_id:productId,isDeleted:false})
        if(!data) return res.status(404).send({ status: true, message: "No products found or may be deleted already" });

        await productModel.findByIdAndUpdate(productId,{isDeleted:true,deletedAt:Date()})
        return res.status(200).send({ status: true, message: "Deleted Successfully" });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createProduct, getProducts ,deleteProductById}