function tests(parent, args, ctx, info) {
  const { skip, first, orderBy } = parent.args1
  return ctx.db.query.tests({ where: { id_in: parent.testIds }, skip, first, orderBy }, info)
}

module.exports = {
  tests,
}
