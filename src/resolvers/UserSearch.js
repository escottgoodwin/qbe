function users(parent, args, ctx, info) {
  const { skip, first, orderBy } = parent.args1
  return  ctx.db.query.users({ where: { id_in: parent.userIds }, skip, first, orderBy }, info)
}

module.exports = {
  users,
}
