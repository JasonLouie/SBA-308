// The provided course information.
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
    // Check if the course, assignment group, and submissions are valid
    if (validateCourse(course) && validateAssignments(ag, course.id) && validateSubmissions(submissions)) {
        console.log("Everything is good!");
    }

    const results = [];

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
            // Only add assignments to the learnerObj that have close due dates.
            const canBeChecked = includeAssignment(ag.assignments[aId])
            if (!canBeChecked || aId < 0) continue; // Skip assignments that are not close to the due date.

            const learnerObj = results[learnerObjIndex];
            const lateAssignment = isLate(ag.assignments[aId], learnerSub.submission.submitted_at);
            const pointsPossible = ag.assignments[aId].points_possible;
            const score = (lateAssignment) ? (learnerSub.submission.score - (pointsPossible * 0.1)) : learnerSub.submission.score;
            const grade = score / pointsPossible;
            learnerObj[learnerSub.assignment_id] = roundNum(grade);
            learnerObj.totalScore += score;
            learnerObj.totalPointsPossible += pointsPossible;
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
    const todaysDate = "2025-09-05";
    return (todaysDate > assignment.due_at);
}

// Ensure that the month is between 1 - 12 and that the day of month can exist.
function validateDate(dateStr) {
    if (!dateStr.includes("-")) {
        return "Invalid date! Missing '-'!";
    } else {
        const dateArr = dateStr.split("-");
        // Ex: ["2025", "09", "05"]
        if (dateArr.length != 3) {
            return "Invalid date! Missing month, day, or year!";
        } else if (dateArr[0].length != 4) {
            return "Invalid year!";
        } else if (dateArr[1].length != 2) {
            return "Invalid month format! Month must be two characters.";
        } else if (dateArr[2].length != 2) {
            return "Invalid day format! Day must be two characters.";
        } else {
            const monthsArr = { "01": 31, "02": 29, "03": 31, "04": 30, "05": 31, "06": 30, "07": 31, "08": 31, "09": 30, "10": 31, "11": 31, "12": 31 };

            for (const monthNum in monthsArr) {
                if (dateArr[1] === monthNum) {
                    if (monthsArr[monthNum] < Number(dateArr[2])) {
                        return `Invalid day of ${dateArr[2]}! Month is ${monthNum}, so day must be between 01 and ${monthsArr[monthNum]}.`;
                    } else { // Return empty string if day in dateStr is reasonable.
                        return "";
                    }
                }
            }
            return `Invalid month of ${dateArr[1]}! Month must be between 01 and 12.`;
        }
    }
}

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

// Returns the error message for undefined variables. If category is only provided, it is treated as the variable name.
function errorMsgUndefined(category, variableName = "") {
    if (!variableName) {
        return `The ${category} must be defined!`;
    }
    return `The ${variableName} of ${category} must be defined!`;
}

// Returns the error message for variables of the wrong type. If category is only provided, it is treated as the variable name.
function errorMsgWrongType(category, variableName = "", type, expectedType) {
    const vowels = ["a", "e", "i", "o", "u"];
    const aWord = vowels.includes(expectedType[0]) ? "an" : "a"; // Use a/an since type can be object
    if (!variableName) {
        return `The ${category} cannot be the type ${type}! Must be ${aWord} ${expectedType}.`;
    }
    return `The ${category}'s ${variableName} cannot be the type ${type}! Must be ${aWord} ${expectedType}.`;
}

// Returns the error message when the variable's value is lower than the lower bound.
function errorMsgInvalidNumberValue(category, variableName, variable, additionalReason = "", lowerBound = 1) {
    if (additionalReason) {
        return `The ${variableName} of ${category} is ${variable} and cannot be less than ${lowerBound}! ${additionalReason}`;
    }
    return `The ${variableName} of ${category} is ${variable} and cannot be less than ${lowerBound}!`;
}

// Returns the error message when the variable is a decimal/float value when it shouldn't be.
function errorMsgFloatValue(category, variableName, variable) {
    return `The ${variableName} of ${category} is ${variable} and must be a whole number!`;
}

// Returns the error message when the value of the shared variable for two different objects are not the same.
function errorMsgUnequalIds(category1, variableName, category2) {
    return `The ${variableName} of ${category1} is not equal to the ${variableName} of ${category2}!`;
}

// Returns the error message when the provided keys do not match the expected keys.
function errorMsgUnequalKeys(category, reason) {
    const vowels = ["a", "e", "i", "o", "u"];
    const aWord = vowels.includes(category[0]) ? "an" : "a";
    return `The keys for the ${category} provided and expected keys for ${aWord} ${category} are different because this ${category} ${reason}`;
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
    return "";
}

