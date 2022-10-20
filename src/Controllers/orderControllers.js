const { isValidObjectId } = require("mongoose");
const cartModel = require("../Models/cartModel");
const orderModel = require("../Models/orderModel");
const userModel = require("../Models/userModel");
const { keyValid, isValid } = require("../Validator/validation");


exports.createOrder = async function (req, res) {
    try {
        const userId = req.params.userId;
        if (!isValidObjectId(userId))
            return res.status(400).send({ status: false, message: `The given userId: ${userId} is not in proper format` });

        // finding user details
        const findUser = await userModel.findOne({ _id: userId })
        if (!findUser)
            return res.status(404).send({ status: false, message: `User details not found with this provided userId: ${userId}` });

        const data = req.body;
        let { cartId, paymentMode, paymentOption, paymentStatus} = data;

        //checking for the empty body
        if (!keyValid(data))
            return res.status(400).send({ status: true, message: "Request body cannot remain empty" });

        // validation for cartId
        if (!isValid(cartId)) return res.status(400).send({ status: false, message: "CartId is required" });
        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: `The given cartId: ${cartId} is not in proper format` });

        if (!isValid(paymentMode)) return res.status(400).send({ status: false, message: "payment Mode is required" });
        let Index = ["cashOnDelivery", "onlinePayment"];
        if (Index.indexOf(paymentMode) == -1)
            return res.status(400).send({ status: false, message: "Please provide paymentMode from these options only ('cashOnDelivery', 'onlinePayment')" })

        //authorization
        if (req.decodedToken != userId)
            return res.status(403).send({ status: false, message: "Error, authorization failed" });

        // finding cart details
        const findCart = await cartModel.findOne({ _id: cartId, userId: userId });
        if (!findCart)
            return res.status(404).send({ status: false, message: `Cart details are not found with the cartId: ${cartId}` });

        if (paymentMode == "onlinePayment") {
            if (!isValid(paymentOption)) return res.status(400).send({ status: false, message: "If you have choosen onlinepayment then provide the key as paymentOption and the value should be non Empty String with upi or net netBanking" });
            let Index = ["upi", "netBanking"];
            if (Index.indexOf(paymentOption) == -1)
                return res.status(400).send({ status: false, message: "Please provide Mode from these options only ('upi', 'netBanking')" })
            paymentMode = paymentOption
            paymentStatus = "completed"       
            var link=`https://p.paytm.me/xCTH/2ftsei4a`

        }

        // if cart exist => getting the total number of quantity of products
        if (findCart) {
            let array = findCart.items
            var count = 0;
            for (let i = 0; i < array.length; i++) {
                if (array[i].quantity) {
                    count += findCart.items[i].quantity;
                }
            }
        }

        // for no products in the items or cart
        if (findCart.items.length == 0)
            return res.status(400).send({ status: false, message: "You have not added any products in your cart" });



        let response = {
            userId: findCart.userId,
            items: findCart.items,
            totalPrice: findCart.totalPrice,
            totalItems: findCart.totalItems,
            totalQuantity: count,
            paymentMode, paymentStatus,
            Address:`Order is Placed To This address ${findUser.address}`
        };

        // creating the order
        const orderCreated = await orderModel.create(response)
        let { _doc } = orderCreated
        delete (_doc.isDeleted)
        delete (_doc.__v)
        delete (_doc.createdAt)
        delete (_doc.updatedAt)


        // just to update the cart DB after order is placed
        await cartModel.findOneAndUpdate({ _id: cartId, userId: userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } }, { new: true });
        return res.status(201).send({ status: true, message: 'Success', data: {..._doc,"Payment link":link }});

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


