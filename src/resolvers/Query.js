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



    const queriedUsers = await ctx.db.query.users(
    { where, skip: args.skip, first: args.first, orderBy: args.orderBy },
    `{ id firstName lastName salutation}`,
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
            { name_contains: args.filter },
            { type: args.filter },
          ],
        }
      : {}

      const queriedInstitutions = await ctx.db.query.institutions(
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
      const institutionsConnection = await ctx.db.query.institutionsConnection( {where}, countSelectionSet)

      return {
        count: institutionsConnection.aggregate.count,
        institutionIds: queriedInstitutions.map(institution => institution.id),
      }

}

async function departments(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { name_contains: args.filter },
            { type_contains: args.filter },
          ],
        }
      : {}

      const queriedDepartments = await ctx.db.query.departments(
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
      const departmentsConnection = await ctx.db.query.departmentsConnection( { where }, countSelectionSet)

      return {
        count: departmentsConnection.aggregate.count,
        departmentIds: queriedDepartments.map(department => department.id),
      }
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
    const coursesConnection = await ctx.db.query.coursesConnection({ where }, countSelectionSet)

    return {
      count: coursesConnection.aggregate.count,
      courseIds: queriedCourses.map(course => course.id),
    }
}

async function testStats(parent, args, ctx, info) {

      const countSelectionSet = `
        {
          aggregate {
            count
          }
        }
      `

      const answersConnection = await ctx.db.query.answersConnection({ where: { answer:{ question: { test: { id: args.testId } } } } }, countSelectionSet)
      const answersCorrectConnection = await ctx.db.query.answersConnection({ where: { answer: { question:{ test:{ id: args.testId } } }, answerCorrect: true } }, countSelectionSet)
      const questionCorrectPercent = answersCorrectConnection.aggregate.count / answersConnection.aggregate.count

      return {
        total: answersConnection.aggregate.count,
        totalCorrect: answersCorrectConnection.aggregate.count,
        //percentCorrect: questionCorrectPercent,
      }
}

async function userTestStats(parent, args, ctx, info) {

      const countSelectionSet = `
        {
          aggregate {
            count
          }
        }
      `

      const answersConnection = await ctx.db.query.answersConnection({ where: { addedBy: { id: args.userId }, answer: { question: { test: { id: args.testId } } } } },
        countSelectionSet )

      const answersCorrectConnection = await ctx.db.query.answersConnection({ where: { addedBy: { id: args.userId }, answer: { question: { test: { id: args.testId } } }, answerCorrect: true } },
        countSelectionSet )

      const questionCorrectPercent = answersCorrectConnection.aggregate.count / answersConnection.aggregate.count

      return {
        total: answersConnection.aggregate.count,
        totalCorrect: answersCorrectConnection.aggregate.count,
        percentCorrect: questionCorrectPercent,
      }
}

async function tests(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { subject_contains: args.filter },
            { testNumber_contains: args.filter },
          ],
        }
      : {}


      const queriedTests = await ctx.db.query.tests(
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
      const testsConnection = await ctx.db.query.testsConnection({ where }, countSelectionSet)

      return {
        count: testsConnection.aggregate.count,
        testIds: queriedTests.map(test => test.id),
      }
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

      const queriedPanels = await ctx.db.query.panels(
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
      const panelsConnection = await ctx.db.query.panelsConnection({ where }, countSelectionSet)

      return {
        count: panelsConnection.aggregate.count,
        panelIds: queriedPanels.map(panel => panel.id),
      }
}

async function questionStats(parent, args, ctx, info) {

      const countSelectionSet = `
        {
          aggregate {
            count
          }
        }
      `

      const answersConnection = await ctx.db.query.answersConnection({ where: { question: { id: args.questionId } } }, countSelectionSet)
      const answersCorrectConnection = await ctx.db.query.answersConnection({ where: { question: { id: args.questionId }, answerCorrect: true } }, countSelectionSet)
      const questionCorrectPercent = answersCorrectConnection.aggregate.count / answersConnection.aggregate.count

      return {
        total: answersConnection.aggregate.count,
        totalCorrect: answersCorrectConnection.aggregate.count,
        percentCorrect: questionCorrectPercent,
      }
}

async function questions(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { question_contains: args.filter },
          ],
        }
      : {}

      const queriedQuestions = await ctx.db.query.questions(
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

      const questionsConnection = await ctx.db.query.questionsConnection({ where }, countSelectionSet)

      return {
        count: questionsConnection.aggregate.count,
        questionIds: queriedQuestions.map(question => question.id),
      }
}

async function questionchoices(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { choice_contains: args.filter },
          ],
        }
      : {}

      const queriedQuestionChoices = await ctx.db.query.questionChoices(
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
      const questionChoicesConnection = await ctx.db.query.questionChoicesConnection({ where }, countSelectionSet)

      return {
        count: questionChoicesConnection.aggregate.count,
        questionChoiceIds: queriedQuestionChoices.map(questionChoice => questionChoice.id),
      }
}

async function challenges(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { challenge_contains: args.filter },
          ],
        }
      : {}

      const queriedChallenges = await ctx.db.query.challenges(
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
      const challengesConnection = await ctx.db.query.challengesConnection({ where }, countSelectionSet)

      return {
        count: challengesConnection.aggregate.count,
        challengeIds: queriedChallenges.map(challenge => challenge.id),
      }
}

async function answers(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
          ],
        }
      : {}

      const queriedAnswers = await ctx.db.query.answers(
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
      const answersConnection = await ctx.db.query.answersConnection({ where }, countSelectionSet)

      return {
        count: answersConnection.aggregate.count,
        answerIds: queriedAnswers.map(answer => answer.id),
      }
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
  testStats,
  userTestStats,
  panels,
  questions,
  questionStats,
  questionchoices,
  challenges,
  answers,
  sequences
}
