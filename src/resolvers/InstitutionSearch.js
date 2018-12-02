function institutions(parent, args, ctx, info) {
  const { skip, first, orderBy } = parent.args1
  return ctx.db.query.institutions({ where: { id_in: parent.institutionIds }, skip, first, orderBy }, info)
}

module.exports = {
  institutions,
}
