function courses(parent, args, ctx, info) {
  const { skip, first, orderBy } = parent.args1
  return ctx.db.query.courses({ where: { id_in: parent.courseIds }, skip, first, orderBy }, info)
}

module.exports = {
  courses,
}
