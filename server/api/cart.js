const router = require('express').Router()
const {Product, Order, OrderItem} = require('../db/models')
module.exports = router

router.get('/', async (req, res, next) => {
  try {
    const cart = await Order.findOne({
      where: {
        userId: req.session.passport.user,
        status: 'Cart'
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
        status: 'Cart'
      },
      include: Product
    })
    await Order.create({
      userId: req.session.passport.user,
      status: 'Received',
      address: cart.address,
      paymentInfo: cart.paymentInfo
    })
    const cartItems = cart.products
    for (let i = 0; i < cart.products.length; i++) {
      cartItems[i].update({quantity: 0})
      const productId = cartItems[i].id
      const orderItem = await OrderItem.findByPk(productId)
      await orderItem.destroy()
    }
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
})

router.put(`/add/:productId`, async (req, res, next) => {
  try {
    const item = await Product.findOne({
      where: {
        id: req.params.productId
      }
    })
    item.update({onHold: true})
    const order = await Order.findOrCreate({
      where: {
        userId: req.session.passport.user,
        status: 'Cart'
      }
    })
    await OrderItem.create({
      productId: item.id,
      price: item.price,
      orderId: order[0].id
    })
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
})

router.put('/delete/:productId', async (req, res, next) => {
  try {
    const item = await Product.findOne({
      where: {
        id: req.params.productId
      }
    })
    item.update({onHold: false})
    const cart = await Order.findOne({
      where: {
        userId: req.session.passport.user,
        status: 'Cart'
      },
      include: Product
    })
    cart.update({
      products: cart.products.filter(
        product => product.id !== req.params.productId
      )
    })
    const orderItem = await OrderItem.findOne({
      where: {
        productId: req.params.productId
      }
    })
    orderItem.destroy()
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
})
