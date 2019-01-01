const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { APP_SECRET, getUserId, getUser } = require('../utils')
const util = require('util');
const moment = require('moment')

function checkField(itemIds) {
    if (itemIds) {
      if (Array.isArray(itemIds)) {
        return items = { connect: itemIds.map(x => ({id: x})) }
    } else {
      return items = []
    }
  }
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
}

function shuffleIds(itemIds) {
    if (itemIds) {
      if (Array.isArray(itemIds)) {
        const items = itemIds.map(x => x.id)
        const shuffled = shuffleArray(items)
        return shuffled
    } else {
      return items = []
    }
  }
}

function sendGridSend(msg){
  const sgMail = require('@sendgrid/mail');

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msgSg = {
    to: msg.to,
    from: 'quandria_help@quandria.com',
    subject:msg.subject,
    text: msg.text,
    html:msg.html,
    };

    sgMail.send(msgSg);
  }


async function signup(parent, args, ctx, info) {

  const signUpDate = new Date()

  const password = await bcrypt.hash(args.password, 10)

  const confirmationToken = await crypto.randomBytes(20).toString('hex')
  const tokenExpirationTime = signUpDate
  tokenExpirationTime.setHours(signUpDate.getHours() + 2);

  const user = await ctx.db.mutation.createUser({
    data: { ...args,
          password,
          signUpDate,
          confirmationToken,
          tokenExpirationTime,
          },
  }, `{ id firstName lastName email role confirmed }`)

  const htmlEmail =
    `<html>
    <head>
      <title>Confirm your email address</title>
    </head>
    <body>
      <p>Hi ${ user.firstName} ${ user.lastName },</p>
      <p><a href="https://example.com/reset?token=${confirmationToken}&email=${user.email}">Click here to confirm your email address.</a></p>
      <p>This token will expire in 2 hours.</p>
    </body>
    </html>`

  const msg = {
    to: args.email,
    subject: 'Confirm your email address',
    text: `Click on this link to resent your password https://example.com/reset?token=${confirmationToken}&email=${user.email} This token will expire in 2 hours.`,
    html: htmlEmail,
  };

  sendGridSend(msg)


  signUpRequestMsg = user.firstName + ' ' + user.lastName + ', thank you for signing up. We will send you an email confirmation. Once you confirm your email address, you will be able to login.'

  return {
    authMsg: signUpRequestMsg,
    user
  }

}

async function newPasswordRequest(parent, args, ctx, info) {

  const resetUser = await ctx.db.query.user( { where: { email: args.email } } ,
  `{ id }`)
  const ruser = JSON.stringify(resetUser)

  if (!resetUser) {
    throw new Error(`No such user found ${ruser}`)
  }

  const resetToken = await crypto.randomBytes(20).toString('hex')
  const now = new Date()
  const tokenExpirationTime = now
  tokenExpirationTime.setHours(tokenExpirationTime.getHours() + 2);
  // 2
  const userResetUpdate = await ctx.db.mutation.updateUser(
    {
      data: {
        resetToken,
        tokenExpirationTime,
      },
      where: {
        id: resetUser.id
      },
    },
    `{ id firstName lastName email }`
  )

  const htmlEmail =
    `<html>
    <head>
      <title>Reset your password</title>
    </head>
    <body>
      <p>Hi ${userResetUpdate.firstName} ${userResetUpdate.lastName},</p>
      <p><a href="https://example.com/reset?token=${resetToken}&email=${userResetUpdate.email}">Click here to reset your password.</a></p>
      <p>This token will expire in 2 hours.</p>
    </body>
    </html>`

  const msg = {
    to: userResetUpdate.email,
    subject: 'Reset password request',
    text: `Click on this link to reset your password https://example.com/reset?token=${resetToken}&email=${userResetUpdate.email} This token will expire in 2 hours.`,
    html: htmlEmail,
  };

  sendGridSend(msg)

  resetRequestMsg = userResetUpdate.firstName + ' ' + userResetUpdate.lastName + ', you have requested to reset your password. Please check for a reset email. Click the link in the email to reset your password.'

  return {
    authMsg: resetRequestMsg,
    user: userResetUpdate
  }

}

