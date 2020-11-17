const router = require('express').Router()
const {User} = require('../db/models')

const adminsOnly = (req,res,next) => {
  if (!req.user.isAdmin) {
    const err = new Error('No access.')
    err.status = 401
    return next(err)
  }
  next()
}

router.get('/', adminsOnly, async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: {exclude: ['password', 'email', 'firstName', 'lastName', 'isAdmin']
    }})
    res.json(users)
  } catch (err) {
    next(err)
  }
})

router.put('/:userId', async (req, res, next) => {
  try {
    const users = await User.findOne({
      where: {
        id: req.params.userId
      }
    })
  } catch (err) {
    next(err)
  }
})

// convert to async / await to match coding styling of project
router.delete('/:userid', adminsOnly, (req, res, next) => { 
  req.User.destroy()
   .then(() => {
     res.status(204).end()
   })
   .catch(next) 
 })
 

// router.delete('/:userid', adminsOnly, (req, res, next) => { 
//   try {
//    const users = await User.destroy({
//       where: {
//         id: req.params.id
//       }
      
//     })
//     res.sendStatus(204)
//   } catch (err) {
//     next(err)
//   }
// })
module.exports = router