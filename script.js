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
        console.log("Course Info, Assignment Group, and Learner Submissions are all valid!");
        for (let i = 0; i < submissions.length; i++) {
            const learnerSub = submissions[i];
            // console.log(learnerSub);
            let learnerObjIndex = findLearnerObj(results, learnerSub.learner_id);
            const aId = findAssignment(ag.assignments, learnerSub.assignment_id);
            if (learnerObjIndex === -1) { // If learnerObj does not exist, immediately initalize the first user
                const learnerObj = {};
                learnerObj.id = learnerSub.learner_id;
                learnerObj.avg = 0; // Create avg to store total score
                learnerObj.totalPoints = 0; // Temporary key value pair that stores total points of all assignments submitted by the learner (deleted in calculateAvgs function)
                results.push(learnerObj);
                learnerObjIndex = findLearnerObj(results, learnerSub.learner_id);
            }
            // Only add assignments to the learnerObj that have close due dates.
            const canBeChecked = includeAssignment(ag.assignments[aId])
            if (!canBeChecked || aId < 0) continue; // Skip assignments that are not close to the due date.

            const learnerObj = results[learnerObjIndex];
            const score = isLate(ag.assignments[aId], learnerSub.submission.submitted_at, learnerSub.submission.score);
            const pointsPossible = ag.assignments[aId].points_possible;
            const grade = score / pointsPossible;
            learnerObj[learnerSub.assignment_id] = roundNum(grade);
            learnerObj.avg += score;
            learnerObj.totalPoints += pointsPossible;
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
        validateArray("results", results);
        results.forEach(result => {
            try {
                validateObject("result", result);
                if (result.avg === undefined || result.totalPoints === undefined) {
                    throw "Cannot calculate average because the key avg or totalPoints was not properly initialized.";
                }
                const average = result.avg / result.totalPoints;
                result.avg = roundNum(average);
                delete result.totalPoints;
            } catch (error) {
                console.log(error);
            }
        })
    } catch (error) {
        console.log(error);
    }
}

// Check if assignment is late and updates score accordingly
function isLate(assignment, submissionDate, score) {
    if (score === 0){ // Do not check if assignment is late when score is 0
        return score;
    }
    if (submissionDate > assignment.due_at){
        return score - (assignment.points_possible * 0.1);
    }
    return score;
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

// Check if two result objects have equal values. When this function is called, it is a given that the objects have equal keys.
function areResultObjsEqual(arrayName, result, expectedResult, resultName, index) {
    for (key in result) {
        const value = result[key];

        // Validate the type of result's values
        if (key == "id") {
            validateId(resultName, value);
        } else if (key == "avg") {
            validateFloat(arrayName, value, "avg");
        } else {
            validateFloat(arrayName, value, `score of assignment with id ${key}`);
        }

        // Validate equality of result's and expectedResult's values
        if (value != expectedResult[key]) {
            throw `The ${resultName} with index ${index} and key ${key} from ${arrayName} has a value of ${value}. Expected value of ${expectedResult[key]}!`;
        }
    }
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
function errorMsgInvalidNumberValue(objectName, variableName, variable, additionalReason = "", lowerBound = 1, comparisonType = "less than") {
    return `The ${variableName} of ${objectName} is ${variable} and cannot be ${comparisonType} ${lowerBound}!` + `${(additionalReason) ? (" " + additionalReason) : ""}`;
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
function validateKeys(objectName, keys, expectedKeys) {
    if (keys === undefined) {
        throw errorMsgUnequalKeys(objectName, "is undefined.");
    } else if (keys.length > expectedKeys.length) {
        throw errorMsgUnequalKeys(objectName, "has extra keys.");
    } else if (keys.length < expectedKeys.length) {
        throw errorMsgUnequalKeys(objectName, "is missing keys.");
    } else {
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] != expectedKeys[i]) throw errorMsgUnequalKeys(objectName, `has the key ${keys[i]} instead of ${expectedKeys[i]}.`);
        }
    }
}

// Validation for id
function validateId(objectName, id, variableName = "id") {
    if (id === undefined) {
        throw errorMsgUndefined(objectName, variableName);
    } else if (typeof id != "number") {
        throw errorMsgWrongPrimitiveType(objectName, variableName, typeof id, "number");
    } else if (id < 1) {
        throw errorMsgInvalidNumberValue(objectName, variableName, id);
    } else if (id % 1) {
        throw errorMsgFloatValue(objectName, variableName, id);
    }
}

// Validation for name
function validateName(objectName, name, variableName = "name") {
    if (name === undefined) {
        throw errorMsgUndefined(objectName, variableName);
    } else if (typeof name != "string") {
        throw errorMsgWrongPrimitiveType(objectName, variableName, typeof name, "string");
    } else if (name === "") {
        throw `The ${variableName} of the ${objectName} cannot be an empty string!`;
    }
}

