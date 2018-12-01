function institutions(parent, args, ctx, info) {
  return ctx.db.query.institutions({ where: { id_in: parent.institutionIds } }, info)
}

module.exports = {
  institutions,
}
