// The provided course information.
const todaysDate = "2025-09-05";

const CourseInfo = {
    id: 451,
    name: "Introduction to JavaScript"
};

// The provided assignment group.
const AssignmentGroup = {
    id: 12345,
    name: "Fundamentals of JavaScript",
    course_id: 451,
    group_weight: 25,
    assignments: [
        {
            id: 1,
            name: "Declare a Variable",
            due_at: "2023-01-25",
            points_possible: 50
        },
        {
            id: 2,
            name: "Write a Function",
            due_at: "2023-02-27",
            points_possible: 150
        },
        {
            id: 3,
            name: "Code the World",
            due_at: "3156-11-15",
            points_possible: 500
        }
    ]
};

// The provided learner submission data.
const LearnerSubmissions = [
    {
        learner_id: 125,
        assignment_id: 1,
        submission: {
            submitted_at: "2023-01-25",
            score: 47
        }
    },
    {
        learner_id: 125,
        assignment_id: 2,
        submission: {
            submitted_at: "2023-02-12",
            score: 150
        }
    },
    {
        learner_id: 125,
        assignment_id: 3,
        submission: {
            submitted_at: "2023-01-25",
            score: 400
        }
    },
    {
        learner_id: 132,
        assignment_id: 1,
        submission: {
            submitted_at: "2023-01-24",
            score: 39
        }
    },
    {
        learner_id: 132,
        assignment_id: 2,
        submission: {
            submitted_at: "2023-03-07",
            score: 140
        }
    }
];

function getLearnerData(course, ag, submissions) {
    const results = [];

    if (validateAssignments(ag, course.id) && validateCourse(course) && validateSubmissions(submissions)) {
        console.log("Everything is good!");
    }

    if (submissions) {
        for (let i = 0; i < submissions.length; i++) {
            const learnerSub = submissions[i];
            // console.log(learnerSub);
            let learnerObjIndex = findLearnerObj(results, learnerSub.learner_id);
            const aId = findAssignment(ag.assignments, learnerSub.assignment_id);
            if (learnerObjIndex === -1) { // If learnerObj does not exist, immediately initalize the first user

                const learnerObj = {};
                learnerObj.id = learnerSub.learner_id;
                learnerObj.totalScore = 0;
                learnerObj.totalPointsPossible = 0;
                results.push(learnerObj);
                learnerObjIndex = findLearnerObj(results, learnerSub.learner_id);
            }
            // Only add assignments that have close due dates.
            if (includeAssignment(ag.assignments[aId])) {
                const learnerObj = results[learnerObjIndex];
                if (aId >= 0) {
                    const score = isLate(ag.assignments[aId], learnerSub.submission.submitted_at) ? (learnerSub.submission.score - (ag.assignments[aId].points_possible * 0.1)) : learnerSub.submission.score;
                    const grade = score / ag.assignments[aId].points_possible;
                    learnerObj[learnerSub.assignment_id] = roundNum(grade);
                    learnerObj.totalScore += score;
                    learnerObj.totalPointsPossible += ag.assignments[aId].points_possible;
                }
            }
        };
    }

    calculateAvgs(results);
    return results;
}

// Round to the nearest 3 digits if needed.
function roundNum(number) {
    const numAsStr = String(number);
    if (numAsStr.includes(".")) {
        const numAsArr = numAsStr.split(".");
        if (numAsArr[1].length > 2) {
            return Number(number.toFixed(3));
        }
    }
    return number;
}

// Calculate all averages for results
function calculateAvgs(results) {
    if (results) {
        results.forEach(result => {
            const average = result.totalScore / result.totalPointsPossible;
            result.avg = roundNum(average);
            delete result.totalScore;
            delete result.totalPointsPossible;
        })
    }
}

// Check if assignment is late
function isLate(assignment, submissionDate) {
    return (submissionDate > assignment.due_at);
}

// Check if assignment is due yet
function includeAssignment(assignment) {
    return (todaysDate > assignment.due_at);
}