// Validate float numbers
function validateFloat(objectName, floatNum, variableName) {
    if (floatNum === undefined) {
        throw errorMsgUndefined(objectName, variableName);
    } else if (typeof floatNum != "number") {
        throw errorMsgWrongPrimitiveType(objectName, variableName, typeof floatNum, "number");
    } else if (floatNum < 0) {
        throw errorMsgInvalidNumberValue(objectName, variableName, floatNum, 0);
    }
}

// Ensure that the month is between 1 - 12 and that the day of month can exist.
function validateDate(objectName, date, variableName) {
    if (date === undefined) {
        throw errorMsgUndefined(objectName, variableName);
    } else if (typeof date != "string") {
        throw errorMsgWrongPrimitiveType(objectName, variableName, typeof date, "string");
    } else if (date === "") {
        throw `The ${variableName} for the ${objectName} cannot be an empty string!`;
    } else if (!date.includes("-")) {
        throw `The ${variableName} for the ${objectName} is missing '-'!`;
    } else {
        const dateArr = date.split("-");
        // Ex: ["2025", "09", "05"]
        if (dateArr.length < 3) {
            throw `The ${variableName} for the ${objectName} is missing month, day, or year!`;
        } else if (dateArr.length > 3) {
            throw `The ${variableName} for the ${objectName} has too many '-'!`;
        } else if (dateArr[0].length != 4) {
            throw `The ${variableName} for the ${objectName} has an invalid year format! Year must be four characters.`;
        } else if (dateArr[1].length != 2) {
            throw `The ${variableName} for the ${objectName} has an invalid month format! Month must be two characters.`;
        } else if (dateArr[2].length != 2) {
            throw `The ${variableName} for the ${objectName} has an invalid day format! Day must be two characters.`;
        } else {
            const monthsObj = { "01": 31, "02": 29, "03": 31, "04": 30, "05": 31, "06": 30, "07": 31, "08": 31, "09": 30, "10": 31, "11": 31, "12": 31 };
            if (monthsObj[dateArr[1]] === undefined) { // Check if month exists
                throw `The ${variableName} for the ${objectName} has an invalid month of ${dateArr[1]}! Month must be between 01 and 12.`;
            } else if (monthsObj[dateArr[1]] < Number(dateArr[2])) { // Check if day is valid
                throw `The ${variableName} for the ${objectName} has an invalid day of ${dateArr[2]}! Month is ${dateArr[1]}, so day must be between 01 and ${monthsArr[dateArr[1]]}.`;
            }
        }
    }
}

// Validates that an array provided is an Array and isn't empty
function validateArray(objectName, array, arrayName = "") {
    if (array === undefined) {
        throw errorMsgUndefined(objectName, arrayName);
    } else if (typeof array != "object") {
        throw errorMsgWrongPrimitiveType(objectName, arrayName, typeof array, "object");
    } else if (!(array instanceof Array)) {
        throw errorMsgWrongObjectType(objectName, arrayName, "Array");
    } else if (array.length === 0) {
        throw errorMsgEmpty(objectName, arrayName);
    }
}

// Validates that an object provided is an Object and isn't empty
function validateObject(objectName, object) {
    if (object === undefined) {
        throw errorMsgUndefined(objectName);
    } else if (typeof object != "object") {
        throw errorMsgWrongPrimitiveType(objectName, "", typeof object, "object");
    } else if (Object.keys(object).length === 0) {
        throw errorMsgEmpty(objectName);
    }
}

