function challenges(parent, args, ctx, info) {
  const args1 = parent.args1
  return ctx.db.query.challenges({ where: { id_in: parent.challengeIds }, { skip, first, orderBy } = parent.args1 }, info)
}

module.exports = {
  challenges,
}
