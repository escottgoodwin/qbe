function answers(parent, args, ctx, info) {
  const args1 = parent.args1
  return ctx.db.query.answers({ where: { id_in: parent.answerIds }, skip: args.skip, first: args.first, orderBy: args.orderBy }, info)
}

module.exports = {
  answers,
}
