function answers(parent, args, ctx, info) {
  const { skip, first, orderBy } = parent.args1
  return ctx.db.query.answers({ where: { id_in: parent.answerIds }, skip, first, orderBy }, info)
}

module.exports = {
  answers,
}
