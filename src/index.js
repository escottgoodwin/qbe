require('dotenv').config()
const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const Mutation = require('./resolvers/Mutation')
const Query = require('./resolvers/Query')
const { directiveResolvers } = require("./directives")

const resolvers = {
  Query,
  Mutation,
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
