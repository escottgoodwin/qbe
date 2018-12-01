function users(parent, args, ctx, info) {
  return ctx.db.query.users({ where: { id_in: parent.userIds } }, info)
}

module.exports = {
  users,
}
