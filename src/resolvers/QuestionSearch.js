function questions(parent, args, ctx, info) {
  return ctx.db.query.questions({ where: { id_in: parent.questionIds } }, info)
}

module.exports = {
  questions,
}