// Ensure that the month is between 1 - 12 and that the day of month can exist.
function isProperDate(dateStr) {
    try {
        if (!dateStr.includes("-")) {
            throw "";
        } else {
            const dateArr = dateStr.split("-");
            // Ex: ["2025", "09", "05"]
            if (dateArr[0].length != 4) {
                throw "Invalid year!";
            } else if (dateArr[1].length != 2) {
                throw "Invalid month format!";
            } else if (dateArr[2].length != 2) {
                throw "Invalid day format!";
            }
            const monthsArr = { "01": 31, "02": 29, "03": 31, "04": 30, "05": 31, "06": 30, "07": 31, "08": 31, "09": 30, "10": 31, "11": 31, "12": 31 };

            for (const monthNum in monthsArr) {
                if (dateArr[1] === monthNum) {
                    if (monthsArr[monthNum] < Number(dateArr[2])){
                        throw `Invalid day of ${dateArr[2]}! Month is ${monthNum}, so day must be between 01 and ${monthsArr[monthNum]}`;
                    }
                    return monthsArr[monthNum] >= Number(dateArr[2]);
                }
            }
            throw `Invalid month of ${dateArr[1]}! Month must be between 01 and 12.`;
        }

    } catch (error) {
        console.log(error);
    }
    return false;
}

console.log(isProperDate("2024-05-05"));
console.log(isProperDate("2024-05-45"));

// Returns the index of the assignment object with assignment_id = assignmentId
function findAssignment(assignments, assignmentId) {
    for (let i = 0; i < assignments.length; i++) {
        if (assignments[i].id == assignmentId) {
            return i;
        }
    }
    return -1;
}

// Returns the index of the learner object with id = learnerId
function findLearnerObj(resultsArray, learnerId) {
    if (resultsArray) {
        for (let i = 0; i < resultsArray.length; i++) {
            if (resultsArray[i].id == learnerId) {
                return i;
            }
        }
    }
    return -1;
}

function errorMsgUnexpected(category, variableName = "") {
    if (!variableName) {
        return `Unexpected error for the validation of ${category}!`;
    }
    return `Unexpected error for ${category}'s ${variableName} validation!`;
}

function errorMsgUndefined(category, variableName = "") {
    if (!variableName) {
        return `The ${category} must be defined!`;
    }
    return `The ${variableName} of ${category} must be defined!`;
}

function errorMsgWrongType(category, variableName = "", type, expectedType) {
    const vowels = ["a", "e", "i", "o", "u"];
    const aWord = vowels.includes(expectedType[0]) ? "an" : "a";
    if (!variableName) {
        return `The ${category} cannot be the type ${type}! Must be ${aWord} ${expectedType}.`;
    }
    return `The ${category}'s ${variableName} cannot be the type ${type}! Must be ${aWord} ${expectedType}.`;
}

function errorMsgNegativeValue(category, variableName, variable, additionalReason = "") {
    if (additionalReason) {
        return `The ${variableName} of ${category} is ${variable} and cannot be less than 1! ${additionalReason}`;
    }
    return `The ${variableName} of ${category} is ${variable} and cannot be less than 1!`;
}

function errorMsgFloatValue(category, variableName, variable) {
    return `The ${variableName} of ${category} is ${variable} and must be a whole number!`;
}

function errorMsgUnequalIds(category1, variableName, category2) {
    return `The ${variableName} of ${category1} is not equal to the ${variableName} of ${category2}!`;
}

// Error message for checking if two arrays are equal. Reason is why the arrays are not equal for error msgs.
function errorMsgUnequalArrays(arr1Name, arr2Name, reason) {
    if (!reason) {
        return `${arr1Name} and ${arr2Name} are unequal`;
    } else {
        return `${arr1Name} and ${arr2Name} are ${reason}`;
    }

}

// Validate that arr1 is equal to arr2.
function equalArrays(arr1, arr2) {
    if (!arr1 || !arr2) {
        return false;
    } else if ((arr1.length != arr2.length)) {
        return false;
    } else {
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] != arr2[i]) return false;
        }
    }
    return true;
}

// Checks if keys are equal to expected keys and gives a reason if they are not equal (reason is relative to keys).
function validateKeys(keys, expectedKeys) {
    if (!keys) {
        return "is undefined";
    } else if (keys.length > expectedKeys.length) {
        return "has extra keys";
    } else if (keys.length < expectedKeys.length) {
        return "is missing keys";
    } else {
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] != expectedKeys[i]) return `has the key ${keys[i]} instead of ${expectedKeys[i]}`;
        }
    }
    return "equal keys";
}

