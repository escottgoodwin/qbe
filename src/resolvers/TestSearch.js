function tests(parent, args, ctx, info) {
  const args1 = parent.args1
  return ctx.db.query.tests({ where: { id_in: parent.testIds }, skip: args1.skip, first: args1.first, orderBy: args1.orderBy }, info)
}

module.exports = {
  tests,
}
