function questions(parent, args, ctx, info) {
  const { skip, first, orderBy } = parent.args1
  return ctx.db.query.questions({ where: { id_in: parent.questionIds }, skip, first, orderBy }, info)
}

module.exports = {
  questions,
}