function validateId(category, id){
    if (id === undefined) {
        return errorMsgUndefined(category, "id");
    } else if (typeof id != "number") {
        return errorMsgWrongType(category, "id", typeof id, "number");
    } else if (id < 1) {
        return errorMsgInvalidNumberValue(category, "id", id);
    } else if (id % 1) {
        return errorMsgFloatValue(category, "id", id);
    }
    return "";
}

function validateName(category, name){
    if (name === undefined) {
        return errorMsgUndefined(category, "name");
    } else if (typeof name != "string") {
        return errorMsgWrongType(category, "name", typeof name, "string");
    }
    return "";
}

// Validates the information of the course provided by checking object structure, variable types, 
function validateCourse(course) {
    const category = "course";
    const hasErrors = false;
    try {
        if (course === undefined) {
            throw (errorMsgUndefined(category));
        } else if (typeof course != "object") {
            throw (errorMsgWrongType(category, "", typeof course, "object"));
        } else { // Move onto other validation logic
            // Validate that the keys are properly named and that none of them are missing.
            try {
                const courseKeys = ["id", "name"];
                const errorReason = validateKeys(Object.keys(course), courseKeys);
                if (errorReason) {
                    throw (errorMsgUnequalKeys(category, errorReason));
                };
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }

            // Validate course group's id
            try {
                const idErrorReason = validateId(category, course.id);
                if (idErrorReason) throw idErrorReason;
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }

            // Validate course group's name
            try {
                const nameErrorReason = validateName(category, course.name);
                if (nameErrorReason) throw nameErrorReason;
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }
        }
    } catch (error) {
        console.log(error);
        hasErrors = true;
    }

    return !hasErrors;
}

// Check the entire assignment group
function validateAssignments(assignmentGroup, courseId) {
    const category = "assignment group";
    const hasErrors = false;
    try {
        if (assignmentGroup === undefined) {
            throw (errorMsgUndefined(category));
        } else if (typeof assignmentGroup != "object") {
            throw (errorMsgWrongType(category, "", typeof assignmentGroup, "object"));
        } else { // Move onto other validation logic
            // Validate that the keys are properly named and that none of them are missing.
            try {
                const assignmentGroupKeys = ["id", "name", "course_id", "group_weight", "assignments"];
                const errorReason = validateKeys(Object.keys(assignmentGroup), assignmentGroupKeys);
                if (errorReason) {
                    throw (errorMsgUnequalKeys(category, errorReason));
                };
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }

            // Validate assignment group's id
            try {
                if (assignmentGroup.id === undefined) {
                    throw (errorMsgUndefined(category, "id"));
                } else if (typeof assignmentGroup.id != "number") {
                    throw (errorMsgWrongType(category, "id", typeof assignmentGroup.id, "number"));
                } else if (assignmentGroup.id < 1) {
                    throw (errorMsgInvalidNumberValue(category, "id", assignmentGroup.id));
                } else if (assignmentGroup.id % 1) {
                    throw (errorMsgFloatValue(category, "id", assignmentGroup.id));
                }
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }

            // Validate assignment group's name
            try {
                if (assignmentGroup.name === undefined) {
                    throw (errorMsgUndefined(category, "name"));
                } else if (typeof assignmentGroup.name != "string") {
                    throw (errorMsgWrongType(category, "name", typeof assignmentGroup.name, "string"));
                }
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }

            // Validate assignment group's course id
            try {
                if (assignmentGroup.course_id === undefined) {
                    throw (errorMsgUndefined(category, "course id"));
                } else if (typeof assignmentGroup.course_id != "number") {
                    throw (errorMsgWrongType(category, "course id", typeof assignmentGroup.course_id, "number"));
                } else if (assignmentGroup.course_id < 1) {
                    throw (errorMsgInvalidNumberValue(category, "course id", assignmentGroup.course_id));
                } else if (assignmentGroup.course_id % 1) {
                    throw (errorMsgFloatValue(category, "course id", assignmentGroup.course_id));
                } else if (assignmentGroup.course_id != courseId) {
                    throw (errorMsgUnequalIds(category, "course id", "the course"));
                }
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }

            // Validate assignment group's group weight
            try {
                if (assignmentGroup.group_weight === undefined) {
                    throw (errorMsgUndefined(category, "group weight"));
                } else if (typeof assignmentGroup.group_weight != "number") {
                    throw (errorMsgWrongType(category, "group weight", typeof assignmentGroup.group_weight, "number"));
                } else if (assignmentGroup.group_weight < 1) {
                    throw (errorMsgInvalidNumberValue(category, "group weight", assignmentGroup.group_weight));
                } else if (assignmentGroup.group_weight % 1) {
                    throw (errorMsgFloatValue(category, "group weight", assignmentGroup.group_weight));
                }
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }

            // Validate each assignment group's assigments array:
            assignmentGroup.assignments.forEach(assignment => {
                try {
                    if (!validateAssignment(assignment)) {
                        throw `Assignment of id ${assignment.id} from assignment group of id ${assignmentGroup.id} is invalid!`;
                    }
                } catch (error) {
                    console.log(error);
                    hasErrors = true;
                }
            });
        }
    } catch (error) {
        console.log(error);
        hasErrors = true;
    }

    return !hasErrors;
}

