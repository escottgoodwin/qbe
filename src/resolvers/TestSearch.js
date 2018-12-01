function tests(parent, args, ctx, info) {
  return ctx.db.query.tests({ where: { id_in: parent.testIds } }, info)
}

module.exports = {
  tests,
}