exports.updateOrder = async function (req, res) {
    try {
        const userId = req.params.userId;
        const data = req.body;
        const { orderId, orderStatus } = data;

        //checking for the empty body
        if (!keyValid(data))
            return res.status(400).send({ status: false, message: "Please provide data in the request body" })

        // validation for userId
        if (!isValidObjectId(userId))
            return res.status(400).send({ status: false, message: `The given userId: ${userId} is not in proper format` });


        // finding user details
        const findUser = await userModel.findById(userId);
        if (!findUser)
            return res.status(404).send({ status: false, message: `User details not found with this provided userId: ${userId}` });

        // Authorization 
        if (req.decodedToken != userId)
            return res.status(403).send({ status: false, message: "Error, authorization failed" });

        // validation for orderId
        if (!isValid(orderId))
            return res.status(400).send({ status: false, message: "OrderId is Required" });
        if (!isValidObjectId(orderId))
            return res.status(400).send({ status: false, message: "The given orderId is not in proper format" });


        // finding order details
        const findOrder = await orderModel.findOne({ _id: orderId, userId: userId })
        if (!findOrder)
            return res.status(404).send({ status: false, message: `Order details is not found with the given OrderId: ${userId}` })


        if (findOrder.cancellable == true) {
            if (!isValid(orderStatus))
                return res.status(400).send({ status: false, message: "Status is required and the fields will be 'completed' || 'cancelled' only  " });

            // enum validation
            let statusIndex = ["completed", "cancelled"];
            if (statusIndex.indexOf(orderStatus) == -1)
                return res.status(400).send({ status: false, message: "Please provide orderStatus from these options only ('completed' or 'cancelled')" });


            if (orderStatus == 'completed') {
                if (findOrder.orderStatus == 'pending') {
                    const updateStatus = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: { orderStatus: orderStatus } }, { new: true }).select({ isDeleted: 0, deletedAt: 0 })

                    return res.status(200).send({ status: true, message: 'Success', data: updateStatus });
                }
                if (findOrder.orderStatus == 'completed') {
                    return res.status(400).send({ status: false, message: "Your order is already completed" });
                }
                if (findOrder.orderStatus == 'cancelled') {
                    return res.status(400).send({ status: false, message: "Your order is cancelled, so you cannot change the status " });
                }
            }

            if (orderStatus == 'cancelled') {
                if (findOrder.orderStatus == 'pending') {
                    const updateStatus = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: { orderStatus: orderStatus } }, { new: true }).select({ isDeleted: 0, deletedAt: 0 })

                    return res.status(200).send({ status: true, message: 'Success', data: updateStatus });
                }
                if (findOrder.orderStatus == 'completed') {
                    return res.status(400).send({ status: false, message: "Your order is already completed" });
                }
                if (findOrder.orderStatus == 'cancelled') {
                    return res.status(400).send({ status: false, message: "Your order is already cancelled" });
                }
            }
        }

        if (findOrder.cancellable == false) {

            if (!isValid(orderStatus))
                return res.status(400).send({ status: false, message: "Status is required and the fields will be 'completed' || 'cancelled' only  " });

            let statusIndex = ["completed", "cancelled"];
            if (statusIndex.indexOf(orderStatus) == -1)
                return res.status(400).send({ status: false, message: "Please provide orderStatus from these options only ( 'completed' or 'cancelled')" });

            if (orderStatus == 'completed') {
                if (findOrder.orderStatus == 'pending') {
                    const updateStatus = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: { orderStatus: orderStatus } }, { new: true }).select({ isDeleted: 0, deletedAt: 0 })

                    return res.status(200).send({ status: true, message: 'Success', data: updateStatus });
                }
                if (findOrder.orderStatus == 'completed') {
                    return res.status(400).send({ status: false, message: "The orderStatus is already completed" });
                }
                if (findOrder.orderStatus == 'cancelled') {
                    return res.status(400).send({ status: false, message: "The orderStatus is cancelled, you cannot change the orderStatus" });
                }
            }

            if (orderStatus == 'cancelled') {
                return res.status(400).send({ status: false, message: "You can't cancel the order as it is not cancellable" })
            }
        }

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

