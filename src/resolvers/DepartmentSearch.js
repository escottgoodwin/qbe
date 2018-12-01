function departments(parent, args, ctx, info) {
  return ctx.db.query.departments({ where: { id_in: parent.departmentIds } }, info)
}

module.exports = {
  departments,
}
