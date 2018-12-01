const { getUserId, getUser } = require('./utils')

const isLoggedIn = ctx => {
  const user = getUser(ctx)
  if (!user) throw new Error(`Not logged in`)
  return user
}

const isRequestingUserAlsoOwner = ({ ctx, userId, type, typeId }) =>
  ctx.db.exists[type]({ id: typeId, user: { id: userId } })

const isRequestingUser = ({ ctx, userId }) => ctx.db.exists.User({ id: userId })

const directiveResolvers = {
  isAuthenticated: (next, source, args, ctx) => {
    isLoggedIn(ctx)
    return next()
  },
  hasRole: async (next, source, {roles}, ctx) => {
    const user = await getUser(ctx)
    const role = user.role
    const roles_list = roles.toString()
    if (roles.includes(role)) {
      return next()
    }
    throw new Error(`Must have roles: ${roles_list}, you have role: ${user.role}`)
  },
  isOwner: async (source, { type }, ctx) => {
    const userId = await getUserId(ctx)
    console.log(source)
    const owned = ctx.db.exists[type]({ id: source.id, addedBy: { id: userId} })
    if (owned) {
      return next()
    }
    throw new Error(`Unauthorized, must be owner`)
  },
  isOwnerOrHasRole: async (next, source, { roles, type }, ctx, ...p) => {
    const { id: userId, role } = isLoggedIn(ctx)
    if (roles.includes(role)) {
      return next()
    }

    const { id: typeId } = ctx.request.body.variables
    const isOwner = await isRequestingUserAlsoOwner({
      ctx,
      userId,
      type,
      typeId
    })

    if (isOwner) {
      return next()
    }
    throw new Error(`Unauthorized, not owner or incorrect role`)
  }
}

module.exports = { directiveResolvers }