async function resetPassword(parent, args, ctx, info) {

  const now = new Date()

  const resetUser  = await ctx.db.query.users(
    {
      where: {
        email: args.email,
        resetToken: args.resetToken,
        tokenExpirationTime_gte: now
    }
  },
    `{ id email }`
  )

  if (resetUser.length<1) {
    throw new Error(`Email confirmation error. Please try again.`)
  }

  const password = await bcrypt.hash(args.resetPassword, 10)

  const userResetUpdate = await ctx.db.mutation.updateUser(
    {
      data: {
        password,
        resetToken: null,
        tokenExpirationTime: null,
      },
      where: {
        id: resetUser[0].id
      },
    },
    `{ id firstName lastName email }`
  )

  const htmlEmail =
    `<html>
    <head>
      <title>Your password has been reset</title>
    </head>
    <body>
      <p>Hi ${userResetUpdate.firstName} ${userResetUpdate.lastName},</p>
      <p>Your password has been reset.</a></p>
      <p>If this is an error, please login.</p>
    </body>
    </html>`

  const msg = {
    to: args.email,
    subject: 'Password reset',
    text: 'Your password has been reset. If this is an error, please report it.',
    html: htmlEmail,
  };

  sendGridSend(msg)

  resetRequestMsg = userResetUpdate.firstName + ' ' + userResetUpdate.lastName + ', you have reset your password. We will send you an email confirmation.'

  return {
    authMsg: resetRequestMsg,
    user: userResetUpdate
  }

}

async function confirmEmail(parent, args, ctx, info) {

  const now = new Date()

  const confirmUser1 = await ctx.db.query.users(
    {
      where: {
        email: args.email,
        confirmationToken: args.confirmationToken,
        tokenExpirationTime_gte: now
    }
  },
    `{ id }`
  )

  if (confirmUser1.length<1) {
    throw new Error(`Email confirmation error. Please try again.`)
  }

  const confirmUser = await ctx.db.mutation.updateUser(
    {
      data: {
        confirmed:true,
        confirmationToken: null,
        tokenExpirationTime: null,
      },
      where: {
        id: confirmUser1[0].id
      },
    },
    `{ id firstName lastName email role confirmed }`
  )

  const htmlEmail =
    `<html>
    <head>
      <title>Your account email has been confirmed</title>
    </head>
    <body>
      <p>Hi ${confirmUser.firstName} ${confirmUser.lastName},</p>
      <p>Please login: <a href="https://example.com/login">Login</a></p>
    </body>
    </html>`

  const msg = {
    to: args.email,
    subject: 'Account confirmed',
    text: 'Your account has been confirmed. Please login in at https://example.com/login',
    html: htmlEmail,
  };

  sendGridSend(msg)

  confirmRequestMsg = confirmUser.firstName + ' ' + confirmUser.lastName + ', your account has been confirmed. Please login <a href="https://example.com/login">Login</a>.'

  return {
    authMsg: confirmRequestMsg,
    user: confirmUser
  }

}

