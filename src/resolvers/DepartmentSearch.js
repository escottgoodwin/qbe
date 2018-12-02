function departments(parent, args, ctx, info) {
  const { skip, first, orderBy } = parent.args1
  return ctx.db.query.departments({ where: { id_in: parent.departmentIds }, skip, first, orderBy }, info)
}

module.exports = {
  departments,
}
