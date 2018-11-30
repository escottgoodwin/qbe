const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId, getUser } = require('../utils')
const util = require('util');

function checkField(itemIds) {
    if (itemIds) {
      if (Array.isArray(itemIds)) {
        return items = { connect: itemIds.map(x => ({id: x})) }
    } else {
      return items = []
    }
  }
}

async function signup(parent, args, ctx, info) {

  const signUpDate = new Date()

  const password = await bcrypt.hash(args.password, 10)
  // 2
  const user = await ctx.db.mutation.createUser({
    data: { ...args, password, signUpDate },
  }, `{ id }`)

  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  return {
    token,
    user,
  }
}

async function login(parent, args, ctx, info) {
  const lastLogin = new Date()

  const user = await ctx.db.query.user({ where: { email: args.email } }, ` { id password firstName lastName role } ` )

  if (!user) {
    throw new Error('No such user found')
  }

  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }

  return {
    token: jwt.sign({ userId: user.id }, APP_SECRET),
    user,
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

async function updateInstitution(parent, { id, name, type, contactIds, teacherIds, studentIds, courseIds }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()

  const contacts = await checkField(contactIds)
  const teachers = await checkField(teacherIds)
  const courses = await checkField(courseIds)
  const students = await checkField(studentIds)

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
        courses,
      },
      where: {
        id: id
      },
    },
    info
  )

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

async function addDepartment(parent, { name, type, institutionId }, ctx, info) {
  const userId = await getUserId(ctx)
  const addedDate = new Date()

  return await ctx.db.mutation.createDepartment(
    {
      data: {
        name,
        type,
        addedDate,
        addedBy: {
          connect: { id: userId },
        },
        institution: {
          connect: { id: institutionId },
        },
        admins: {
          connect: [{ id: userId  }]
        },
      },
    },
    info
  )

}

async function updateDepartment(parent, { id, name, type, teacherIds, courseIds, adminIds }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()

  const admins = await checkField(adminIds)
  const teachers = await checkField(teacherIds)
  const courses = await checkField(courseIds)

  const department = await ctx.db.query.department({where: { id: id } },`{ admins { id } }`)
  const departmentAdmins = JSON.stringify(department.admins)

  if (departmentAdmins.includes(userId)){

    return await ctx.db.mutation.updateDepartment(
      {
        data: {
          name,
          type,
          updateDate,
          updatedBy: {
            connect: { id: userId  }
          },
          admins,
          teachers,
          courses,
        },
        where: {
          id: id
        },
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be a admin for this department`)
}

async function deleteDepartment(parent, { id }, ctx, info) {
  const userId = await getUserId(ctx)
  const department = await ctx.db.query.department({where: { id: id } },`{ admins { id } }`)
  const departmentAdmins = JSON.stringify(department.admins)

  if (departmentAdmins.includes(userId)){

    return await ctx.db.mutation.deleteDepartment(
      {
        where: {
          id: id
        }
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be a admin for this department`)
}

async function addCourse(parent, { name, courseNumber, time, institutionId, departmentId }, ctx, info) {
  const userId = await getUserId(ctx)
  const addedDate = new Date()

  return await ctx.db.mutation.createCourse(
    {
      data: {
        name,
        courseNumber,
        time,
        addedDate,
        institution: {
          connect: { id: institutionId  }
        },
        institution: {
          connect: { id: departmentId  }
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

async function updateCourse(parent, { id, name, courseNumber, time, teacherIds, studentIds }, ctx, info) {
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
            courseNumber,
            time,
            teachers,
            students,
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

async function updateTest(parent, { id, subject, testNumber, testDate, published, publishDate, release, releaseDate }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()

  const test = await ctx.db.query.test({where: { id: id } },`{ course { teachers { id } } }`)
  const testTeachers = JSON.stringify(test.course)

  if (testTeachers.includes(userId)){

    return await ctx.db.mutation.updateTest(
      {
        data: {
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

async function addQuestion(parent, { question, testId, panelId, sentToId }, ctx, info) {

  const userId = await getUserId(ctx)
  const addedDate = new Date()
  const expirationTime = addedDate
  expirationTime.setHours(expirationTime.getHours() + 1);

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

async function updateQuestion(parent, { id, question, sentToId }, ctx, info) {
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

    return ctx.db.mutation.createAnswer(
      {
        data: {
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

async function updateUser(parent, args, ctx, info) {
  const userId = await getUserId(ctx)

  const teacherInstitution = await checkField(args.teacherInstitutionIds)
  const studentDepartment = await checkField(args.teacherDepartmentIds)
  const studentInstitution = await checkField(args.studentInstitutionIds)

  const updateDate = new Date()

  const userId = await getUserId(ctx)
  const userExists = await ctx.db.exists.User({
    id: userId
  })
  if (!userExists) {
    throw new Error(` Unauthorized, this is not your profile `)
  }

  return await ctx.db.mutation.updateUser(
    {
      data: {
        ...args,
        teacherInstitution,
        studentInstitution,
        studentDepartment,
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
  login,
  addInstitution,
  updateInstitution,
  deleteInstitution,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  addCourse,
  updateCourse,
  deleteCourse,
  addTest,
  updateTest,
  deleteTest,
  addPanel,
  deletePanel,
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
  updateUser
}
