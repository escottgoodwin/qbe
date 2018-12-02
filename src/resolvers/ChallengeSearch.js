function challenges(parent, args, ctx, info) {
  const args1 = parent.args1
  return ctx.db.query.challenges({ where: { id_in: parent.challengeIds }, skip: args.skip, first: args.first, orderBy: args.orderBy }, info)
}

module.exports = {
  challenges,
}
