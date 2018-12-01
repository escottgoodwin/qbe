function questionchoices(parent, args, ctx, info) {
  return ctx.db.query.questionChoices({ where: { id_in: parent.questionChoiceIds } }, info)
}

module.exports = {
  questionchoices,
}
