function panels(parent, args, ctx, info) {
  const { skip, first, orderBy } = parent.args1
  return ctx.db.query.panels({ where: { id_in: parent.panelIds }, skip, first, orderBy }, info)
}

module.exports = {
  panels,
}
