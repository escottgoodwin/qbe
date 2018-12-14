function responseImages(parent, args, ctx, info) {
  const { skip, first, orderBy } = parent.args1
  return ctx.db.query.responseImages({ where: { id_in: parent.responseImageIds }, skip, first, orderBy }, info)
}

module.exports = {
  responseImages,
}