function validateCourse(course) {
    // TO-DO: Check if id, course_id, and group_weight a number. Check if name is a string.
    return true;
}

// If an AssignmentGroup does not belong to its course (mismatching course_id), your program should throw an error, letting the user know that the input was invalid. Similar data validation should occur elsewhere within the program.

// You should also account for potential errors in the data that your program receives. What if points_possible is 0? You cannot divide by zero. What if a value that you are expecting to be a number is instead a string? 

// Check the entire assignment group
function validateAssignments(assignmentGroup, courseId) {
    const category = "assignment group";
    try {
        if (!assignmentGroup) {
            throw (errorMsgUndefined(category));
        } else if (typeof assignmentGroup != 'object') {
            throw (errorMsgWrongType(category));
        } else { // Move onto other validation logic
            // Validate that the keys are properly named and that none of them are missing.
            try {
                const assignmentGroupKeys = ["id", "name", "course_id", "group_weight", "assignments"];
                const reason = validateKeys(Object.keys(assignmentGroup), assignmentGroupKeys);
                if (reason != "equal keys") {
                    throw (errorMsgUnequalArrays(`The keys for ${category}`, "expected keys for an assignment group", `different because this assignment group ${reason}`));
                };
            } catch (error) {
                console.log(error);
            }

            // Validate assignment group's id
            try {
                if (!assignmentGroup.id) {
                    throw (errorMsgUndefined(category, "id"));
                } else if (typeof assignmentGroup.id != "number") {
                    throw (errorMsgWrongType(category, "id", typeof assignmentGroup.id));
                } else if (assignmentGroup.id < 1) {
                    throw (errorMsgNegativeValue(category, "id", assignmentGroup.id));
                } else if (assignmentGroup.id % 1) {
                    throw (errorMsgFloatValue(category, "id", assignmentGroup.id));
                }
            } catch (error) {
                console.log(error);
            }

            // Validate assignment group's name
            try {
                if (!assignmentGroup.name) {
                    throw (errorMsgUndefined(category, "name"));
                } else if (typeof assignmentGroup.name != "string") {
                    throw (errorMsgWrongType(category, "name", typeof assignmentGroup.name));
                }
            } catch (error) {
                console.log(error);
            }

            // Validate assignment group's course id
            try {
                if (!assignmentGroup.course_id) {
                    throw (errorMsgUndefined(category, "course id"));
                } else if (typeof assignmentGroup.course_id != "number") {
                    throw (errorMsgWrongType(category, "course id", typeof assignmentGroup.course_id));
                } else if (assignmentGroup.course_id < 1) {
                    throw (errorMsgNegativeValue(category, "course id", assignmentGroup.course_id));
                } else if (assignmentGroup.course_id % 1) {
                    throw (errorMsgFloatValue(category, "course id", assignmentGroup.course_id));
                } else if (assignmentGroup.course_id != courseId) {
                    throw (errorMsgUnequalIds(category, "course id", "the course"));
                }
            } catch (error) {
                console.log(error);
            }

            // Validate assignment group's group_weight
            try {
                if (!assignmentGroup.group_weight) {
                    throw (errorMsgUndefined(category, "group weight"));
                } else if (typeof assignmentGroup.group_weight != "number") {
                    throw (errorMsgWrongType(category, "group weight", typeof assignmentGroup.group_weight));
                } else if (assignmentGroup.group_weight < 1) {
                    throw (errorMsgNegativeValue(category, "group weight", assignmentGroup.group_weight));
                } else if (assignmentGroup.group_weight % 1) {
                    throw (errorMsgFloatValue(category, "group weight", assignmentGroup.group_weight));
                }
            } catch (error) {
                console.log(error);
            }

            // Validate each assignment group's assigments array:
            assignmentGroup.assignments.forEach(assignment => {
                try {
                    if (!validateAssignment(assignment)) {
                        throw "Assignment is invalid!";
                    }
                } catch (error) {
                    console.log(error);
                }
            });
        }
    } catch (error) {
        console.log(error);
    }

    return true;
}

