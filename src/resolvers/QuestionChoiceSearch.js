function questionchoices(parent, args, ctx, info) {
  const args1 = parent.args1
  return ctx.db.query.questionChoices({ where: { id_in: parent.questionChoiceIds }, skip: args.skip, first: args.first, orderBy: args.orderBy }, info)
}

module.exports = {
  questionchoices,
}
