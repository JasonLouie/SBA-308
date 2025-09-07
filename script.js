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
    const results = [];
    // Check if the course, assignment group, and submissions are valid
    if (validateCourse(course) && validateAssignments(ag, course.id) && validateSubmissions(submissions)) {
        console.log("Everything is good!");
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
        calculateAvgs(results);
    }
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
    try {
        const arrayErrorReason = validateArray("results", results);
        if (arrayErrorReason) {
            throw arrayErrorReason
        }
        results.forEach(result => {
            try {
                const objectErrorReason = validateObject("result", result);
                if (objectErrorReason) {
                    throw objectErrorReason;
                } else if (result.totalScore === undefined || result.totalPointsPossible === undefined){
                    throw "Cannot calculate average because the key totalScore or totalPointsPossible was not properly initialized.";
                }
                const average = result.totalScore / result.totalPointsPossible;
                result.avg = roundNum(average);
                delete result.totalScore;
                delete result.totalPointsPossible;
            } catch (error) {
                console.log(error);
            }
        })
    } catch (error) {
        console.log(error);
    }
}

// Check if assignment is late
function isLate(assignment, submissionDate) {
    return submissionDate > assignment.due_at;
}

// Check if assignment is due yet
function includeAssignment(assignment) {
    const todaysDate = "2025-09-05";
    return todaysDate > assignment.due_at;
}

// Returns the index of the assignment object with assignment_id = assignmentId. Returns -1 if the assignment with assignmentId cannot be found.
function findAssignment(assignments, assignmentId) {
    if (assignments) {
        for (let i = 0; i < assignments.length; i++) {
            if (assignments[i].id == assignmentId) {
                return i;
            }
        }
    }
    return -1;
}

// Returns the index of the learner object with id = learnerId. Returns -1 if the learner object with learnerId cannot be found.
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

// Returns the error message for undefined variables. If objectName is only provided, it is treated as the variable name.
function errorMsgUndefined(objectName, variableName = "") {
    if (!variableName) {
        return `The ${objectName} must be defined!`;
    }
    return `The ${variableName} of ${objectName} must be defined!`;
}

// Returns the error message for empty strings/objects/arrays
function errorMsgEmpty(objectName, variableName = "") {
    if (!variableName) {
        return `The ${objectName} cannot be empty!`;
    }
    return `The ${variableName} of ${objectName} cannot empty!`;
}

// Returns the error message for variables of the wrong primitive data type. If objectName is only provided, it is treated as the variable name.
function errorMsgWrongPrimitiveType(objectName, variableName = "", type, expectedType) {
    const vowels = ["a", "e", "i", "o", "u"];
    const aWord = vowels.includes(expectedType[0]) ? "an" : "a"; // Use a/an since expectedType can be object
    if (!variableName) {
        return `The ${objectName} cannot be the type ${type}! Must be ${aWord} ${expectedType}.`;
    }
    return `The ${objectName}'s ${variableName} cannot be the type ${type}! Must be ${aWord} ${expectedType}.`;
}

// Returns the error message for objects of the wrong object type.
function errorMsgWrongObjectType(objectName, variableName = "", expectedType) {
    if (!variableName) {
        return `The ${objectName} must be an ${expectedType}.`;
    }
    return `The ${objectName}'s ${variableName} must be an ${expectedType}.`;
}

// Returns the error message when the variable's value is lower than the lower bound.
function errorMsgInvalidNumberValue(objectName, variableName, variable, additionalReason = "", lowerBound = 1) {
    return `The ${variableName} of ${objectName} is ${variable} and cannot be less than ${lowerBound}!` + `${(additionalReason) ? (" " + additionalReason) : ""}`;
}

// Returns the error message when the variable is a decimal/float value when it shouldn't be.
function errorMsgFloatValue(objectName, variableName, variable) {
    return `The ${variableName} of ${objectName} is ${variable} and must be an integer!`;
}

// Returns the error message when the value of the shared variable for two different objects are not the same.
function errorMsgUnequalIds(objectName1, variableName, objectName2) {
    return `The ${variableName} of ${objectName1} is not equal to the ${variableName} of ${objectName2}!`;
}

// Returns the error message when the provided keys do not match the expected keys.
function errorMsgUnequalKeys(objectName, reason) {
    const vowels = ["a", "e", "i", "o", "u"];
    const aWord = vowels.includes(objectName[0]) ? "an" : "a";
    return `The keys for the ${objectName} provided and expected keys for ${aWord} ${objectName} are different because this ${objectName} ${reason}`;
}

