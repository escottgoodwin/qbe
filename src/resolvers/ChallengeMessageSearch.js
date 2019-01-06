function challengeMessages(parent, args, ctx, info) {
  const { skip, first, orderBy } = parent.args1
  return ctx.db.query.challengeMessages({ where: { id_in: parent.challengeMessageIds }, skip, first, orderBy }, info)
}

module.exports = {
  challengeMessages,
}
