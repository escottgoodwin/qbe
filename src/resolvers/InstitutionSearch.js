function institutions(parent, args, ctx, info) {
  const args1 = parent.args1
  return ctx.db.query.institutions({ where: { id_in: parent.institutionIds }, skip: args1.skip, first: args1.first, orderBy: args1.orderBy }, info)
}

module.exports = {
  institutions,
}