// Checks if keys are equal to expected keys and gives a reason if they are not equal (reason is relative to keys).
function validateKeys(keys, expectedKeys) {
    if (keys === undefined) {
        return "is undefined.";
    } else if (keys.length > expectedKeys.length) {
        return "has extra keys.";
    } else if (keys.length < expectedKeys.length) {
        return "is missing keys.";
    } else {
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] != expectedKeys[i]) return `has the key ${keys[i]} instead of ${expectedKeys[i]}.`;
        }
    }
    return "";
}

// Validation for id
function validateId(objectName, id, variableName = "id") {
    if (id === undefined) {
        return errorMsgUndefined(objectName, variableName);
    } else if (typeof id != "number") {
        return errorMsgWrongPrimitiveType(objectName, variableName, typeof id, "number");
    } else if (id < 1) {
        return errorMsgInvalidNumberValue(objectName, variableName, id);
    } else if (id % 1) {
        return errorMsgFloatValue(objectName, variableName, id);
    }
    return "";
}

// Validation for name
function validateName(objectName, name, variableName = "name") {
    if (name === undefined) {
        return errorMsgUndefined(objectName, variableName);
    } else if (typeof name != "string") {
        return errorMsgWrongPrimitiveType(objectName, variableName, typeof name, "string");
    } else if (name === "") {
        return `The ${variableName} of the ${objectName} cannot be an empty string!`;
    }
    return "";
}

// Ensure that the month is between 1 - 12 and that the day of month can exist.
function validateDate(objectName, date, variableName) {
    if (date === undefined) {
        return errorMsgUndefined(objectName, variableName);
    } else if (typeof date != "string") {
        return errorMsgWrongPrimitiveType(objectName, variableName, typeof date, "string");
    } else if (date === "") {
        return `The ${variableName} for the ${objectName} cannot be an empty string!`;
    } else if (!date.includes("-")) {
        return `The ${variableName} for the ${objectName} is missing '-'!`;
    } else {
        const dateArr = date.split("-");
        // Ex: ["2025", "09", "05"]
        if (dateArr.length < 3) {
            return `The ${variableName} for the ${objectName} is missing month, day, or year!`;
        } else if (dateArr.length > 3) {
            return `The ${variableName} for the ${objectName} has too many '-'!`;
        } else if (dateArr[0].length != 4) {
            return `The ${variableName} for the ${objectName} has an invalid year format! Year must be four characters.`;
        } else if (dateArr[1].length != 2) {
            return `The ${variableName} for the ${objectName} has an invalid month format! Month must be two characters.`;
        } else if (dateArr[2].length != 2) {
            return `The ${variableName} for the ${objectName} has an invalid day format! Day must be two characters.`;
        } else {
            const monthsObj = { "01": 31, "02": 29, "03": 31, "04": 30, "05": 31, "06": 30, "07": 31, "08": 31, "09": 30, "10": 31, "11": 31, "12": 31 };

            if (monthsObj[dateArr[1]]) { // Check if month exists in monthsObj
                return (monthsObj[dateArr[1]] >= Number(dateArr[2])) ? "" : `The ${variableName} for the ${objectName} has an invalid day of ${dateArr[2]}! Month is ${monthNum}, so day must be between 01 and ${monthsArr[monthNum]}.`;
            }
            return `The ${variableName} for the ${objectName} has an invalid month of ${dateArr[1]}! Month must be between 01 and 12.`;
        }
    }
}

// Validates that an array provided is an Array and isn't empty
function validateArray(objectName, array, arrayName = "") {
    if (array === undefined) {
        return errorMsgUndefined(objectName, arrayName);
    } else if (typeof array != "object") {
        return errorMsgWrongPrimitiveType(objectName, arrayName, typeof array, "object");
    } else if (!(array instanceof Array)) {
        return errorMsgWrongObjectType(objectName, arrayName, "Array");
    } else if (array.length === 0) {
        return errorMsgEmpty(objectName, arrayName);
    }
    return "";
}

// Validates that an object provided is an Object and isn't empty
function validateObject(objectName, object) {
    if (object === undefined) {
        return errorMsgUndefined(objectName);
    } else if (typeof object != "object") {
        return errorMsgWrongPrimitiveType(objectName, "", typeof object, "object");
    } else if (Object.keys(object).length === 0) {
        return errorMsgEmpty(objectName);
    }
    return "";
}

// Validates the information of the course provided by checking object structure, variable types, 
function validateCourse(course) {
    const objectName = "course";
    try {
        // Validate that course is an object
        const objectErrorReason = validateObject(objectName, course);
        if (objectErrorReason) {
            throw objectErrorReason;
        }

        // Validate that the keys are properly named and that none of them are missing.
        const courseKeys = ["id", "name"];
        const keysErrorReason = validateKeys(Object.keys(course), courseKeys);
        if (keysErrorReason) {
            throw errorMsgUnequalKeys(objectName, keysErrorReason);
        }

        // Validate values by accessing the keys of the object
        const hasErrors = false; // Keep track of any errors from any key's value

        // Validate course group's id
        try {
            const idErrorReason = validateId(objectName, course.id);
            if (idErrorReason) {
                throw idErrorReason;
            }
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }

        // Validate course group's name
        try {
            const nameErrorReason = validateName(objectName, course.name);
            if (nameErrorReason) {
                throw nameErrorReason;
            }
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }
        return !hasErrors;
    } catch (error) {
        console.log(error);
        return false;
    }
}

