function users(parent, args, ctx, info) {
  const args1 = parent.args1
  return  ctx.db.query.users({ where: { id_in: parent.userIds }, skip: args1.skip, first: args1.first, orderBy: args1.orderBy }, info)
}

module.exports = {
  users,
}
