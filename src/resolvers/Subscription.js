const newJob = {
  subscribe: (parent, args, ctx, info) => {
    return ctx.db.subscription.job(
      // https://github.com/graphcool/prisma/issues/1734
      // { where: { mutation_in: ['CREATED'] } },
      { },
      info,
    )
  },
}


module.exports = {
  newLink,
}
