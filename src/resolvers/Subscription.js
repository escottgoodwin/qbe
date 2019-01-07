function newChallengeMessageSubscribe(parent, args, ctx, info) {
    return  ctx.db.subscribe.challengeMessage({ where:{
      AND: [
        {
          mutation_in: ["CREATED"]
        },
        {
        node: {
          challenge: {
            id: args.challengeId
            }
          }
        }
      ] }
    },
    `{ node { challengeMessage addedBy challenge { challenge addedBy } } }`
  )
}


const newChallengeMessage = {
    subscribe: (parent, args, ctx, info) => { ctx.db.subscribe.challengeMessage({ where:
        {
          mutation_in: [CREATED]
        }
      },
      `{ node { challengeMessage addedBy challenge { challenge addedBy } } }`
    )
  }
}

module.exports = {
  newChallengeMessage,
}