// Check individual assignments
function validateAssignment(assignment) {
    const category = "assignment";
    const hasErrors = false;
    try {
        if (assignment === undefined) {
            throw (errorMsgUndefined(category));
        } else if (typeof assignment != "object") {
            throw (errorMsgWrongType(category, "", typeof assignment, "object"));
        } else { // Move onto other validation logic
            // Validate that the keys are properly named and that none of them are missing.
            try {
                const assignmentKeys = ["id", "name", "due_at", "points_possible"];
                const errorReason = validateKeys(Object.keys(assignment), assignmentKeys);
                if (errorReason) {
                    throw (errorMsgUnequalKeys(category, errorReason));
                };
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }

            // Validate assignment group's id
            try {
                if (assignment.id === undefined) {
                    throw (errorMsgUndefined(category, "id"));
                } else if (typeof assignment.id != "number") {
                    throw (errorMsgWrongType(category, "id", typeof assignment.id, "number"));
                } else if (assignment.id < 1) {
                    throw (errorMsgInvalidNumberValue(category, "id", assignment.id));
                } else if (assignment.id % 1) {
                    throw (errorMsgFloatValue(category, "id", assignment.id));
                }
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }

            // Validate assignment group's name
            try {
                if (assignment.name === undefined) {
                    throw (errorMsgUndefined(category, "name"));
                } else if (typeof assignment.name != "string") {
                    throw (errorMsgWrongType(category, "name", typeof assignment.name, "string"));
                }
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }

            // Validate assignment group's due date
            try {
                if (assignment.due_at === undefined) {
                    throw (errorMsgUndefined(category, "due date"));
                } else if (typeof assignment.due_at != "string") {
                    throw (errorMsgWrongType(category, "due date", typeof assignment.due_at, "string"));
                } else {
                    const errorReason = validateDate(assignment.due_at);
                    if(errorReason){
                        throw `The ${category}'s due date is invalid! ${errorReason}`;
                    }
                }
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }

            // Validate assignment group's points possible
            try {
                if (assignment.points_possible === undefined) {
                    throw (errorMsgUndefined(category, "points possible"));
                } else if (typeof assignment.points_possible != "number") {
                    throw (errorMsgWrongType(category, "points possible", typeof assignment.points_possible, "number"));
                } else if (assignment.points_possible < 1) {
                    throw (errorMsgInvalidNumberValue(category, "points possible", assignment.points_possible, "Cannot divide by 0!"));
                } else if (assignment.points_possible % 1) {
                    throw (errorMsgFloatValue(category, "points possible", assignment.points_possible));
                }
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }
        }
    } catch (error) {
        console.log(error);
        hasErrors = true;
    }

    return !hasErrors;
}

// Check individual submissions
function validateSubmissions(submissions) {
    const category = "learners' submissions";
    const hasErrors = false;
    try {
        if (submissions === undefined) {
            throw (errorMsgUndefined(category));
        } else if (typeof submissions != "object") {
            throw (errorMsgWrongType(category, "", typeof submissions, "object"));
        } else { // Move onto other validation logic

            // Validate each assignment group's assigments array:
            submissions.forEach(learnerSubmission => {
                try {
                    if (!validateLearnerSubmission(learnerSubmission)) {
                        throw "The learner's submission is invalid!";
                    }
                } catch (error) {
                    console.log(error);
                    hasErrors = true;
                }
            });
        }
    } catch (error) {
        console.log(error);
        hasErrors = true;
    }

    return !hasErrors;
}