// Check the entire assignment group
function validateAssignments(assignmentGroup, courseId) {
    const objectName = "assignment group";
    try {
        // Validate that assignmentGroup is an object
        const objectErrorReason = validateObject(objectName, assignmentGroup);
        if (objectErrorReason) {
            throw objectErrorReason;
        }

        // Validate that the keys are properly named and that none of them are missing.
        const assignmentGroupKeys = ["id", "name", "course_id", "group_weight", "assignments"];
        const keysErrorReason = validateKeys(Object.keys(assignmentGroup), assignmentGroupKeys);
        if (keysErrorReason) {
            throw errorMsgUnequalKeys(objectName, keysErrorReason);
        }

        // Validate values by accessing the keys of the object
        const hasErrors = false; // Keep track of any errors from any key's value

        // Validate assignment group's id
        try {
            const idErrorReason = validateId(objectName, assignmentGroup.id);
            if (idErrorReason) {
                throw idErrorReason;
            }
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }

        // Validate assignment group's name
        try {
            const nameErrorReason = validateName(objectName, assignmentGroup.name);
            if (nameErrorReason) {
                throw nameErrorReason;
            }
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }

        // Validate assignment group's course id
        try {
            const courseIdErrorReason = validateId(objectName, assignmentGroup.course_id, "course id");
            if (courseIdErrorReason) {
                throw courseIdErrorReason;
            } else if (assignmentGroup.course_id != courseId) {
                throw errorMsgUnequalIds(objectName, "course id", "the course");
            }
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }

        // Validate assignment group's group weight
        try {
            if (assignmentGroup.group_weight === undefined) {
                throw errorMsgUndefined(objectName, "group weight");
            } else if (typeof assignmentGroup.group_weight != "number") {
                throw errorMsgWrongPrimitiveType(objectName, "group weight", typeof assignmentGroup.group_weight, "number");
            } else if (assignmentGroup.group_weight < 1) {
                throw errorMsgInvalidNumberValue(objectName, "group weight", assignmentGroup.group_weight);
            } else if (assignmentGroup.group_weight % 1) {
                throw errorMsgFloatValue(objectName, "group weight", assignmentGroup.group_weight);
            }
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }

        // Validate assignment group's assignments array
        try {
            const arrayErrorReason = validateArray(objectName, assignmentGroup.assignments, "assignments");
            if (arrayErrorReason) {
                throw arrayErrorReason;
            }

            // Validate each individual assignment from the assignment group's assignments array
            assignmentGroup.assignments.forEach(assignment => {
                try {
                    if (!validateAssignment(assignment)) {
                        throw `Assignment of id ${assignment.id} from ${objectName} of id ${assignmentGroup.id} is invalid!`;
                    }
                } catch (error) {
                    console.log(error);
                    hasErrors = true;
                }
            });
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }
        return !hasErrors;
    } catch (error) {
        console.log(error);
        return false;
    }
}

// Validate the individual assignment object
function validateAssignment(assignment) {
    const objectName = "assignment";
    try {
        // Validate that assignment is an object
        const objectErrorReason = validateObject(objectName, assignment);
        if (objectErrorReason) {
            throw objectErrorReason;
        }

        // Validate that the keys are properly named and that none of them are missing.
        const assignmentKeys = ["id", "name", "due_at", "points_possible"];
        const keysErrorReason = validateKeys(Object.keys(assignment), assignmentKeys);
        if (keysErrorReason) {
            throw (errorMsgUnequalKeys(objectName, keysErrorReason));
        };

        // Validate values by accessing the keys of the object
        const hasErrors = false; // Keep track of any errors from any key's value

        // Validate assignment's id
        try {
            const idErrorReason = validateId(objectName, assignment.id);
            if (idErrorReason) {
                throw idErrorReason;
            }
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }

        // Validate assignment's name
        try {
            const nameErrorReason = validateName(objectName, assignment.name);
            if (nameErrorReason) {
                throw nameErrorReason;
            }
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }

        // Validate assignment's due date
        try {
            const dateErrorReason = validateDate(objectName, assignment.due_at, "due date");
            if (dateErrorReason) {
                throw dateErrorReason;
            }
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }

        // Validate assignment's points possible
        try {
            if (assignment.points_possible === undefined) {
                throw (errorMsgUndefined(objectName, "points possible"));
            } else if (typeof assignment.points_possible != "number") {
                throw (errorMsgWrongPrimitiveType(objectName, "points possible", typeof assignment.points_possible, "number"));
            } else if (assignment.points_possible < 1) {
                throw (errorMsgInvalidNumberValue(objectName, "points possible", assignment.points_possible, "Cannot divide by 0!"));
            } else if (assignment.points_possible % 1) {
                throw (errorMsgFloatValue(objectName, "points possible", assignment.points_possible));
            }
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }
        return !hasErrors;
    } catch (error) {
        console.log(error);
        return false;
    }
}

