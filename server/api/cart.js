const router = require('express').Router()
const {Product, Order, OrderItem} = require('../db/models')
module.exports = router

router.get('/', async (req, res, next) => {
  try {
    const cart = await Order.findOne({
      where: {
        userId: req.session.passport.user,
        orderStatus: 'Cart'
      },
      include: Product
    })
    res.json(cart)
  } catch (err) {
    next(err)
  }
})

router.put('/checkout', async (req, res, next) => {
  try {
    const cart = await Order.findOne({
      where: {
        userId: req.session.passport.user,
        orderStatus: 'Cart'
      },
      include: Product
    })
    cart.update({orderStatus: 'Received'})
    for (let i = 0; i < cart.products.length; i++) {
      cart.products[i].quantity = 0
    }
    await cart.save()
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
})

router.put('/delete/:productId', async (req, res, next) => {
  try {
    const orderItem = await OrderItem.findOne({
      where: {
        productId: req.params.productId
      }
    })
    console.log(orderItem)
    await orderItem.update({productId: null})
    await orderItem.update({orderId: null})

    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
})