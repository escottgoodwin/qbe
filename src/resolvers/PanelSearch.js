function panels(parent, args, ctx, info) {
  return ctx.db.query.panels({ where: { id_in: parent.panelIds } }, info)
}

module.exports = {
  panels,
}