// Validate the array of submissions
function validateSubmissions(submissions) {
    const objectName = "learners' submissions";
    try {
        // Validate that submissions is an array
        const arrayErrorReason = validateArray(objectName, submissions, "");
        if (arrayErrorReason) {
            throw arrayErrorReason;
        }

        // Validate each individual submission from the submissions array
        const hasErrors = false;

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
        return !hasErrors;
    } catch (error) {
        console.log(error);
        return false;
    }
}

// Validate the individual submission object of a specific learner
function validateLearnerSubmission(learnerSubmission) {
    const objectName = "learner's submission";
    try {
        // Validate that learnerSubmission is an object
        const objectErrorReason = validateObject(objectName, learnerSubmission);
        if (objectErrorReason) {
            throw objectErrorReason;
        }

        // Validate that the keys are properly named and that none of them are missing.
        const learnerSubmissionKeys = ["learner_id", "assignment_id", "submission"];
        const keysErrorReason = validateKeys(Object.keys(learnerSubmission), learnerSubmissionKeys);
        if (keysErrorReason) {
            throw (errorMsgUnequalKeys(objectName, keysErrorReason));
        }

        // Validate values by accessing the keys of the object
        const hasErrors = false; // Keep track of any errors from any key's value

        // Validate the learner id of the learner's submission
        try {
            const idErrorReason = validateId(objectName, learnerSubmission.learner_id, "learner id");
            if (idErrorReason) {
                throw idErrorReason;
            }
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }

        // Validate the assignment id of the learner's submission
        try {
            const idErrorReason = validateId(objectName, learnerSubmission.assignment_id, "assignment id");
            if (idErrorReason) {
                throw idErrorReason;
            }
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }

        // Validate the inner submission's details of the learner's submission
        try {
            // Validate each assignment group's assignments array:
            if (!validateInnerSubmission(learnerSubmission.submission)) {
                throw `Error validating the learner's submission details with learner id of ${learnerSubmission.learner_id} and assignment id of ${learnerSubmission.assignment_id}!`;
            }

        } catch (error) {
            console.log(error);
            hasErrors = true;
        }
        return !hasErrors;
    } catch (error) {
        console.log(error);
        return false;
    }
}

// Validate the details of a learner's submission (the nested 'submission' object)
function validateInnerSubmission(submissionDetails) {
    const objectName = "submission's details";
    try {
        // Validate that submissionDetails is an object
        const objectErrorReason = validateObject(objectName, submissionDetails);
        if (objectErrorReason) {
            throw objectErrorReason;
        }
        // Validate that the keys are properly named and that none of them are missing.
        const submissionDetailsKeys = ["submitted_at", "score"];
        const keysErrorReason = validateKeys(Object.keys(submissionDetails), submissionDetailsKeys);
        if (keysErrorReason) {
            throw errorMsgUnequalKeys(objectName, keysErrorReason);
        }

        // Validate values by accessing the keys of the object
        const hasErrors = false; // Keep track of any errors from any key's value

        // Validate the time of the learner's submission (submitted_at)
        try {
            const dateErrorReason = validateDate(objectName, submissionDetails.submitted_at, "date submitted");
            if (dateErrorReason) {
                throw dateErrorReason;
            }
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }

        // Validate the score of the learner's submission
        try {
            if (submissionDetails.score === undefined) {
                throw errorMsgUndefined(objectName, "score");
            } else if (typeof submissionDetails.score != "number") {
                throw errorMsgWrongPrimitiveType(objectName, "score", typeof submissionDetails.score, "number");
            } else if (submissionDetails.score < 0) {
                throw errorMsgInvalidNumberValue(objectName, "score", submissionDetails.score, "Cannot be negative!", 0);
            }
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }
        return !hasErrors;
    } catch (error) {
        console.log(error);
        return false;
    }
}

function validateResults(result, expectedResult) {
    const resultKeys = Object.keys(result[0]);
    const expectedResultKeys = Object.keys(expectedResult[0]);
    return validateKeys(resultKeys, expectedResultKeys) === "";
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

console.log(validateResults(result, expectedResult));