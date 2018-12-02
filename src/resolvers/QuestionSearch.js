function questions(parent, args, ctx, info) {
  const args1 = parent.args1
  return ctx.db.query.questions({ where: { id_in: parent.questionIds }, skip: args.skip, first: args.first, orderBy: args.orderBy }, info)
}

module.exports = {
  questions,
}
