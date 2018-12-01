const { getUserId, getUser, getUserRole } = require('../utils')

async function users(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { firstName_contains: args.filter },
            { lastName_contains: args.filter },
            { phone_contains: args.filter },
            { email_contains: args.filter }
          ],
        }
      : {}

    //return await ctx.db.query.users({ where }, info)

    const queriedUsers = await ctx.db.query.users(
    { where, skip: args.skip, first: args.first, orderBy: args.orderBy },
    `{ id }`,
  )

    const countSelectionSet = `
      {
        aggregate {
          count
        }
      }
    `
    const usersConnection = await ctx.db.query.usersConnection( {where: where}, countSelectionSet)

    return {
      count: usersConnection.aggregate.count,
      userIds: queriedUsers.map(course => course.id),
    }

}

async function institutions(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { name: args.filter },
            { type: args.filter },
          ],
        }
      : {}

    return await ctx.db.query.institutions({ where }, info)
}

async function departments(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { name: args.filter },
            { type: args.filter },
          ],
        }
      : {}

    return await ctx.db.query.departments({ where }, info)
}

async function courses(parent, args, ctx, info) {

    const where = args.filter
        ? {
            OR: [
              { id: args.filter },
              { name_contains: args.filter },
              { courseNumber_contains: args.filter }
            ],
          }
        : {}

    const queriedCourses = await ctx.db.query.courses(
    { where, skip: args.skip, first: args.first, orderBy: args.orderBy },
    `{ id }`,
  )

    const countSelectionSet = `
      {
        aggregate {
          count
        }
      }
    `
    const coursesConnection = await ctx.db.query.coursesConnection({}, countSelectionSet)

    return {
      count: coursesConnection.aggregate.count,
      courseIds: queriedCourses.map(course => course.id),
    }
}

async function tests(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { subject: args.filter },
            { testNumber: args.filter },
          ],
        }
      : {}


    return await ctx.db.query.tests({ where }, info)
}

async function panels(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { link: args.filter },
          ],
        }
      : {}

    return await ctx.db.query.panels({ where }, info)
}

async function questions(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { question: args.filter },
          ],
        }
      : {}

    return await ctx.db.query.questions({ where }, info)
}

async function questionchoices(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { choice: args.filter },
          ],
        }
      : {}

    return await ctx.db.query.questionChoices({ where }, info)
}

async function challenges(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { challenge: args.filter },
          ],
        }
      : {}

    return await ctx.db.query.challenges({ where }, info)
}

async function answers(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
          ],
        }
      : {}

    return await ctx.db.query.answers({ where }, info)
}

async function sequences(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
          ],
        }
      : {}

    return await ctx.db.query.sequences({ where }, info)
}


module.exports = {
  users,
  institutions,
  departments,
  courses,
  tests,
  panels,
  questions,
  questionchoices,
  challenges,
  answers,
  sequences
}
