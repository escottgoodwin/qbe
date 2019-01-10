const { getUserId, getUser, getUserRole } = require('../utils')

async function users(parent, args, ctx, info) {

  const where = args.where

  const where1 = args.filter
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
    { where },
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
      args1: args
    }

}

async function user(parent, args, ctx, info) {

    return await ctx.db.query.user( { where: { id: args.id } },info )
}

async function institutions(parent, args, ctx, info) {

  const where = args.where

  const where1 = args.filter
      ? {
          OR: [
            { id: args.filter },
            { name_contains: args.filter },
            { type: args.filter },
          ],
        }
      : {}

      const queriedInstitutions = await ctx.db.query.institutions(
      { where },
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
        args1: args
      }

}

async function institution(parent, args, ctx, info) {

      return await ctx.db.query.institution( { where: { id: args.id } },info,)

}

async function courses(parent, args, ctx, info) {

    const where = args.where

    const where1 = args.filter
        ? {
            OR: [
              { id: args.filter },
              { name_contains: args.filter },
              { courseNumber_contains: args.filter }
            ],
          }
        : {}

    const queriedCourses = await ctx.db.query.courses(
    { where },
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
      args1: args
    }
}

async function course(parent, args, ctx, info) {

      return await ctx.db.query.course( { where: { id: args.id } },info,)

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

  async function userStat(userId, testId, firstName, lastName){

      const answersConnection = await ctx.db.query.answersConnection({ where: { addedBy: { id: userId }, answer: { question: { test: { id: testId } } } } },
        countSelectionSet)

      const answersCorrectConnection = await ctx.db.query.answersConnection({ where: { addedBy: { id: userId }, answer: { question: { test: { id: testId } } }, answerCorrect: true } },
        countSelectionSet)

      const questionCorrectPercent = answersCorrectConnection.aggregate.count / answersConnection.aggregate.count

      function qpercent(qpercent){
        if (qpercent > 0){ return qpercent } else { return 0.0 }
      }

      const percentCorrect = qpercent(questionCorrectPercent)

      return {
        name: firstName + ' ' + lastName,
        total: answersConnection.aggregate.count,
        totalCorrect: answersCorrectConnection.aggregate.count,
        percentCorrect: percentCorrect,
      }
    }

    const course = await ctx.db.query.course( { where: { id: args.courseId } },`{ students { id firstName lastName } }`)

    const statslist = course.students.map(student => (userStat(student.id,args.testId,student.firstName,student.lastName)))
    return statslist

}

async function testQuestionStats(parent, args, ctx, info) {

      const questionsAnswers = await ctx.db.query.questions({ where: { test: { id: args.testId } } }, `{ question panel { link } questionAnswers { answer { correct } } }` )

      const questionPercents = questionsAnswers.map(question =>
        ({
          question: question.question,
          panelLink: question.panel.link,
          total: question.questionAnswers.length,
          totalCorrect: question.questionAnswers.filter(answer => answer.answer.correct).length,
          percentCorrect: (question.questionAnswers.filter(answer => answer.answer.correct).length / question.questionAnswers.length) > 0 ? question.questionAnswers.filter(answer => answer.answer.correct).length / question.questionAnswers.length : 0.0,
          })
      )

      return questionPercents

}

async function tests(parent, args, ctx, info) {

  const where = args.where

  const where1 = args.filter
      ? {
          OR: [
            { id: args.filter },
            { subject_contains: args.filter },
            { testNumber_contains: args.filter },
          ],
        }
      : {}


      const queriedTests = await ctx.db.query.tests(
      { where },
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
        args1: args
      }
}

async function test(parent, args, ctx, info) {

      return await ctx.db.query.test( { where: { id: args.id } },info,)

}

async function panels(parent, args, ctx, info) {

  const where = args.where

  const where1 = args.filter
      ? {
          OR: [
            { id: args.filter },
            { link: args.filter },
          ],
        }
      : {}

      const queriedPanels = await ctx.db.query.panels(
      { where },
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
        args1: args
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

async function responseImages(parent, args, ctx, info) {

  const where = args.where

  const where1 = args.filter
      ? {
          OR: [
            { id: args.filter },
            { question_contains: args.filter },
          ],
        }
      : {}

      const queriedResponseImages = await ctx.db.query.responseImages(
      { where },
      `{ id }`,
    )

      const countSelectionSet = `
        {
          aggregate {
            count
          }
        }
      `

      const responseImages = await ctx.db.query.responseImagesConnection({ where }, countSelectionSet)

      return {
        count: responseImages.aggregate.count,
        responseImageIds: queriedResponseImages.map(question => question.id),
        args1: args
      }
}

async function questions(parent, args, ctx, info) {

  const where = args.where

  const where1 = args.filter
      ? {
          OR: [
            { id: args.filter },
            { question_contains: args.filter },
          ],
        }
      : {}

      const queriedQuestions = await ctx.db.query.questions(
      { where },
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
        args1: args
      }
}

async function question(parent, args, ctx, info) {

      return await ctx.db.query.question( { where: { id: args.id } },info,)

}

async function questionchoices(parent, args, ctx, info) {

  const where = args.where

  const where1 = args.filter
      ? {
          OR: [
            { id: args.filter },
            { choice_contains: args.filter },
          ],
        }
      : {}

      const queriedQuestionChoices = await ctx.db.query.questionChoices(
      { where },
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
        args1: args
      }
}

async function challenges(parent, args, ctx, info) {

  const where = args.where

  const where1 = args.filter
      ? {
          OR: [
            { id: args.filter },
            { challenge_contains: args.filter },
          ],
        }
      : {}

      const queriedChallenges = await ctx.db.query.challenges(
      { where },
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
        args1: args
      }
}

async function challenge(parent, args, ctx, info) {

      return await ctx.db.query.challenge( { where: { id: args.id } },info,)

}

async function challengeMessages(parent, args, ctx, info) {

  const where = args.where

  const where1 = args.filter
      ? {
          OR: [
            { id: args.filter },
            { challengeMessage_contains: args.filter },
          ],
        }
      : {}

      const queriedChallengeMessages = await ctx.db.query.challengeMessages(
      { where },
      `{ id }`,
    )

      const countSelectionSet = `
        {
          aggregate {
            count
          }
        }
      `
      const challengeMessagesConnection = await ctx.db.query.challengeMessagesConnection({ where }, countSelectionSet)

      return {
        count: challengeMessagesConnection.aggregate.count,
        challengeMessageIds: queriedChallengeMessages.map(challengeMessage => challengeMessage.id),
        args1: args
      }
}

async function answers(parent, args, ctx, info) {

  const where = args.where

  const where1 = args.filter
      ? {
          OR: [
            { id: args.filter },
          ],
        }
      : {}

      const queriedAnswers = await ctx.db.query.answers(
      { where },
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
        args1: args
      }
}

async function answer(parent, args, ctx, info) {

      return await ctx.db.query.answer( { where: { id: args.id } },info,)

}

async function sequences(parent, args, ctx, info) {

  const where = args.where

  const where1 = args.filter
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
  user,
  institutions,
  institution,
  courses,
  course,
  tests,
  test,
  testStats,
  userTestStats,
  testQuestionStats,
  panels,
  responseImages,
  questions,
  question,
  questionStats,
  questionchoices,
  challenges,
  challenge,
  challengeMessages,
  answers,
  answer,
  sequences
}