async function sendInvite(parent, args, ctx, info) {

  const userId = await getUserId(ctx)
  const invitesSentDate = new Date()

  const course = await ctx.db.query.course({where: { id: args.courseId } },`{ teachers { id } }`)
  const courseTeachers = JSON.stringify(course.teachers)
  console.log(userId, courseTeachers)

  if (courseTeachers.includes(userId)){

  async function sendInvite(email) {

      const inviteUser = await ctx.db.mutation.updateUser(
        {
          data: {
            invites:
            {
              connect: [{id: args.courseId}]
            }
          },
          where: {
            email: email
          },
        },
        `{ id firstName lastName email role  }`
      )

      const htmlEmail =
        `<html>
        <head>
          <title>Join Course</title>
        </head>
        <body>
          <p>Hi ${inviteUser.firstName} ${inviteUser.lastName},</p>
          <p><a href="https://example.com/login">Login</a> and accept invitation to join the course.</p>

        </body>
        </html>`

      const msg = {
        to: email,
        subject: 'Join Course',
        text: `Login and accept invitation to join the course. https://example.com/login`,
        html: htmlEmail,
      };

      sendGridSend(msg)

    }

    const email_arr = args.emails.split("\n")
    console.log(args.emails)
    console.log(email_arr)
    email_arr.map(email => (sendInvite(email)))

    const inviteCourse = await ctx.db.mutation.updateCourse(
      {
        where:{
          id: args.courseId
        },
        data:{
          invitesSentDate,
          invitesSentBy:{
            connect:{
              id:userId
            }
          }
        }
    },
      `{ id name courseNumber }`
    )



    invitationSentMsg = `${args.emails.length} course invitations were sent for ${inviteCourse.name} ${inviteCourse.courseNumber}.`

  return {
    authMsg: invitationSentMsg,
    user: 'userResetUpdate'
  }
}
  else
{
  throw new Error('You are not an authorized administrator for this course.')
}
}

async function joinCourse(parent, args, ctx, info) {
  //prevents unauthorized user from logging out - checks authorization token to get current userId
  const userId = await getUserId(ctx)

  if (!userId) {
    throw new Error('There has been a problem joining the course.')
  }

  const joinCourse = await ctx.db.mutation.updateCourse(
    {
      data: {
        students: {
          connect: [userId]
        }
      },
      where: {
        id: args.courseId,
      },
    },
    ` { id name courseNumber } `
  )

  //Be sure to remove the authorization token that you stored locally or in a session cookie.

  joinCourseMsg = `${joinUser.firstName} ${joinUser.lastName}, you have joined ${name} - ${courseNumber}.`

  return {
    authMsg: joinCourseMsg,
    course: joinCourse
  }
}

async function login(parent, args, ctx, info) {
  const lastLogin = new Date()

  const user = await ctx.db.query.user(
    {
      where: {
        email: args.email,
      }
    }, ` { id password firstName lastName role confirmed } ` )
  //` { id password firstName lastName role } `
  if (!user) {
    throw new Error('No such user found.')
  }

  if (!user.confirmed) {
    throw new Error('You have not confirmed your email account yet.')
  }

  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }

  const updateUser = await ctx.db.mutation.updateUser(
    {
      data: {
        lastLogin,
        online:true
      },
      where: {
        id: user.id,
      },
    },
    ` { id password firstName lastName role online teacherInstitutions { id name } studentInstitutions { id name } } `
  )

  loginMsg = updateUser.firstName + ' ' + updateUser.lastName + ', you have successfully logged in.'

  return {
    authMsg: loginMsg,
    token: jwt.sign({ userId: user.id }, APP_SECRET),
    user: updateUser,
  }
}

async function logout(parent, args, ctx, info) {
  //prevents unauthorized user from logging out - checks authorization token to get current userId
  const userId = await getUserId(ctx)
  if (!userId) {
    throw new Error('There has been a problem logging out.')
  }

  const updateUser = await ctx.db.mutation.updateUser(
    {
      data: {
        online:false
      },
      where: {
        id: userId,
      },
    },
    ` { id firstName lastName online } `
  )

  //Be sure to remove the authorization token that you stored locally or in a session cookie.

  logoutRequestMsg = `${updateUser.firstName} ${updateUser.lastName}, you have logged out.`

  return {
    authMsg: logoutRequestMsg,
    user: updateUser
  }
}

async function addInstitution(parent, { name, type }, ctx, info) {
  const userId = await getUserId(ctx)
  const addedDate = new Date()

  return await ctx.db.mutation.createInstitution(
    {
      data: {
        name,
        type,
        addedDate,
        addedBy: {
          connect: { id: userId },
        },
      },
    },
    info
  )

}

