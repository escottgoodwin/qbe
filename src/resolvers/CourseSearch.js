function courses(parent, args, ctx, info) {
  return ctx.db.query.courses({ where: { id_in: parent.courseIds } }, info)
}

module.exports = {
  courses,
}