// Check individual assignments
function validateAssignment(assignment) {
    const category = "assignment";
    try {
        if (!assignment) {
            throw (errorMsgUndefined(category));
        } else if (typeof assignment != 'object') {
            throw (errorMsgWrongType(category));
        } else { // Move onto other validation logic
            // Validate that the keys are properly named and that none of them are missing.
            try {
                const assignmentKeys = ["id", "name", "due_at", "points_possible"];
                const reason = validateKeys(Object.keys(assignment), assignmentKeys);
                if (reason != "equal keys") {
                    throw (errorMsgUnequalArrays(`The keys for ${category}`, "expected keys for an assignment group", `different because this assignment group ${reason}`));
                };
            } catch (error) {
                console.log(error);
            }

            // Validate assignment group's id
            try {
                if (!assignment.id) {
                    throw (errorMsgUndefined(category, "id"));
                } else if (typeof assignment.id != "number") {
                    throw (errorMsgWrongType(category, "id", typeof assignment.id));
                } else if (assignment.id < 1) {
                    throw (errorMsgNegativeValue(category, "id", assignment.id));
                } else if (assignment.id % 1) {
                    throw (errorMsgFloatValue(category, "id", assignment.id));
                }
            } catch (error) {
                console.log(error);
            }

            // Validate assignment group's name
            try {
                if (!assignment.name) {
                    throw (errorMsgUndefined(category, "name"));
                } else if (typeof assignment.name != "string") {
                    throw (errorMsgWrongType(category, "name", typeof assignment.name));
                }
            } catch (error) {
                console.log(error);
            }

            // Validate assignment group's due date
            try {
                if (!assignment.due_at) {
                    throw (errorMsgUndefined(category, "due date"));
                } else if (typeof assignment.due_at != "string") {
                    throw (errorMsgWrongType(category, "due date", typeof assignment.due_at));
                }
            } catch (error) {
                console.log(error);
            }

            // Validate assignment group's points possible
            try {
                if (!assignment.points_possible) {
                    throw (errorMsgUndefined(category, "points possible"));
                } else if (typeof assignment.points_possible != "number") {
                    throw (errorMsgWrongType(category, "points possible", typeof assignment.points_possible));
                } else if (assignment.points_possible < 1) {
                    throw (errorMsgNegativeValue(category, "points possible", assignment.points_possible, "Cannot divide by 0!"));
                } else if (assignment.points_possible % 1) {
                    throw (errorMsgFloatValue(category, "points possible", assignment.points_possible));
                }
            } catch (error) {
                console.log(error);
            }
        }
    } catch (error) {
        console.log(error);
    }

    return true;
}

// Check individual submissions
function validateSubmissions(submissions) {
    const category = "learners' submissions";
    try {
        if (!submissions) {
            throw (errorMsgUndefined(category));
        } else if (typeof submissions != 'object') {
            throw (errorMsgWrongType(category));
        } else { // Move onto other validation logic

            // Validate each assignment group's assigments array:
            submissions.forEach(learnerSubmission => {
                try {
                    if (!validateLearnerSubmission(learnerSubmission)) {
                        throw "The learner's submission is invalid!";
                    }
                } catch (error) {
                    console.log(error);
                }
            });
        }
    } catch (error) {
        console.log(error);
    }

    return true;
}

