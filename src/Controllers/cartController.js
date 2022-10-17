const { isValidObjectId } = require("mongoose");
const cartModel = require("../Models/cartModel");
const productModel = require("../Models/productModel");
const userModel = require("../Models/userModel");
const { isValid, keyValid } = require("../Validator/validation");


async function addToCart(req, res) {
    try {
        let userId = req.params.userId
        let decodedToken = req.decodedToken
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid UserId" })

        if (userId !== decodedToken) return res.status(403).send({ status: false, messgage: "Unauthorized access!, You can't create or add to other user cart" })

        let checkUserId = await userModel.findById(userId)
        if (!checkUserId) return res.status(404).send({ status: false, message: "UserId Do Not Exits" })

        let { productId, cartId } = req.body
        if (!keyValid(req.body)) return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" })

        if (!isValid(productId)) return res.status(400).send({ status: false, message: "Please Provide ProductId" })
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid ProductId" })
        let checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProduct) return res.status(404).send({ status: false, message: "Product Do Not Exists or DELETED" })

        let checkCart = await cartModel.findOne({ userId })

        if (checkCart) {
            if (!isValid(cartId)) return res.status(400).send({ status: false, message: "Please Provide cartId" })
            if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Invalid ProductId" })
            if (checkCart._id != cartId) return res.status(403).send({ status: false, message: "you are not authorized for this cartId" })

            let arr2 = checkCart.items

            let productAdded = {
                productId: productId,
                quantity: 1
            }

            let compareProductId = arr2.findIndex((obj) => obj.productId == productId)

            if (compareProductId == -1) arr2.push(productAdded)
            else arr2[compareProductId].quantity += 1

            let totalPriceUpdated = checkCart.totalPrice + (checkProduct.price)

            let totalItemsUpdated = arr2.length

            let productAdd = {
                items: arr2,
                totalPrice: totalPriceUpdated,
                totalItems: totalItemsUpdated
            }
            let updatedData = await cartModel.findOneAndUpdate({ userId: userId }, productAdd, { new: true })
            return res.status(201).send({ status: true, message: "Success", data: updatedData })
        }
        let arr1 = []

        let products = {
            productId: productId,
            quantity: 1
        }
        arr1.push(products)

        let totalPriceCalculated = checkProduct.price * products.quantity

        let productAdd = {
            userId: userId,
            items: arr1,
            totalPrice: totalPriceCalculated,
            totalItems: 1
        }
        let createdData = await cartModel.create(productAdd)
        return res.status(201).send({ status: true, message: "Success", data: createdData })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { addToCart }
