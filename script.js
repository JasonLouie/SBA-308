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

// Iterates through submission to create an array of learnerObj with the id, avg, and other key-value pairs with the assignment id as index. Returns empty array if validation for any of the three arguments fail.
function getLearnerData(course, ag, submissions) {
    const results = [];
    // Check if the course, assignment group, and submissions are valid
    try {
        validateCourse(course);
        validateAssignments(ag, course.id);
        validateSubmissions(submissions, ag.assignments);
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
    } catch (error) {
        console.log(error);
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

// Calculate all averages for results by updating avg key and removing totalPoints key.
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

// Check if assignment is late and updates score accordingly.
function isLate(assignment, submissionDate, score) {
    if (score === 0) { // Do not check if assignment is late when score is 0
        return score;
    }
    if (submissionDate > assignment.due_at) {
        return score - (assignment.points_possible * 0.1);
    }
    return score;
}

// Check if assignment is due yet.
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

// Returns the index of the learner submission by learnerId and assignmentId. Use case of the function is to check if a submission is unique based on learner_id and assignment_id using a custom object
function findLearnerSubmission(objArr, learnerId, assignmentId) {
    if (objArr.length > 0) {
        for (let i = 0; i < objArr.length; i++) {
            const obj = objArr[i];
            if (obj.learnerId === learnerId && obj.assignmentId === assignmentId) {
                return i;
            }
        };
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

// Returns the error message when the variable's value does not match the condition of the lower bound. Conditions are >, <, >=, <=, or == 
function errorMsgInvalidNumberValue(objectName, variableName, variable, additionalReason = "", bound = 1, comparisonType = "less than") {
    return `The ${variableName} of ${objectName} is ${variable} and cannot be ${comparisonType} ${bound}!` + `${(additionalReason) ? (" " + additionalReason) : ""}`;
}

// Returns the error message when the variable is a decimal/float value when it shouldn't be.
function errorMsgFloatValue(objectName, variableName, variable) {
    return `The ${variableName} of ${objectName} is ${variable} and must be an integer!`;
}

// Returns the error message when the value of the shared variable for two different objects are not the same.
function errorMsgUnequalIds(objectName1, id1, objectName2, id2, idName) {
    return `The ${idName} of the ${objectName1} is ${id1}. Expected the ${idName} to be ${id2}! The ${objectName1}'s ${idName} must match the ${objectName2}'s ${idName}!`;
}

// Returns the error message when the provided keys do not match the expected keys.
function errorMsgUnequalKeys(objectName, reason) {
    const vowels = ["a", "e", "i", "o", "u"];
    const aWord = vowels.includes(objectName[0]) ? "an" : "a";
    return `The keys for the ${objectName} provided and expected keys for ${aWord} ${objectName} are different. This ${objectName} ${reason}`;
}

// Checks if keys are equal to expected keys and gives a reason if they are not equal (reason is relative to keys).
function validateKeys(objectName, keys, expectedKeys) {
    const stmt = `The ${objectName} is not valid!`;
    if (keys === undefined) {
        throw stmt + errorMsgUnequalKeys(objectName, "is undefined.");
    } else if (keys.length > expectedKeys.length) {
        throw stmt + errorMsgUnequalKeys(objectName, "has extra keys.");
    } else if (keys.length < expectedKeys.length) {
        throw stmt + errorMsgUnequalKeys(objectName, "is missing keys.");
    } else {
        const keyErrors = [];
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] != expectedKeys[i]) {
                keyErrors.push(errorMsgUnequalKeys(objectName, `has the key ${keys[i]} instead of ${expectedKeys[i]}.`));
            }
        }
        if (keyErrors.length > 0) {
            throw `${stmt}\nErrors:\n${keyErrors.join("\n")}`;
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

// Validate float numbers (positive only)
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
    const stmt = `The ${variableName} for the ${objectName} is invalid!`
    if (date === undefined) {
        throw errorMsgUndefined(objectName, variableName);
    } else if (typeof date != "string") {
        throw errorMsgWrongPrimitiveType(objectName, variableName, typeof date, "string");
    } else if (date === "") {
        throw `${stmt} Cannot be an empty string!`;
    } else if (!date.includes("-")) {
        throw `${stmt} Missing '-'!`;
    } else {
        const dateArr = date.split("-");
        // Ex: ["2025", "09", "05"]
        if (dateArr.length < 3) {
            throw `${stmt} Missing month, day, or year!`;
        } else if (dateArr.length > 3) {
            throw `${stmt} Too many '-'!`;
        } else if (dateArr[0].length != 4) {
            throw `${stmt} Invalid year format! Year must be four characters.`;
        } else if (dateArr[1].length != 2) {
            throw `${stmt} Invalid month format! Month must be two characters.`;
        } else if (dateArr[2].length != 2) {
            throw `${stmt} Invalid day format! Day must be two characters.`;
        } else {
            const monthsObj = { "01": 31, "02": 29, "03": 31, "04": 30, "05": 31, "06": 30, "07": 31, "08": 31, "09": 30, "10": 31, "11": 31, "12": 31 };
            if (monthsObj[dateArr[1]] === undefined) { // Check if month exists
                throw `${stmt} Invalid month of ${dateArr[1]}! Month must be between 01 and 12.`;
            } else if (monthsObj[dateArr[1]] < Number(dateArr[2])) { // Check if day is valid
                throw `${stmt} Invalid day of ${dateArr[2]}! Month is ${dateArr[1]}, so day must be between 01 and ${monthsArr[dateArr[1]]}.`;
            }
        }
    }
}

// Validates that an array provided is an Array and isn't empty
function validateArray(objectName, array, arrayName = "") {
    let isAre = (arrayName[arrayName.length - 1] === "s") ? "are" : "is";
    let stmt = `The ${arrayName} of ${objectName} ${isAre} not valid!\nErrors:\n`;
    if (arrayName === "") {
        isAre = (objectName[objectName.length - 1] === "s") ? "are" : "is";
        stmt = `The ${objectName} ${isAre} not valid!\nErrors:\n`;
    }

    if (array === undefined) {
        throw stmt + errorMsgUndefined(objectName, arrayName);
    } else if (typeof array != "object") {
        throw stmt + errorMsgWrongPrimitiveType(objectName, arrayName, typeof array, "object");
    } else if (!(array instanceof Array)) {
        throw stmt + errorMsgWrongObjectType(objectName, arrayName, "Array");
    } else if (array.length === 0) {
        throw stmt + errorMsgEmpty(objectName, arrayName);
    }
}

// Validates that an object provided is an Object and isn't empty
function validateObject(objectName, object) {
    const stmt = `The ${objectName} is not valid!\nErrors:\n`;
    if (object === undefined) {
        throw stmt + errorMsgUndefined(objectName);
    } else if (typeof object != "object") {
        throw stmt + errorMsgWrongPrimitiveType(objectName, "", typeof object, "object");
    } else if (Object.keys(object).length === 0) {
        throw stmt + errorMsgEmpty(objectName);
    }
}

// Validates the information of the course provided by checking object structure, variable types, 
function validateCourse(course) {
    const objectName = "course";
    // Validate that course is an object
    validateObject(objectName, course);

    // Validate that the keys are properly named and that none of them are missing.
    const courseKeys = ["id", "name"];
    validateKeys(objectName, Object.keys(course), courseKeys);

    // Validate values by accessing the keys of the object
    const courseErrors = [];// Keep track of any errors from any key's value

    // Validate course group's id
    try {
        validateId(objectName, course.id);
    } catch (error) {
        courseErrors.push(error);
    }

    // Validate course group's name
    try {
        validateName(objectName, course.name);
    } catch (error) {
        courseErrors.push(error);
    }

    // Throw an error if the course had an errors from validation
    if (courseErrors.length > 0) {
        throw `The ${objectName} is not valid!\nErrors:\n${courseErrors.join("\n")}`;
    }
}

// Check the entire assignment group
function validateAssignments(assignmentGroup, courseId) {
    const objectName = "assignment group";
    // Validate that assignmentGroup is an object
    validateObject(objectName, assignmentGroup);

    // Validate that the keys are properly named and that none of them are missing.
    const assignmentGroupKeys = ["id", "name", "course_id", "group_weight", "assignments"];
    validateKeys(objectName, Object.keys(assignmentGroup), assignmentGroupKeys);

    // Validate values by accessing the keys of the object
    const assignmentGroupErrors = []; // Keep track of any errors from any key's value

    // Validate assignment group's id
    try {
        validateId(objectName, assignmentGroup.id);
    } catch (error) {
        assignmentGroupErrors.push(error);
    }

    // Validate assignment group's name
    try {
        validateName(objectName, assignmentGroup.name);
    } catch (error) {
        assignmentGroupErrors.push(error);
    }

    // Validate assignment group's course id
    try {
        validateId(objectName, assignmentGroup.course_id, "course id");
        if (assignmentGroup.course_id != courseId) {
            throw errorMsgUnequalIds(objectName, assignmentGroup.course_id, "course", courseId, "course id");
        }
    } catch (error) {
        assignmentGroupErrors.push(error);
    }

    // Validate assignment group's group weight
    try {
        if (assignmentGroup.group_weight === undefined) {
            throw errorMsgUndefined(objectName, "group weight");
        } else if (typeof assignmentGroup.group_weight != "number") {
            throw errorMsgWrongPrimitiveType(objectName, "group weight", typeof assignmentGroup.group_weight, "number");
        } else if (assignmentGroup.group_weight < 1) {
            throw errorMsgInvalidNumberValue(objectName, "group weight", assignmentGroup.group_weight);
        } else if (assignmentGroup.group_weight > 100) {
            throw errorMsgInvalidNumberValue(objectName, "group weight", assignmentGroup.group_weight, "Group weight percentage cannot be greater than 100!", 100, "greater than");
        }
    } catch (error) {
        assignmentGroupErrors.push(error);
    }

    // Validate assignment group's assignments array
    try {
        validateArray(objectName, assignmentGroup.assignments, "assignments");

        // Validate each individual assignment from the assignment group's assignments array
        const assignmentIds = [];

        for (let i = 0; i < assignmentGroup.assignments.length; i++) {
            const assignment = assignmentGroup.assignments[i];
            try {
                validateAssignment(objectName, assignment, i);
                // Ensure unique assignment ids
                if (assignmentIds.includes(assignment.id)) {
                    throw `Assignment of id ${assignment.id} already exists in ${objectName}!`;
                }
                assignmentIds.push(assignment.id);
            } catch (error) {
                assignmentGroupErrors.push(error);
            }
        };
    } catch (error) {
        assignmentGroupErrors.push(error);
    }

    // Throw error message if the assignment group had any errors from validation
    if (assignmentGroupErrors.length > 0) {
        throw `The ${objectName} is not valid!\nErrors:\n${assignmentGroupErrors.join("\n")}`;
    }
}

// Validate the individual assignment object
function validateAssignment(outerObjectName, assignment, index) {
    const objectName = "assignment";

    // Validate that assignment is an object
    validateObject(objectName, assignment);

    // Validate that the keys are properly named and that none of them are missing.
    const assignmentKeys = ["id", "name", "due_at", "points_possible"];
    validateKeys(objectName, Object.keys(assignment), assignmentKeys);

    // Validate values by accessing the keys of the object
    const assignmentErrors = []; // Keep track of any errors from any key's value

    // Validate assignment's id
    try {
        validateId(objectName, assignment.id);
    } catch (error) {
        assignmentErrors.push(error);
    }

    // Validate assignment's name
    try {
        validateName(objectName, assignment.name);
    } catch (error) {
        assignmentErrors.push(error);
    }

    // Validate assignment's due date
    try {
        validateDate(objectName, assignment.due_at, "due date");
    } catch (error) {
        assignmentErrors.push(error);
    }

    // Validate assignment's points possible
    try {
        if (assignment.points_possible === undefined) {
            throw (errorMsgUndefined(objectName, "points possible"));
        } else if (typeof assignment.points_possible != "number") {
            throw (errorMsgWrongPrimitiveType(objectName, "points possible", typeof assignment.points_possible, "number"));
        } else if (assignment.points_possible < 0) {
            throw (errorMsgInvalidNumberValue(objectName, "points possible", assignment.points_possible, "Cannot be negative!"));
        } else if (assignment.points_possible === 0) {
            throw (errorMsgInvalidNumberValue(objectName, "points possible", assignment.points_possible, "Cannot divide by 0!", "equals to"));
        }
    } catch (error) {
        assignmentErrors.push(error);
    }

    // Throw an error if the assignment had any errors from validation
    if (assignmentErrors.length > 0) {
        throw `The ${objectName} of id ${assignment.id} from ${outerObjectName} with index ${index} is invalid!\nErrors:\n${assignmentErrors.join("\n")}`;
    }
}

// Validate the array of submissions
function validateSubmissions(submissions, assignments) {
    const arrayName = "learners' submissions";

    // Validate that submissions is an array
    validateArray(arrayName, submissions, "");

    // Validate each individual submission from the submissions array
    const submissionErrors = []; // Keep track of any errors from any learnerSubmission element of the array

    const submissionObjsArray = []; // Array of object {learnerId: value, assignmentId: value}
    for (let i = 0; i < submissions.length; i++) {
        const learnerSubmission = submissions[i];
        try {
            validateLearnerSubmission(learnerSubmission, assignments, i);

            // Handles repeated learner submissions (a unique submission has a unique pair of learner_id and assignment_id)
            const index = findLearnerSubmission(submissionObjsArray, learnerSubmission.learner_id, learnerSubmission.assignment_id);
            if (index === -1) {
                const newSubmissionObj = {};
                newSubmissionObj.learnerId = learnerSubmission.learner_id;
                newSubmissionObj.assignmentId = learnerSubmission.assignment_id;
                submissionObjsArray.push(newSubmissionObj);
            } else {
                throw `A duplicate of a learner submission with learner_id ${learnerSubmission.learner_id} and assignment_id ${learnerSubmission.assignment_id} was found!`
            }
        } catch (error) {
            submissionErrors.push(error);
        }
    };

    // Throw an error if the submissions array had any errors from validation
    if (submissionErrors.length > 0) {
        throw `The ${arrayName} is not valid!\nErrors:\n${submissionErrors.join("\n")}`;
    }
}

// Validate the individual submission object of a specific learner
function validateLearnerSubmission(learnerSubmission, assignments, index) {
    const objectName = "learner's submission";
    // Validate that learnerSubmission is an object
    validateObject(objectName, learnerSubmission);

    // Validate that the keys are properly named and that none of them are missing.
    const learnerSubmissionKeys = ["learner_id", "assignment_id", "submission"];
    validateKeys(objectName, Object.keys(learnerSubmission), learnerSubmissionKeys);

    // Validate values by accessing the keys of the object
    const learnerSubmissionErrors = []; // Keep track of any errors from any key's value

    // Validate the learner id of the learner's submission
    try {
        validateId(objectName, learnerSubmission.learner_id, "learner id");
    } catch (error) {
        learnerSubmissionErrors.push(error);
    }

    // Validate the assignment id of the learner's submission
    try {
        validateId(objectName, learnerSubmission.assignment_id, "assignment id");
        if (findAssignment(assignments, learnerSubmission.assignment_id) === -1) {
            throw `The ${objectName}'s assignment id of ${learnerSubmission.assignment_id} does not exist in the assignment group!`;
        }
    } catch (error) {
        learnerSubmissionErrors.push(error);
    }

    // Validate the inner submission's details of the learner's submission
    try {
        // Validate the submission object of the learner's submission:
        validateInnerSubmission(learnerSubmission);
    } catch (error) {
        learnerSubmissionErrors.push(error);
    }

    // Throw an error if the learnerSubmission object had any errors from validation
    if (learnerSubmissionErrors.length > 0) {
        throw `The ${objectName} at index ${index} is invalid!\nErrors:\n${learnerSubmissionErrors.join("\n")}`;
    };
}

// Validate the details of a learner's submission (the nested 'submission' object)
function validateInnerSubmission(learnerSubmission) {
    const objectName = "submission's details";
    const submissionDetails = learnerSubmission.submission;
    // Validate that submissionDetails is an object
    validateObject(objectName, submissionDetails);

    // Validate that the keys are properly named and that none of them are missing.
    const submissionDetailsKeys = ["submitted_at", "score"];
    validateKeys(objectName, Object.keys(submissionDetails), submissionDetailsKeys);

    // Validate values by accessing the keys of the object
    const submissionDetailErrors = []; // Keep track of any errors from any key's value

    // Validate the time of the submission's details (submitted_at)
    try {
        validateDate(objectName, submissionDetails.submitted_at, "date submitted");
    } catch (error) {
        submissionDetailErrors.push(error);
    }

    // Validate the score of the submission's details
    try {
        validateFloat(objectName, submissionDetails.score, "score");
    } catch (error) {
        submissionDetailErrors.push(error);
    }

    // Throw error message if the learnerSubmission's submission object had any errors from validation
    if (submissionDetailErrors.length > 0) {
        throw `The learner's submission details with learner id of ${learnerSubmission.learner_id} and assignment id of ${learnerSubmission.assignment_id} is invalid!\nErrors:\n${submissionDetailErrors.join("\n")}`;
    };
}

// Validate results (output) to the expected results
function validateResults(testName, results, expectedResults) {
    const arrayName = "generated results";
    const resultErrors = [];
    try {
        // Validate that generated results is an array
        validateArray(arrayName, results);

        // Validate that generated results has the same number of elements as expected results
        if (results.length > expectedResult.length) {
            resultErrors.push(`The length of the ${arrayName} is longer than expected! Extra learner objects detected.`);
        } else if (results.length < expectedResult.length) {
            resultErrors.push(`The length of the ${arrayName} is shorter than expected! Missing learner objects.`);
        } else {
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
                    resultErrors.push(error);
                }
            };
        }

    } catch (error) {
        console.log(`${testName}:\nResults and expected results are not equal!`)
        console.log(error);
        return;
    }
    if (resultErrors.length > 0) {
        console.log(`${testName}:\nResults and expected results are not equal!`);
        console.log(`Errors:\n${resultErrors.join("\n")}`);
    } else {
        console.log(`${testName}:\nResults and expected results are equal!`);
    }
}

// TO DO: Checks for unique assignment id in ag.assignments array, unique submission (learner_id, assignment_id pair must be unique)
// MUST try feeding data with errors

// Tests
// Exact desired array
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

// Desired array modifying the avg in obj2
const differentExpectedResult = [
    {
        id: 125, // Same
        avg: 0.985, // Same
        1: 0.94, // Same
        2: 1.0 // Same
    },
    {
        id: 132, // Same
        avg: 0.82, // Same
        1: 0.78, // Same
        2: 0.87 // Diff: Should be 0.833
    }
];

// LearnerSubmissions, but elements are unordered
const unorderedLearnerSubmissions = [
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
        assignment_id: 2,
        submission: {
            submitted_at: "2023-03-07",
            score: 140
        }
    },
    {
        learner_id: 125,
        assignment_id: 1,
        submission: {
            submitted_at: "2023-01-25",
            score: 47
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
        learner_id: 125,
        assignment_id: 2,
        submission: {
            submitted_at: "2023-02-12",
            score: 150
        }
    }
];

// Same as LearnerSubmissions, but contains a duplicated entry (another entry with the same pair of learner_id and assignment_id)
const duplicateLearnerSubmissions = [
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
        assignment_id: 2,
        submission: {
            submitted_at: "2023-03-07",
            score: 140
        }
    },
    {
        learner_id: 125,
        assignment_id: 1,
        submission: {
            submitted_at: "2023-01-25",
            score: 47
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
        learner_id: 125,
        assignment_id: 2,
        submission: {
            submitted_at: "2023-02-12",
            score: 150
        }
    },
    {
        learner_id: 132,
        assignment_id: 2,
        submission: {
            submitted_at: "2023-02-27",
            score: 140
        }
    },
];

// Same as AssignmentGroup, but course_id is 45 instead of 451
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

const highPercentAG = {
    id: 12345,
    name: "Fundamentals of JavaScript",
    course_id: 451,
    group_weight: 125,
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

// Assignment Group with negative id, empty name, decimal course_id, wrong type group_weight, repeated assignments (repeated id of 1)
const erroneousAG = {
    id: -12345,
    name: "",
    course_id: 4.51,
    group_weight: "25",
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
        },
        {
            id: 3, // Repeated id
            name: "Code Outer Space",
            due_at: "5167-10-05",
            points_possible: 5000
        },
    ]
};

// Initial test
const result = getLearnerData(CourseInfo, AssignmentGroup, LearnerSubmissions);
validateResults("Original Test", result, expectedResult);
validateResults("Different Expected Results (Different Value for a Key)", result, differentExpectedResult); // Tests passed!

const result2 = getLearnerData(CourseInfo, AssignmentGroup, unorderedLearnerSubmissions);
validateResults("Unordered Submissions", result2, expectedResult);

const erroneousAGResult = getLearnerData(CourseInfo, erroneousAG, LearnerSubmissions);
validateResults("Erroneous Assignment Group", erroneousAGResult, expectedResult);
// const wrongCourseIdAgResults = getLearnerData(CourseInfo, wrongCourseIdAG, LearnerSubmissions);
// validateResults("Assignment with Wrong Course Id", wrongCourseIdAgResults, expectedResult);

// const highPercentAGResults = getLearnerData(CourseInfo, highPercentAG, LearnerSubmissions);
// validateResults("Assignment with Group Weight > 100", highPercentAGResults, expectedResult);