function validateLearnerSubmission(learnerSubmission) {
    const category = "learner's submission";
    try {
        if (!learnerSubmission) {
            throw (errorMsgUndefined(category));
        } else if (typeof learnerSubmission != 'object') {
            throw (errorMsgWrongType(category));
        } else { // Move onto other validation logic
            // Validate that the keys are properly named and that none of them are missing.
            try {
                const learnerSubmissionKeys = ["learner_id", "assignment_id", "submission"];
                const reason = validateKeys(Object.keys(learnerSubmission), learnerSubmissionKeys);
                if (reason != "equal keys") {
                    throw (errorMsgUnequalArrays(`The keys for ${category}`, "expected keys for an learnerSubmission group", `different because this learnerSubmission group ${reason}`));
                };
            } catch (error) {
                console.log(error);
            }

            // Validate the learner_id of the learner's submission
            try {
                if (!learnerSubmission.learner_id) {
                    throw (errorMsgUndefined(category, "learner id"));
                } else if (typeof learnerSubmission.learner_id != "number") {
                    throw (errorMsgWrongType(category, "learner id", typeof learnerSubmission.learner_id));
                } else if (learnerSubmission.learner_id < 1) {
                    throw (errorMsgNegativeValue(category, "learner id", learnerSubmission.learner_id));
                } else if (learnerSubmission.learner_id % 1) {
                    throw (errorMsgFloatValue(category, "learner id", learnerSubmission.id));
                }
            } catch (error) {
                console.log(error);
            }

            // Validate the assignment_id of the learner's submission
            try {
                if (!learnerSubmission.assignment_id) {
                    throw (errorMsgUndefined(category, "assignment id"));
                } else if (typeof learnerSubmission.assignment_id != "number") {
                    throw (errorMsgWrongType(category, "assignment id", typeof learnerSubmission.assignment_id));
                } else if (learnerSubmission.assignment_id < 1) {
                    throw (errorMsgNegativeValue(category, "assignment id", learnerSubmission.assignment_id, "Cannot divide by 0!"));
                } else if (learnerSubmission.assignment_id % 1) {
                    throw (errorMsgFloatValue(category, "assignment id", learnerSubmission.assignment_id));
                }
            } catch (error) {
                console.log(error);
            }

            // Validate the inner submission's details of the learner's submission
            try {
                // Validate each assignment group's assigments array:
                if (!validateInnerSubmission(learnerSubmission.submission)) {
                    throw errorMsgUnexpected("learner's submission details");
                }

            } catch (error) {
                console.log(error);
            }
        }
    } catch (error) {
        console.log(error);
    }

    return true;
}

function validateInnerSubmission(submissionDetails) {
    const category = "submission details";
    try {
        if (!submissionDetails) {
            throw (errorMsgUndefined(category));
        } else if (typeof submissionDetails != 'object') {
            throw (errorMsgWrongType(category));
        } else { // Move onto other validation logic
            // Validate that the keys are properly named and that none of them are missing.
            try {
                const submissionDetailsKeys = ["submitted_at", "score"];
                const reason = validateKeys(Object.keys(submissionDetails), submissionDetailsKeys);
                if (reason != "equal keys") {
                    throw (errorMsgUnequalArrays(`The keys for ${category}`, "expected keys for an submissionDetails group", `different because this submissionDetails group ${reason}`));
                };
            } catch (error) {
                console.log(error);
            }

            // Validate the time of the learner's submission
            try {
                if (!submissionDetails.submitted_at) {
                    throw (errorMsgUndefined(category, "submitted at"));
                } else if (typeof submissionDetails.submitted_at != "string") {
                    throw (errorMsgWrongType(category, "submitted at", typeof submissionDetails.submitted_at, "string"));
                }
            } catch (error) {
                console.log(error);
            }

            // Validate the score of the learner's submission
            try {
                if (!submissionDetails.score) {
                    throw (errorMsgUndefined(category, "points possible"));
                } else if (typeof submissionDetails.score != "number") {
                    throw (errorMsgWrongType(category, "points possible", typeof submissionDetails.score));
                } else if (submissionDetails.score < 0) {
                    throw (errorMsgNegativeValue(category, "points possible", submissionDetails.score, "Cannot divide by 0!"));
                } else if (submissionDetails.score % 1) {
                    throw (errorMsgFloatValue(category, "points possible", submissionDetails.score));
                }
            } catch (error) {
                console.log(error);
            }
        }
    } catch (error) {
        console.log(error);
    }

    return true;
}

// Tests
const expectedResult = [
    {
        id: 125,
        avg: 0.985, // (47 + 150) / (50 + 150)
        1: 0.94, // 47 / 50
        2: 1.0 // 150 / 150
    },
    {
        id: 132,
        avg: 0.82, // (39 + 125) / (50 + 150)
        1: 0.78, // 39 / 50
        2: 0.833 // late: (140 - 15) / 150
    }
];

const result = getLearnerData(CourseInfo, AssignmentGroup, LearnerSubmissions);

console.log(result);