// Validates the information of the course provided by checking object structure, variable types, 
function validateCourse(course) {
    const objectName = "course";
    try {
        // Validate that course is an object
        validateObject(objectName, course);

        // Validate that the keys are properly named and that none of them are missing.
        const courseKeys = ["id", "name"];
        validateKeys(objectName, Object.keys(course), courseKeys);

        // Validate values by accessing the keys of the object
        let hasErrors = false; // Keep track of any errors from any key's value

        // Validate course group's id
        try {
            validateId(objectName, course.id);
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }

        // Validate course group's name
        try {
            validateName(objectName, course.name);
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
        validateObject(objectName, assignmentGroup);

        // Validate that the keys are properly named and that none of them are missing.
        const assignmentGroupKeys = ["id", "name", "course_id", "group_weight", "assignments"];
        validateKeys(objectName, Object.keys(assignmentGroup), assignmentGroupKeys);

        // Validate values by accessing the keys of the object
        let hasErrors = false; // Keep track of any errors from any key's value

        // Validate assignment group's id
        try {
            validateId(objectName, assignmentGroup.id);
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }

        // Validate assignment group's name
        try {
            validateName(objectName, assignmentGroup.name);
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }

        // Validate assignment group's course id
        try {
            validateId(objectName, assignmentGroup.course_id, "course id");
            if (assignmentGroup.course_id != courseId) {
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
            validateArray(objectName, assignmentGroup.assignments, "assignments");

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
        validateObject(objectName, assignment);

        // Validate that the keys are properly named and that none of them are missing.
        const assignmentKeys = ["id", "name", "due_at", "points_possible"];
        validateKeys(objectName, Object.keys(assignment), assignmentKeys);

        // Validate values by accessing the keys of the object
        let hasErrors = false; // Keep track of any errors from any key's value

        // Validate assignment's id
        try {
            validateId(objectName, assignment.id);
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }

        // Validate assignment's name
        try {
            validateName(objectName, assignment.name);
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }

        // Validate assignment's due date
        try {
            validateDate(objectName, assignment.due_at, "due date");
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
            } else if (assignment.points_possible < 0) {
                throw (errorMsgInvalidNumberValue(objectName, "points possible", assignment.points_possible, "Cannot divide be negative!"));
            } else if (assignment.points_possible === 0) {
                throw (errorMsgInvalidNumberValue(objectName, "points possible", assignment.points_possible, "Cannot divide by 0!", "equals to"));
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
        validateArray(objectName, submissions, "");

        // Validate each individual submission from the submissions array
        let hasErrors = false;

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
        validateObject(objectName, learnerSubmission);

        // Validate that the keys are properly named and that none of them are missing.
        const learnerSubmissionKeys = ["learner_id", "assignment_id", "submission"];
        validateKeys(objectName, Object.keys(learnerSubmission), learnerSubmissionKeys);

        // Validate values by accessing the keys of the object
        let hasErrors = false; // Keep track of any errors from any key's value

        // Validate the learner id of the learner's submission
        try {
            validateId(objectName, learnerSubmission.learner_id, "learner id");
        } catch (error) {
            console.log(error);
            hasErrors = true;
        }

        // Validate the assignment id of the learner's submission
        try {
            validateId(objectName, learnerSubmission.assignment_id, "assignment id");
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
        validateObject(objectName, submissionDetails);

        // Validate that the keys are properly named and that none of them are missing.
        const submissionDetailsKeys = ["submitted_at", "score"];
        validateKeys(objectName, Object.keys(submissionDetails), submissionDetailsKeys);

        // Validate values by accessing the keys of the object
        let hasErrors = false; // Keep track of any errors from any key's value

        // Validate the time of the learner's submission (submitted_at)
        try {
            validateDate(objectName, submissionDetails.submitted_at, "date submitted");
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

// Validate results (output) to the expected results
function validateResults(results, expectedResults) {
    const arrayName = "generated results";
    let hasErrors = false;
    try {
        // Validate that generated results is an array
        validateArray(arrayName, results);

        // Validate that generated results has the same number of elements as expected results
        if (results.length > expectedResult.length) {
            throw `The length of the ${arrayName} is longer than expected! Extra learner objects detected.`;
        } else if (results.length < expectedResult.length) {
            throw `The length of the ${arrayName} is shorter than expected! Missing learner objects.`;
        }

        // Validate that each element (learner object) in the array is an object with the proper keys
        const innerObjName = "learner object";
        for (let i = 0; i < results.length; i++) {
            try {
                validateObject(innerObjName, results[i]);

                // Validate that the result has the proper keys
                const resultKeys = Object.keys(results[i]);
                const expectedResultKeys = Object.keys(expectedResults[i]);
                validateKeys(arrayName, resultKeys, expectedResultKeys);

                // Validate the values of the keys
                areResultObjsEqual(arrayName, result[i], expectedResults[i], innerObjName, i);
            } catch (error) {
                console.log(error);
                hasErrors = true;
            }
        };

    } catch (error) {
        console.log(error);
        hasErrors = true;
    }
    console.log(`Results and expected results are ${(hasErrors) ? "not equal!" : "equal!"}`);
}

// TO DO: Checks for unique assignment id in ag.assignments array, unique submission (learner_id, assignment_id pair must be unique), try feeding data with errors

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

const wrongCourseIdAG = {
    id: 12345,
    name: "Fundamentals of JavaScript",
    course_id: 45,
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

const result = getLearnerData(CourseInfo, AssignmentGroup, LearnerSubmissions);
validateResults(result, expectedResult);

const wrongCourseIdAgResults = getLearnerData(CourseInfo, wrongCourseIdAG, LearnerSubmissions);