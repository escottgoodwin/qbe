function answers(parent, args, ctx, info) {
  return ctx.db.query.answers({ where: { id_in: parent.answerIds } }, info)
}

module.exports = {
  answers,
}
