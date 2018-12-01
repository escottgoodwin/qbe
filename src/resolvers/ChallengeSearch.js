function challenges(parent, args, ctx, info) {
  return ctx.db.query.challenges({ where: { id_in: parent.challengeIds } }, info)
}

module.exports = {
  challenges,
}
