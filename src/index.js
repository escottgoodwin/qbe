require('dotenv').config()
const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const Mutation = require('./resolvers/Mutation')
const Query = require('./resolvers/Query')
const Subscription = require('./resolvers/Subscription')
const CourseSearch = require('./resolvers/CourseSearch')
const UserSearch = require('./resolvers/UserSearch')
const InstitutionSearch = require('./resolvers/InstitutionSearch')
const TestSearch = require('./resolvers/TestSearch')
const PanelSearch = require('./resolvers/PanelSearch')
const ResponseImageSearch = require('./resolvers/ResponseImageSearch')
const QuestionSearch = require('./resolvers/QuestionSearch')
const QuestionChoiceSearch = require('./resolvers/QuestionChoiceSearch')
const ChallengeSearch = require('./resolvers/ChallengeSearch')
const ChallengeMessageSearch = require('./resolvers/ChallengeMessageSearch')
const AnswerSearch = require('./resolvers/AnswerSearch')

const { directiveResolvers } = require("./directives")

const resolvers = {
  Query,
  Mutation,
  Subscription: {
    challengeMsg: {
      subscribe: (parent, args, ctx, info) => {
        return ctx.db.subscription.challengeMessage(
          { where:{
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
          info
        );
      }
    }
  },
  CourseSearch,
  UserSearch,
  InstitutionSearch,
  TestSearch,
  PanelSearch,
  QuestionSearch,
  QuestionChoiceSearch,
  ChallengeSearch,
  ChallengeMessageSearch,
  AnswerSearch,
  Node: {
    __resolveType() {
      return null;
    }
  }
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  directiveResolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: process.env.PRISMA_SERVER,
      secret: process.env.PRISMA_SECRET,
      debug: true
    }),
  }),
})

server.start(() => console.log('Server is running on http://localhost:4000'))
