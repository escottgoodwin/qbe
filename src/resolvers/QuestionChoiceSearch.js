function questionchoices(parent, args, ctx, info) {
  const { skip, first, orderBy } = parent.args1
  return ctx.db.query.questionChoices({ where: { id_in: parent.questionChoiceIds }, skip, first, orderBy }, info)
}

module.exports = {
  questionchoices,
}
