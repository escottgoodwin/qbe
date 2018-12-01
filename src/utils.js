require('dotenv').config();
const jwt = require('jsonwebtoken')

APP_SECRET = process.env.APP_SECRET

function getUserId(context) {
  const Authorization = context.request.get('Authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const { userId } = jwt.verify(token, APP_SECRET)
    return userId
  }

  throw new Error('Not authenticated')
}

async function getUser(context) {
  const userId = getUserId(context)
  const user = context.db.query.user({ where: { id: userId } })

  if (user) {
    return user
  }
  throw new Error('No user')
}


module.exports = {
  APP_SECRET,
  getUserId,
  getUser,
}