async function updateInstitution(parent, { id, name, type, contactIds, teacherIds, studentIds, adminIds, courseIds }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()

  const contacts = await checkField(contactIds)
  const teachers = await checkField(teacherIds)
  const courses = await checkField(courseIds)
  const students = await checkField(studentIds)
  const admins = await checkField(adminIds)


  const course = await ctx.db.query.institution({where: { id: id } },`{ admins { id } }`)
  const institutionAdmins = JSON.stringify(course.admins)

  if (institutionAdmins.includes(userId)){

      return await ctx.db.mutation.updateInstitution(
        {
          data: {
            name,
            type,
            updateDate,
            updatedBy: {
              connect: { id: userId  }
            },
            contacts,
            teachers,
            students,
            admins,
            courses,
          },
          where: {
            id: id
          },
        },
        info
      )
  }
}

async function deleteInstitution(parent, { id }, ctx, info) {

  return await ctx.db.mutation.deleteInstitution(
    {
      where: {
        id: id
      }
    },
    info
  )
}

async function addCourse(parent, { name, department1, courseNumber, time, deleted, institutionId }, ctx, info) {
  const userId = await getUserId(ctx)
  const addedDate = new Date()

  return await ctx.db.mutation.createCourse(
    {
      data: {
        name,
        department1,
        courseNumber,
        time,
        addedDate,
        deleted,
        institution: {
          connect: { id: institutionId  }
        },
        addedBy: {
          connect: { id: userId },
        },
        teachers: {
          connect: [{ id: userId }],
        },
      },
    },
    info
  )
}

async function updateCourse(parent, { id, name, department1, courseNumber, time, teacherIds, studentIds, deleted }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()

  const teachers = await checkField(teacherIds)
  const students = await checkField(studentIds)

  const course = await ctx.db.query.course({where: { id: id } },`{ teachers { id } }`)
  const courseTeachers = JSON.stringify(course.teachers)

  if (courseTeachers.includes(userId)){

      return await ctx.db.mutation.updateCourse(
        {
          data: {
            name,
            department1,
            courseNumber,
            time,
            teachers,
            students,
            updateDate,
            deleted,
            updatedBy: {
              connect: {
                id: userId
              },
            },
          },
          where: {
            id: id
          },
        },
        info
      )
  }
  throw new Error(`Unauthorized, must be a teacher for this course`)
}