function validateLearnerSubmission(learnerSubmission) {
    const category = "learner's submission";
    const hasErrors = false;
    try {
        if (learnerSubmission === undefined) {
            throw (errorMsgUndefined(category));
        } else if (typeof learnerSubmission != "object") {
            throw (errorMsgWrongType(category, "", typeof learnerSubmission, "object"));
        } else { // Move onto other validation logic
            // Validate that the keys are properly named and that none of them are missing.
            try {
                const learnerSubmissionKeys = ["learner_id", "assignment_id", "submission"];
                const errorReason = validateKeys(Object.keys(learnerSubmission), learnerSubmissionKeys);
                if (errorReason) {
                    throw (errorMsgUnequalKeys(category, errorReason));
                };
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }

            // Validate the learner_id of the learner's submission
            try {
                if (learnerSubmission.learner_id === undefined) {
                    throw (errorMsgUndefined(category, "learner id"));
                } else if (typeof learnerSubmission.learner_id != "number") {
                    throw (errorMsgWrongType(category, "learner id", typeof learnerSubmission.learner_id, "number"));
                } else if (learnerSubmission.learner_id < 1) {
                    throw (errorMsgInvalidNumberValue(category, "learner id", learnerSubmission.learner_id));
                } else if (learnerSubmission.learner_id % 1) {
                    throw (errorMsgFloatValue(category, "learner id", learnerSubmission.id));
                }
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }

            // Validate the assignment_id of the learner's submission
            try {
                if (learnerSubmission.assignment_id === undefined) {
                    throw (errorMsgUndefined(category, "assignment id"));
                } else if (typeof learnerSubmission.assignment_id != "number") {
                    throw (errorMsgWrongType(category, "assignment id", typeof learnerSubmission.assignment_id, "number"));
                } else if (learnerSubmission.assignment_id < 1) {
                    throw (errorMsgInvalidNumberValue(category, "assignment id", learnerSubmission.assignment_id, "Cannot divide by 0!"));
                } else if (learnerSubmission.assignment_id % 1) {
                    throw (errorMsgFloatValue(category, "assignment id", learnerSubmission.assignment_id));
                }
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }

            // Validate the inner submission's details of the learner's submission
            try {
                // Validate each assignment group's assigments array:
                if (!validateInnerSubmission(learnerSubmission.submission)) {
                    throw `Error validating the learner's submission details with learner id of ${learnerSubmission.learner_id} and assignment id of ${learnerSubmission.assignment_id}!`;
                }

            } catch (error) {
                console.log(error);
                hasErrors = true;
            }
        }
    } catch (error) {
        console.log(error);
        hasErrors = true;
    }

    return !hasErrors;
}

function validateInnerSubmission(submissionDetails) {
    const category = "submission's details";
    const hasErrors = false;
    try {
        if (submissionDetails === undefined) {
            throw (errorMsgUndefined(category));
        } else if (typeof submissionDetails != "object") {
            throw (errorMsgWrongType(category, "", typeof submissionDetails, "object"));
        } else { // Move onto other validation logic
            // Validate that the keys are properly named and that none of them are missing.
            try {
                const submissionDetailsKeys = ["submitted_at", "score"];
                const errorReason = validateKeys(Object.keys(submissionDetails), submissionDetailsKeys);
                if (errorReason) {
                    throw (errorMsgUnequalKeys(category, errorReason));
                };
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }

            // Validate the time of the learner's submission
            try {
                if (submissionDetails.submitted_at === undefined) {
                    throw (errorMsgUndefined(category, "submitted at"));
                } else if (typeof submissionDetails.submitted_at != "string") {
                    throw (errorMsgWrongType(category, "submitted at", typeof submissionDetails.submitted_at, "string"));
                } else {
                    const errorReason = validateDate(submissionDetails.submitted_at);
                    if(errorReason){
                        throw `The date submitted for the ${category}'s is invalid! ${errorReason}`;
                    }
                }
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }

            // Validate the score of the learner's submission
            try {
                if (submissionDetails.score === undefined) {
                    throw (errorMsgUndefined(category, "score"));
                } else if (typeof submissionDetails.score != "number") {
                    throw (errorMsgWrongType(category, "score", typeof submissionDetails.score, "number"));
                } else if (submissionDetails.score < 0) {
                    throw (errorMsgInvalidNumberValue(category, "score", submissionDetails.score, "Cannot be negative!", 0));
                }
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }
        }
    } catch (error) {
        console.log(error);
        hasErrors = true;
    }

    return !hasErrors;
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