async function deleteCourse(parent, { id }, ctx, info) {

  const userId = await getUserId(ctx)
  const course = await ctx.db.query.course({where: { id: id } },`{ teachers { id } }`)
  const courseTeachers = JSON.stringify(course.teachers)

  if (courseTeachers.includes(userId)) {

    return await ctx.db.mutation.deleteCourse(
      {
        where: {
          id: id
        }
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be a teacher for this course`)
}

async function addTest(parent, { subject, testNumber, testDate, courseId }, ctx, info) {
  const userId = await getUserId(ctx)
  const addedDate = new Date()

  return await ctx.db.mutation.createTest(
    {
      data: {
        subject,
        testNumber,
        testDate,
        addedDate,
        published: false,
        release: false,
        course: {
          connect: { id: courseId  }
        },
        addedBy: {
          connect: { id: userId },
        },
      },
    },
    info
  )
}

async function publishTest(parent, args, ctx, info) {
  const userId = await getUserId(ctx)
  const publishDate = new Date()
  const sequenceAddedDate = new Date()
  const testEndDate = moment(args.testEndDate).format()

  const test = await ctx.db.mutation.updateTest(
    {
      data: {
        published: true,
        publishDate,
        updateDate: publishDate,
        updatedBy: {
          connect: {
            id: userId
          },
        },
      },
      where: {
        id: args.id
    },
  },
  `{ id panels { id } course { students { id } } }`
  )
    // get all students for a course
  const studentIds = test.course.students
  const panelIds = test.panels
  const studentShuffle = shuffleArray(studentIds)
  const panelShuffle = shuffleArray(panelIds)
  const studentShuffleIds = studentShuffle.map(student => student.id)
  const panelShuffleIds = panelShuffle.map(panel => panel.id)


  return ctx.db.mutation.createSequence(
    {
      data: {
        sequenceAddedDate,
        addedBy:{
          connect: { id: userId  }
        },
        startHour:args.startHour,
        endHour:args.endHour,
        testEndDate,
        test: {
          connect: { id: args.id }
        },
        students: {
          connect: studentShuffle
        },
        panels: {
          connect: panelShuffle
          }
      },
    },
    info
  )

  return test

}

async function sendQuestion(parent, args, ctx, info) {
  const userId = await getUserId(ctx)
  const sequenceUpdateDate = new Date()

  const testSequence = await ctx.db.query.sequences({where:{test:{id:args.id}}},`{ id students { id } panels { id } usedStudents { id } usedPanels { id } } `)

  let students = testSequence[0].students.map(student => student)
  let panels = testSequence[0].panels.map(panel => panel)
  const testId = testSequence[0].id
  var usedStudents = testSequence[0].usedStudents.map(student => student)
  var usedPanels = testSequence[0].usedPanels.map(panel => panel)

  var studentShuffle = null
  var sendToStudent = null

  var sendToPanel = null
  var panelShuffle = null

  if (students.length > 0) {
    var sendToStudent = students.pop()
    var studentShuffle = students
      console.log('sent to', sendToStudent)
      console.log('rest of students',studentShuffle)
      console.log('no shuffle')
  } else {

    var studentShuffle = shuffleArray(usedStudents)
    var sendToStudent = studentShuffle.pop()
    console.log('sent to',sendToStudent)
    console.log('rest of students',students)
    console.log('shuffled')
  }

  if (panels.length > 0) {
      var sendToPanel = panels.pop()
      var panelShuffle = panels
      console.log('send panel',sendToPanel)
      console.log('rest of panels',panelShuffle)
      console.log('no shuffle')

  } else {

      var panelShuffle = shuffleArray(usedPanels)
      var sendToPanel = studentPanel.pop()
      console.log('send panel',sendToPanel)
      console.log('rest of panels',panelShuffle)
      console.log('shuffled')
    }

    const sequence = ctx.db.mutation.updateSequence(
    {
      data: {
        students: {
          connect: studentShuffle
        },
        panels: {
          connect: panelShuffle
        },
        usedStudents: {
          connect: [sendToStudent]
        },
        usedPanels: {
          connect: [sendToPanel]
        },
        sentTo: {
          connect: sendToStudent
        },
        sentPanel: {
          connect: sendToPanel
        }
      },
      where: {
        id: testId
    },
    },
    `{ sentPanel { link } sentTo { firstName lastName email pushToken }  }`
  )

  console.log(sequence)
  return sequence

}


async function updateTest(parent, { id, deleted, subject, testNumber, testDate, published, publishDate, release, releaseDate }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()

  const test = await ctx.db.query.test({where: { id: id } },`{ course { teachers { id } } }`)
  const testTeachers = JSON.stringify(test.course)

  if (testTeachers.includes(userId)){

    return await ctx.db.mutation.updateTest(
      {
        data: {
          deleted,
          subject,
          testNumber,
          testDate,
          published,
          publishDate,
          release,
          releaseDate,
          updateDate,
          updatedBy: {
            connect: {
              id: userId
            },
          },
        },
        where: {
          id: id
      },
    },
      info
    )
  }
  throw new Error(`Unauthorized, must be a teacher for this test`)
}

async function deleteTest(parent, { id }, ctx, info) {

  const userId = await getUserId(ctx)
  const test = await ctx.db.query.test({where: { id: id } },`{ course { teachers { id } } }`)
  const testTeachers = JSON.stringify(test.course)

  if (testTeachers.includes(userId)){

    return await ctx.db.mutation.deleteTest(
      {
        where: {
          id: id
        }
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be a teacher for this test`)
}

async function addPanel(parent, { link, testId }, ctx, info) {
  const userId = await getUserId(ctx)
  const addedDate = new Date()

  const test = await ctx.db.query.test({where: { id: testId } },`{ course { teachers { id } } }`)
  const testTeachers = JSON.stringify(test.course)

  if (testTeachers.includes(userId)){

    return await ctx.db.mutation.createPanel(
      {
        data: {
          link,
          addedDate,
          test: {
            connect: { id: testId  }
          },
          addedBy: {
            connect: { id: userId },
          },
        },
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be a teacher for this test`)
}

async function deletePanel(parent, { id }, ctx, info) {

  const userId = await getUserId(ctx)
  const panel = await ctx.db.query.panel({where: { id: id } },`{ test { course { teachers { id } } } } `)
  const testTeachers = JSON.stringify(panel.test.course)

  if (testTeachers.includes(userId)){

    return await ctx.db.mutation.deletePanel(
      {
        where: {
          id: id
        }
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be a teacher for this panel`)
}

async function addResponseImage(parent, args , ctx, info) {
  const userId = await getUserId(ctx)
  const addedDate = new Date()

  return await ctx.db.mutation.createResponseImage(
    {
      data: {
        ...args,
        addedDate,
        addedBy: {
          connect: { id: userId },
        },
      },
    },
    info
  )

}

async function updateResponseImage(parent, args, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()

  return await ctx.db.mutation.updateResponseImage(
    {
      data: {
        ...args,
        updateDate,
        updatedBy: {
          connect: { id: userId  }
        },
      },
      where: {
        id: args.id
      },
    },
    info
  )
}

async function deleteResponseImage(parent, { id }, ctx, info) {

  return await ctx.db.mutation.deleteResponseImage(
    {
      where: {
        id: id
      }
    },
    info
  )
}

async function addQuestion(parent, { question, testId, panelId, sentToId, correctResponseImageId, incorrectResponseImageId,  }, ctx, info) {

  const userId = await getUserId(ctx)
  const addedDate = new Date()
  const expirationTime = addedDate
  expirationTime.setHours(expirationTime.getHours() + 1)

  const test = await ctx.db.query.test({where: { id: testId } },`{ course { students { id } } }`)
  const testStudents = JSON.stringify(test.course.students)

  if (testStudents.includes(userId)){
    return await ctx.db.mutation.createQuestion(
      {
        data: {
          question,
          expirationTime,
          addedDate,
          test: {
            connect: { id: testId  }
          },
          panel: {
            connect: { id: panelId  }
          },
          sentTo: {
            connect: { id: sentToId  }
          },
          addedBy: {
            connect: { id: userId },
          }
        },
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be a student for this test`)
}

async function updateQuestion(parent, { id, question, sentToId, correctResponseId, incorrectResponseId, }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()
  const questionExists = await ctx.db.exists.Question({
    id,
    addedBy: { id: userId },
  })
  if (!questionExists) {
    throw new Error(`Unauthorized, you are not the author of this question`)
  }

  return await ctx.db.mutation.updateQuestion(
    {
      data: {
        question,
        sentTo: {
          connect: { id: sentToId  }
        },
        correctResponseImage: {
          connect: { id: correctResponseImageId  }
        },
        incorrectResponseImage: {
          connect: { id: incorrectResponseImageId  }
        },
        updateDate,
        updatedBy: {
          connect: {
            id: userId
          },
        },
      },
      where: {
        id: id
        }
    },
    info
  )

}

async function deleteQuestion(parent, { id }, ctx, info) {

  const userId = await getUserId(ctx)

  const questionExists = await ctx.db.exists.Question({
    id,
    addedBy: { id: userId },
  })
  if (!questionExists) {
    throw new Error(`Unauthorized, you are not the author of this question`)
  }

  return await ctx.db.mutation.deleteQuestion(
    {
      where: {
        id: id
      }
    },
    info
  )

}

async function addQuestionChoice(parent, { choice, correct, questionId }, ctx, info) {
  const userId = await getUserId(ctx)
  const addedDate = new Date()

  const questionExists = await ctx.db.exists.Question({
    id: questionId,
    addedBy: { id: userId },
  })
  if (!questionExists) {
    throw new Error(`Unauthorized, you are not the author of this question`)
  }

  return await ctx.db.mutation.createQuestionChoice(
    {
      data: {
        choice,
        correct,
        addedDate,
        addedBy: {
          connect: { id: userId },
        },
        question: {
          connect: { id: questionId },
        }
      },
    },
    info
  )

}

async function updateQuestionChoice(parent, { id, choice, correct }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()
  // query question(id) if userId === addedBy
  const questionExists = await ctx.db.exists.QuestionChoice({
    id,
    addedBy: { id: userId },
  })
  if (!questionExists) {
    throw new Error(`Unauthorized, you are not the author of this question`)
  }

  return await ctx.db.mutation.updateQuestionChoice(
    {
      data: {
        choice,
        correct,
        updateDate,
        updatedBy: {
          connect: {
            id: userId
          },
        },
      },
      where: {
        id: id
      },
    },
    info
  )

}

async function deleteQuestionChoice(parent, { id }, ctx, info) {
  const userId = await getUserId(ctx)
  // query question(id) if userId === addedBy
  const questionExists = await ctx.db.exists.QuestionChoice({
    id,
    addedBy: { id: userId },
  })
  if (!questionExists) {
    throw new Error(`Unauthorized, you are not the author of this question`)
  }

  return await ctx.db.mutation.deleteQuestionChoice(
    {
      where: {
        id: id
      }
    },
    info
  )

}

async function addChallenge(parent, { challenge, questionId }, ctx, info) {
  const userId = await getUserId(ctx)
  const addedDate = new Date()

  const test = await ctx.db.query.question({where: { id: questionId } },` { addedBy { id } sentTo { id } test { course { teachers { id }  } } } `)
  const challengers = JSON.stringify(test)

  if (challengers.includes(userId)){

    return await ctx.db.mutation.createChallenge(
      {
        data: {
          challenge,
          addedDate,
          addedBy: {
            connect: { id: userId },
          },
          question: {
            connect: { id: questionId  }
          }
        },
      },
      info
    )
  }
  throw new Error(`Unauthorized, you are not the authorized to challenge this question`)
}

async function updateChallenge(parent, { id, challenge }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()

  const challengeExists = await ctx.db.exists.Challenge({
    id,
    addedBy: { id: userId },
  })
  if (!challengeExists) {
    throw new Error(`Unauthorized, you are not the author`)
  }

  return await  ctx.db.mutation.updateChallenge(
    {
      data: {
        challenge,
        updateDate,
        updatedBy: {
          connect: {
            id: userId
          },
        },
      },
      where: {
        id: id
      },
    },
    info
  )
}

async function deleteChallenge(parent, { id }, ctx, info) {
  const userId = await getUserId(ctx)
  const challengeExists = await ctx.db.exists.Challenge({
    id,
    addedBy: { id: userId },
  })
  if (!challengeExists) {
    throw new Error(`Unauthorized, you are not the author`)
  }

  return await ctx.db.mutation.deleteChallenge(
    {
      where: {
        id: id
      }
    },
    info
  )
}

async function addAnswer(parent, { answerChoiceId, questionId }, ctx, info) {
  const userId = await getUserId(ctx)
  const addedDate = new Date()

  const answerExists = await ctx.db.exists.Question({
    id: questionId,
    sentTo: { id: userId },
  })
  if (!answerExists) {
    throw new Error(`Unauthorized, this question wasn't sent to you`)
  }

  const questionChoice = await ctx.db.query.questionChoice(
  { where: { id: answerChoiceId } },
  ` { correct } `,
)
  if(questionChoice.correct){
    answerCorrect = true
  } else {
    answerCorrect = false
  }
    return ctx.db.mutation.createAnswer(
      {
        data: {
          answerCorrect,
          addedDate,
          addedBy: {
            connect: { id: userId },
          },
          answer: {
            connect: { id: answerChoiceId  }
          },
          question: {
            connect: { id: questionId  }
          },
        },
      },
      info
    )

}

async function deleteAnswer(parent, { id }, ctx, info) {
  const userId = await getUserId(ctx)
  const answerExists = await ctx.db.exists.Answer({
    id,
    addedBy: { id: userId },
  })
  if (!answerExists) {
    throw new Error(`Unauthorized, you are not the author`)
  }

  return await ctx.db.mutation.deleteAnswer(
    {
      where: {
        id: id
      }
    },
    info
  )

}

async function addSequence(parent, { testId, studentIds, panelIds }, ctx, info) {
  const userId = await getUserId(ctx)
  const sequenceAdded = new Date()

  const studentObjs = await studentIds.map(x => ({id: x}));
  const panelIds = await panelIds.map(x => ({id: x}));

  return ctx.db.mutation.createSequence(
    {
      data: {
        sequenceAdded,
        test: {
          connect: { id: testId  }
        },
        students: {
          connect: studentObjs,
        },
        panels: {
          connect: panelIds
        },
      },
    },
    info
  )
}

async function updateSequence(parent, { id, studentIds,  panelIds, usedStudentIds,  usedPanelIds }, ctx, info) {
  const userId = await getUserId(ctx)
  const sequenceAdded = new Date()

  const students = await checkField(studentIds)
  const panels = await checkField(panelIds)
  const usedStudents = await checkField(usedStudentIds)
  const usedPanels = await checkField(usedPanelIds)

  return await ctx.db.mutation.updateSequence(
    {
      data: {
        students,
        panels,
        usedStudents,
        usedPanels
      },
      where: {
        id: id
      },
    },
    info
  )
}

async function deleteSequence(parent, { id }, ctx, info) {

  return await ctx.db.mutation.deleteSequence(
    {
      where: {
        id: id
      }
    },
    info
  )
}

async function updateUser(parent,  {
      email,
      salutation,
      firstName,
      lastName,
      institution,
      adminInstitution,
      teacherInstitutions,
      studentInstitutions,
      studentIds,
      teacherIds,
      phone,
      online,
      }, ctx, info) {

  const userId = await getUserId(ctx)

  const teacherInstitutions1 = await checkField(teacherInstitutions)
  const studentInstitutions1 = await checkField(studentInstitutions)

  const updateDate = new Date()

  return await ctx.db.mutation.updateUser(
    {
      data: {
        email,
        salutation,
        firstName,
        lastName,
        adminInstitution:{
          connect: { id: adminInstitution }
        },
        teacherInstitutions: teacherInstitutions1,
        studentInstitutions: studentInstitutions1,
        institution: {
          connect: { id: institution }
        },
        studentIds,
        teacherIds,
        phone,
        online,
        updateDate
      },
      where: {
        id: userId
    },
  },
    info
  )

}


module.exports = {
  signup,
  newPasswordRequest,
  resetPassword,
  confirmEmail,
  login,
  logout,
  addInstitution,
  updateInstitution,
  deleteInstitution,
  addCourse,
  updateCourse,
  deleteCourse,
  joinCourse,
  sendInvite,
  addTest,
  updateTest,
  deleteTest,
  addPanel,
  deletePanel,
  addResponseImage,
  updateResponseImage,
  deleteResponseImage,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addQuestionChoice,
  updateQuestionChoice,
  deleteQuestionChoice,
  addChallenge,
  updateChallenge,
  deleteChallenge,
  addAnswer,
  deleteAnswer,
  addSequence,
  updateSequence,
  deleteSequence,
  publishTest,
  sendQuestion,
  updateUser
}
