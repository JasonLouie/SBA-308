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
        // Will throw an error if the course object is invalid. This is good because an invalid course id would mess up the assignments validation.
        validateCourse(course);

        // Will throw an error if the assignment group object is invalid. This is good because an invalid assignments array from the assignment group would mess up the submissions validation.
        validateAssignmentGroup(ag, course.id);

        // Will throw an error if the array of submissions is invalid. This is good because retrieving learner data relies on iterating through the submissions array. There is no reason to iterate through an invalid submissions array.
        validateSubmissions(submissions, ag.assignments);
        console.log("Course Info, Assignment Group, and Learner Submissions are all valid!");

        for (let i = 0; i < submissions.length; i++) {
            const learnerSub = submissions[i];
            const aId = findAssignment(ag.assignments, learnerSub.assignment_id);

            // If assignment isn't due yet, do not attempt to make or modify the learner object. The reason is to handle the case of creating the learner object only to find out that this was the only submission from that learner. This will end up leaving an incomplete learner object that will fail tests later on.
            const canBeChecked = includeAssignment(ag.assignments[aId])
            if (!canBeChecked || aId < 0) continue; // Skip assignments that are not close to the due date or not found.

            let learnerObjIndex = findLearnerObj(results, learnerSub.learner_id);

            if (learnerObjIndex === -1) { // If learnerObj does not exist, immediately initalize the first user
                const learnerObj = {};
                learnerObj.id = learnerSub.learner_id;
                learnerObj.avg = 0; // Create avg to store total score
                learnerObj.totalPoints = 0; // Temporary key value pair that stores total points of all assignments submitted by the learner (deleted in calculateAvgs function)
                results.push(learnerObj);
                learnerObjIndex = findLearnerObj(results, learnerSub.learner_id);
            }

            const learnerObj = results[learnerObjIndex];
            const score = updateLateScore(ag.assignments[aId], learnerSub.submission.submitted_at, learnerSub.submission.score);
            const pointsPossible = ag.assignments[aId].points_possible;
            const grade = score / pointsPossible;

            // Add key value pairs to learnerObj
            learnerObj[learnerSub.assignment_id] = roundNum(grade);
            learnerObj.avg += score;
            learnerObj.totalPoints += pointsPossible;
        }
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
function updateLateScore(assignment, submissionDate, score) {
    const isLate = submissionDate > assignment.due_at;
    const penalty = assignment.points_possible * 0.1;
    if (score <= penalty && isLate) { // Check if assignment is late and less than or equal to the penalty. If it is then, return a 0 to avoid a negative score.
        return 0;
    } else if (isLate) { // Check if assignment is late
        return score - penalty;
    }
    return score;
}

// Check if assignment is due yet by comparing the assignment's due date to the hard-coded date of 2025-09-05
function includeAssignment(assignment) {
    const todaysDate = "2025-09-05";
    return todaysDate > assignment.due_at;
}

// Returns the index of the assignment object with assignment id = assignmentId. Returns -1 if the assignment with assignmentId cannot be found.
function findAssignment(assignments, assignmentId) {
    if (assignments.length > 0) {
        for (let i = 0; i < assignments.length; i++) {
            if (assignments[i].id == assignmentId) {
                return i;
            }
        }
    }
    return -1;
}

// Returns the index of the learner object with id = learnerId. Returns -1 if the learner object with learnerId cannot be found.
function findLearnerObj(results, learnerId) {
    if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            if (results[i].id == learnerId) {
                return i;
            }
        }
    }
    return -1;
}

// Returns the index of the learner submission by learnerId and assignmentId. Use case of the function is to check if a submission is unique based on learner_id and assignment_id using a custom object.
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

// Returns the error message for undefined variables. If objectName is only provided, it is treated as the variable name.
function errorMsgUndefined(objectName, variableName = "") {
    if (!variableName) {
        return `The ${objectName} must be defined!`;
    }
    return `The ${variableName} of the ${objectName} must be defined!`;
}

// Returns the error message for empty strings/objects/arrays.
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

// Returns the error message for objects of the wrong object type. If objectName is only provided, it is treated as the variable name.
function errorMsgWrongObjectType(objectName, variableName = "", expectedType) {
    if (!variableName) {
        return `The ${objectName} must be an ${expectedType}.`;
    }
    return `The ${objectName}'s ${variableName} must be an ${expectedType}.`;
}

// Returns the error message when the variable's value does not match the condition of the lower bound. Conditions are >, <, >=, <=, or == 
function errorMsgInvalidNumberValue(objectName, variableName, variable, additionalReason = "", bound = 1, comparisonType = "less than") {
    return `The ${variableName} of the ${objectName} is ${variable} and cannot be ${comparisonType} ${bound}!` + `${(additionalReason) ? (" " + additionalReason) : ""}`;
}

// Returns the error message when the variable is a decimal/float value when it shouldn't be.
function errorMsgFloatValue(objectName, variableName, variable) {
    return `The ${variableName} of ${objectName} is ${variable} and must be an integer!`;
}

// Returns the error message when the value of the shared variable for two different objects are not the same.
function errorMsgUnequalIds(objectName1, id1, objectName2, id2, idName) {
    return `The ${idName} of the ${objectName1} is ${id1}. Expected the ${idName} to be ${id2}! The ${objectName1}'s ${idName} must match the ${objectName2}'s ${idName}!`;
}

// Checks if keys are equal to expected keys and throws an error if they are not equal (reason is relative to keys).
function validateKeys(objectName, keys, expectedKeys) {
    if (keys === undefined) {
        throw `The ${objectName} is undefined.`;
    } else if (keys.length > expectedKeys.length) {
        throw `The ${objectName} has extra keys.`;
    } else if (keys.length < expectedKeys.length) {
        throw `The ${objectName} is missing keys.`;
    } else {
        const wrongKeys = [];
        for (let i = 0; i < keys.length; i++) {
            if (expectedKeys.includes(keys[i])) {
                continue;
            }
            wrongKeys.push(keys[i]);
        }
        if (wrongKeys.length === 1) {
            throw `The ${objectName} has an invalid key: ${wrongKeys[0]}. The expected keys are ${expectedKeys.join(", ")}!`;
        } else if (wrongKeys.length > 1) {
            throw `The ${objectName} has invalid keys: ${wrongKeys.join(", ")}. The expected keys are ${expectedKeys.join(", ")}!`;
        }
    }
}

// Validation for id that throws an error if conditions are not met.
function validateId(objectName, id, variableName = "id") {
    if (id === undefined) {
        throw errorMsgUndefined(objectName, variableName);
    } else if (typeof id != "number") {
        throw errorMsgWrongPrimitiveType(objectName, variableName, typeof id, "number");
    } else if (id === 0) {
        throw errorMsgInvalidNumberValue(objectName, variableName, id, "Cannot be 0!", "equals to");
    } else if (id < 1) {
        throw errorMsgInvalidNumberValue(objectName, variableName, id, "Cannot be a negative number!");
    } else if (id % 1) {
        throw errorMsgFloatValue(objectName, variableName, id);
    }
}

// Validation for name that throws an error if conditions are not met.
function validateName(objectName, name, variableName = "name") {
    if (name === undefined) {
        throw errorMsgUndefined(objectName, variableName);
    } else if (typeof name != "string") {
        throw errorMsgWrongPrimitiveType(objectName, variableName, typeof name, "string");
    } else if (name === "") {
        throw `The ${variableName} of the ${objectName} cannot be an empty string!`;
    }
}

// Validation float numbers (positive only) that throws an error if conditions are not met
function validateFloat(objectName, floatNum, variableName) {
    if (floatNum === undefined) {
        throw errorMsgUndefined(objectName, variableName);
    } else if (typeof floatNum != "number") {
        throw errorMsgWrongPrimitiveType(objectName, variableName, typeof floatNum, "number");
    } else if (floatNum < 0) {
        throw errorMsgInvalidNumberValue(objectName, variableName, floatNum, 0);
    }
}

// Validation for date that throws an error if conditions are not met.
function validateDate(objectName, date, variableName) {
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
            throw `Missing month, day, or year!`;
        } else if (dateArr.length > 3) {
            throw `Too many '-'!`;
        } else if (dateArr[0].length != 4) {
            throw `Invalid year format! Year must be four characters.`;
        } else if (dateArr[1].length != 2) {
            throw `Invalid month format! Month must be two characters.`;
        } else if (dateArr[2].length != 2) {
            throw `Invalid day format! Day must be two characters.`;
        } else {
            const monthsObj = { "01": 31, "02": 28, "03": 31, "04": 30, "05": 31, "06": 30, "07": 31, "08": 31, "09": 30, "10": 31, "11": 31, "12": 31 };
            if (monthsObj[dateArr[1]] === undefined) { // Check if month exists
                throw `Invalid month of ${dateArr[1]}! Month must be between 01 and 12.`;
            } else if (monthsObj[dateArr[1]] < Number(dateArr[2])) { // Check if day is valid
                throw `Invalid day of ${dateArr[2]}! Month is ${dateArr[1]}, so day must be between 01 and ${monthsObj[dateArr[1]]}.`;
            }
        }
    }
}

// Validation for an array that throws an error if conditions are not met.
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

// Validation for an object that throws an error if conditions are not met.
function validateObject(objectName, object) {
    if (object === undefined) {
        throw errorMsgUndefined(objectName);
    } else if (typeof object != "object") {
        throw errorMsgWrongPrimitiveType(objectName, "", typeof object, "object");
    } else if (Object.keys(object).length === 0) {
        throw errorMsgEmpty(objectName);
    }
}

// Validation for course information that throws an error if conditions are not met. 
function validateCourse(course) {
    const objectName = "course";
    const courseErrors = [];

    try {
        // Validate that course is an object
        validateObject(objectName, course);

        // Validate that the keys are properly named and that none of them are missing.
        const courseKeys = ["id", "name"];
        validateKeys(objectName, Object.keys(course), courseKeys);
    } catch (error) {
        courseErrors.push(error);
    }

    // Only perform this validation if object and keys validation were successful
    if (courseErrors.length === 0) {
        // Validate values by accessing the keys of the object

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
    }

    // Throw an error if the course had an errors from validation
    if (courseErrors.length > 0) {
        throw `Course Errors:\nThe ${objectName} is not valid!\n${courseErrors.join("\n")}`;
    }
}

// Validate the entire assignment group
function validateAssignmentGroup(assignmentGroup, courseId) {
    const objectName = "assignment group";
    const assignmentGroupErrors = [];
    try {
        // Validate that assignmentGroup is an object
        validateObject(objectName, assignmentGroup);

        // Validate that the keys are properly named and that none of them are missing.
        const assignmentGroupKeys = ["id", "name", "course_id", "group_weight", "assignments"];
        validateKeys(objectName, Object.keys(assignmentGroup), assignmentGroupKeys);
    } catch (error) {
        assignmentGroupErrors.push(error);
    }

    // Only perform this validation if object and keys validation were successful
    if (assignmentGroupErrors.length === 0) {
        // Validate values by accessing the keys of the object

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
            validateFloat(objectName, assignmentGroup.group_weight, "group weight");
            if (assignmentGroup.group_weight > 100) {
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
                    assignmentGroupErrors.push(error + "\n");
                }
            }
        } catch (error) {
            assignmentGroupErrors.push(error);
        }
    }

    // Throw error message if the assignment group had any errors from validation
    if (assignmentGroupErrors.length > 0) {
        throw `Assignment Group Errors:\nThe ${objectName} is not valid!\n${assignmentGroupErrors.join("\n")}`;
    }
}

// Validate the individual assignment object
function validateAssignment(outerObjectName, assignment, index) {
    const objectName = "assignment";
    const assignmentErrors = [];
    try {
        // Validate that assignment is an object
        validateObject(objectName, assignment);

        // Validate that the keys are properly named and that none of them are missing.
        const assignmentKeys = ["id", "name", "due_at", "points_possible"];

        validateKeys(objectName, Object.keys(assignment), assignmentKeys);
    } catch (error) {
        assignmentErrors.push(error);
    }

    // Only perform this validation if object and keys validation were successful
    if (assignmentErrors.length === 0) {
        // Validate values by accessing the keys of the object

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
            validateFloat(objectName, assignment.points_possible, "points possible");
            if (assignment.points_possible === 0) {
                throw (errorMsgInvalidNumberValue(objectName, "points possible", assignment.points_possible, "Cannot divide by 0!", "equals to"));
            }
        } catch (error) {
            assignmentErrors.push(error);
        }
    }

    // Throw an error if the assignment had any errors from validation
    if (assignmentErrors.length > 0) {
        throw `The ${objectName} of id ${assignment.id} from the ${outerObjectName}'s assignments array with index ${index} is invalid!\n${assignmentErrors.join("\n")}`;
    }
}

// Validate the array of submissions
function validateSubmissions(submissions, assignments) {
    const arrayName = "submissions array";
    const submissionErrors = [];

    try {
        // Validate that submissions is an array
        validateArray(arrayName, submissions, "", "Submissions Array");
    } catch (error) {
        submissionErrors.push(error);
    }

    // Only perform this validation if array validation was successful
    if (submissionErrors.length === 0) {
        // Validate each individual submission from the submissions array

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
                submissionErrors.push(error + "\n");
            }
        }
    }

    // Throw an error if the submissions array had any errors from validation
    if (submissionErrors.length > 0) {
        throw `Submissions Array Errors:\nThe ${arrayName} is not valid!\n${submissionErrors.join("\n")}`;
    }
}

// Validate the individual submission object of a specific learner
function validateLearnerSubmission(learnerSubmission, assignments, index) {
    const objectName = "learner's submission";
    const learnerSubmissionErrors = [];

    try {
        // Validate that learnerSubmission is an object
        validateObject(objectName, learnerSubmission, "Learner's Submission");

        // Validate that the keys are properly named and that none of them are missing.
        const learnerSubmissionKeys = ["learner_id", "assignment_id", "submission"];
        validateKeys(objectName, Object.keys(learnerSubmission), learnerSubmissionKeys);
    } catch (error) {
        learnerSubmissionErrors.push(error);
    }

    // Only perform this validation if object and keys validation were successful
    if (learnerSubmissionErrors.length === 0) {
        // Validate values by accessing the keys of the object

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
            // Validate the submission details object of the learner's submission:
            validateInnerSubmission(learnerSubmission);
        } catch (error) {
            learnerSubmissionErrors.push(error);
        }
    }

    // Throw an error if the learnerSubmission object had any errors from validation
    if (learnerSubmissionErrors.length > 0) {
        throw `The ${objectName} at index ${index} is invalid!\n${learnerSubmissionErrors.join("\n")}`;
    }
}

// Validate the details of a learner's submission (the nested 'submission' object)
function validateInnerSubmission(learnerSubmission) {
    const objectName = "submission details";
    const submissionDetails = learnerSubmission.submission;
    const submissionDetailErrors = [];
    try {
        // Validate that submissionDetails is an object
        validateObject(objectName, submissionDetails, "Submission Details");

        // Validate that the keys are properly named and that none of them are missing.
        const submissionDetailsKeys = ["submitted_at", "score"];
        validateKeys(objectName, Object.keys(submissionDetails), submissionDetailsKeys);
    } catch (error) {
        submissionDetailErrors.push(error);
    }

    // Only perform this validation if object and keys validation were successful
    if (submissionDetailErrors.length === 0) {
        // Validate values by accessing the keys of the object
        // Keep track of any errors from any key's value

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
    }

    // Throw error message if the learnerSubmission's submission object had any errors from validation
    if (submissionDetailErrors.length > 0) {
        throw `The learner's ${objectName} with learner id of ${learnerSubmission.learner_id} and assignment id of ${learnerSubmission.assignment_id} is invalid!\n${submissionDetailErrors.join("\n")}`;
    }
}

// Validate results (output) to the expected results
function validateResults(testName, results, expectedResults) {
    const arrayName = "generated results";
    const resultErrors = [];
    try {
        // Validate that generated results is an array
        validateArray(arrayName, results, "", "Generated Results");

        // Validate that generated results has the same number of elements as expected results
        if (results.length > expectedResults.length) {
            resultErrors.push(`The length of the ${arrayName} is longer than expected! Extra learner objects detected.`);
        } else if (results.length < expectedResults.length) {
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
                    validateKeys(innerObjName, resultKeys, expectedResultKeys);

                    // Validate the values of the keys
                    validateEqualResults(arrayName, results[i], expectedResults[i], innerObjName, i);
                } catch (error) {
                    resultErrors.push(error + "\n");
                }
            }
        }

    } catch (error) {
        resultErrors.push(error);
    }
    if (resultErrors.length > 0) {
        console.log(`${testName}: Results and expected results are not equal!`);
        console.log(`Generated Results Errors:\n${resultErrors.join("\n")}`);
    } else {
        console.log(`${testName}: Results and expected results are equal!`);
    }
    console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"); // Log a divider to symbolize end of the test.
}

// Check if two learner objects have equal values. When this function is called, it is a given that the objects have equal keys.
function validateEqualResults(arrayName, result, expectedResult, resultName, index) {
    const valueErrors = [];
    for (key in result) {
        const value = result[key];

        // Validate the type of result's values
        try {
            if (key == "id") {
                validateId(resultName, value);
            } else if (key == "avg") {
                validateFloat(resultName, value, "avg");
            } else {
                validateFloat(resultName, value, `score of assignment with id ${key}`);
            }
        } catch (error) {
            valueErrors.push(error);
        }

        // Validate equality of result's and expectedResult's values
        if (value != expectedResult[key]) {
            valueErrors.push(`The ${resultName} with index ${index} and key ${key} from ${arrayName} has a value of ${value}. Expected value of ${expectedResult[key]}!`);
        } else if (typeof value != typeof expectedResult[key]) {
            valueErrors.push(`The value of ${resultName} with key [${key}] with index ${index} from ${arrayName} is type ${typeof value} instead of ${typeof expectedResult[key]}!`);
        }
    }

    if (valueErrors.length > 0) {
        throw valueErrors.join("\n");
    }
}

// Test Variables
// The provided results array
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

// Desired array modifying the avg in obj2 from 0.833 to 0.87
const differentResult = [
    {
        id: 125,
        avg: 0.985,
        1: 0.94,
        2: 1.0
    },
    {
        id: 132,
        avg: 0.82,
        1: 0.78,
        2: 0.87 // Diff: Should be 0.833
    }
];

// Different keys in results array
const differentKeysResult = [
    {
        id: 125,
        average: 0.985,
        assignment1: 0.94,
        assignment2: 1.0
    },
    {
        id: 132,
        average: 0.82,
        assignment1: 0.78,
        assignment2: 0.833
    },
];

// Test case for expected output desiring more objects in the array
const moreResult = [
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
    },
    {
        id: 139,
        avg: 0.985, // (47 + 150) / (50 + 150)
        1: 0.94, // 47 / 50
        2: 1.0 // 150 / 150
    },
    {
        id: 146,
        avg: 0.82, // (39 + 125) / (50 + 150)
        1: 0.78, // 39 / 50
        2: 0.833 // late: (140 - 15) / 150
    }
];

// Test case for expected output desiring less objects in the array
const lessResult = [
    {
        id: 125,
        avg: 0.985, // (47 + 150) / (50 + 150)
        1: 0.94, // 47 / 50
        2: 1.0 // 150 / 150
    }
];

// Test case for expected output wrong types for values
const wrongTypeResult = [
    {
        id: "125",
        avg: "0.985",
        1: 0.94,
        2: 1.0
    },
    {
        id: 132,
        avg: 0.82,
        1: "0.78",
        2: "0.833"
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

// Entry at index 0: Wrong learner_id type, undefined assignment_id, wrong keys but same amount
// Entry at index 1: learner_id as a negative, assignment_id as a float, submission object with missing key (score)
// Entry at index 2: Missing key of assignment_id
// Entry at index 3: The assignment_id doesn't exist in AssignmentGroup and submission object has extra keys
// Entry at index 4: Submission object has proper keys, but value types are wrong.
const wrongLearnerSubs = [
    {
        learner_id: "125",
        assignment_id: undefined,
        submission: {
            date_submitted: "2023-01-25",
            points_earned: 47
        }
    },
    {
        learner_id: -125,
        assignment_id: 2.3,
        submission: {
            submitted_at: "2023-02-12",
        }
    },
    {
        learner_id: 125,
        submission: {
            submitted_at: "2023-01-25",
            score: 400
        }
    },
    {
        learner_id: 132,
        assignment_id: 12,
        submission: {
            submitted_at: "2023-01-24",
            score: 39,
            time_submitted: "08:56 PM"
        }
    },
    {
        learner_id: 132,
        assignment_id: 2,
        submission: {
            submitted_at: 2023,
            score: "140"
        }
    }
];

// Entry at index 0: Submission object as an array (Post tests: Noticed that since an array is an object, it makes sense that the numerical indexes are the keys)
// Entry at index 1: Submission object correct value types, wrong value (invalid date, negative score)
// Entry at index 2: Submission object undefined score and submitted_at
// Entry at index 3: Submission object invalid submitted_at - Nonexistent day of month 
// Entry at index 4: Submission invalid submitted_at - Nonexistent month
// Entry at index 5: Submission invalid submitted_at - Year less than 1000 (not 4 characters as expected)
// Entry at index 6: Submission invalid submitted_at - Date has too many '-'
const wrongLearnerSubs2 = [
    {
        learner_id: 125,
        assignment_id: 1,
        submission: [
            "2023-01-25",
            47
        ]
    },
    {
        learner_id: 125,
        assignment_id: 2,
        submission: {
            submitted_at: "This is not a date",
            score: -150
        }
    },
    {
        learner_id: 125,
        assignment_id: 3,
        submission: {
            submitted_at: undefined,
            score: undefined
        }
    },
    {
        learner_id: 132,
        assignment_id: 1,
        submission: {
            submitted_at: "2023-01-39",
            score: 39
        }
    },
    {
        learner_id: 132,
        assignment_id: 2,
        submission: {
            submitted_at: "2023-13-07",
            score: 140
        }
    },
    {
        learner_id: 132,
        assignment_id: 3,
        submission: {
            submitted_at: "224-03-07",
            score: 140
        }
    },
    {
        learner_id: 138,
        assignment_id: 1,
        submission: {
            submitted_at: "2024-03-07-5",
            score: 140
        }
    }
];

// String id, array name
const wrongCourseInfo = {
    id: "4",
    name: ["This", "is", "not", "a", "string"]
};

// Negative id, empty name
const wrongCourseInfo2 = {
    id: -643,
    name: ""
};

// Decimal id, undefined name
const wrongCourseInfo3 = {
    id: 7.26,
    name: undefined
};

// Wrong keys
const wrongCourseInfo4 = {
    identification: 45,
    course_name: "This is a course name"
};

// Extra keys
const wrongCourseInfo5 = {
    id: 30,
    name: "Too many keys!",
    professor: "Professor Louie",
    location: "Remote"
};

// Missing a key (name)
const wrongCourseInfo6 = {
    id: 40
};


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

// Same as AssignmentGroup, but group_weight exceeds 100 (is 125)
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

// Assignments wrong type
const wrongAGassignments = {
    id: 12345,
    name: "Fundamentals of JavaScript",
    course_id: 451,
    group_weight: 25,
    assignments: 100
}

// Assignments array has extra keys [0], one key is wrong [1], missing keys [2]
const wrongAGassignments2 = {
    id: 12345,
    name: "Fundamentals of JavaScript",
    course_id: 451,
    group_weight: 25,
    assignments: [
        {
            id: 1,
            name: "Declare a Variable",
            due_at: "2023-01-25",
            points_possible: 50,
            hasExtraCredit: true
        },
        {
            id: 2,
            name: "Write a Function",
            due_at: "2023-02-27",
            totalPoints: 150
        },
        {
            id: 3,
            name: "Code the World",
            due_at: "3156-11-15"
        }
    ]
}

// Same as wrongAGassignments2, except other keys are also invalid (id is identification)
const wrongAGassignments3 = {
    identification: 12345,
    name: "Fundamentals of JavaScript",
    course_id: 451,
    group_weight: 25,
    assignments: [
        {
            id: 1,
            name: "Declare a Variable",
            due_at: "2023-01-25",
            points_possible: 50,
            hasExtraCredit: true
        },
        {
            id: 2,
            name: "Write a Function",
            due_at: "2023-02-27",
            totalPoints: 150
        },
        {
            id: 3,
            name: "Code the World",
            due_at: "3156-11-15"
        }
    ]
}

// Assignment Group with negative id, empty name, decimal course_id, wrong type group_weight, repeated assignments (repeated id of 3)
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

// Result Tests
const result = getLearnerData(CourseInfo, AssignmentGroup, LearnerSubmissions); // Initial test
validateResults("Original Test", result, expectedResult); // Tests passed!
validateResults("Different Expected Results (Different Value for a Key)", differentResult, expectedResult); // Tests passed!
validateResults("Different Keys in Expected Result (What if objects in the result from getLearnerData have the wrong keys?)", differentKeysResult, expectedResult); // Tests passed!
// validateResults("More Results Should be Expected", lessResult, expectedResult); // Tests passed!
// validateResults("Less Results Should be Expected", moreResult, expectedResult); // Tests passed!
// validateResults("Wrong Value Types for Keys", wrongTypeResult, expectedResult); // Tests passed!

// // Course Info Tests
// const emptyCourseInfoResult = getLearnerData({}, AssignmentGroup, LearnerSubmissions);
// validateResults("Empty Course Info Result", emptyCourseInfoResult, expectedResult); // Tests passed!

// const wrongCourseInfoResults = getLearnerData(wrongCourseInfo, AssignmentGroup, LearnerSubmissions);
// validateResults("String Id and Array Name for Course Info", wrongCourseInfo, expectedResult); // Tests passed! (Arrays are objects so the console log is fine)

// const wrongCourseInfo2Results = getLearnerData(wrongCourseInfo2, AssignmentGroup, LearnerSubmissions);
// validateResults("Negative Id and Empty Name for Course Info", wrongCourseInfo2Results, expectedResult); // Tests passed!

// const wrongCourseInfo3Results = getLearnerData(wrongCourseInfo3, AssignmentGroup, LearnerSubmissions);
// validateResults("Decimal Id and Undefined Name for Course Info", wrongCourseInfo3Results, expectedResult); // Tests passed!

// const wrongCourseInfo4Results = getLearnerData(wrongCourseInfo4, AssignmentGroup, LearnerSubmissions);
// validateResults("Wrong Key Names for Course Info", wrongCourseInfo4Results, expectedResult); // Tests passed!

// const wrongCourseInfo5Results = getLearnerData(wrongCourseInfo5, AssignmentGroup, LearnerSubmissions);
// validateResults("Too Many Keys for Course Info", wrongCourseInfo5Results, expectedResult); // Tests passed!

// const wrongCourseInfo6Results = getLearnerData(wrongCourseInfo6, AssignmentGroup, LearnerSubmissions);
// validateResults("Missing Name Key for Course Info", wrongCourseInfo6Results, expectedResult); // Tests passed!


// // Assignment Group Tests
// const emptyAssignmentGroupResult = getLearnerData(CourseInfo, {}, LearnerSubmissions);
// validateResults("Empty Assignment Group Result", emptyAssignmentGroupResult, expectedResult); // Tests passed!

// // Test case for negative id, empty name, decimal course_id, wrong type group_weight, repeated assignments (repeated id of 3)
// const erroneousAGResult = getLearnerData(CourseInfo, erroneousAG, LearnerSubmissions);
// validateResults("Erroneous Assignment Group", erroneousAGResult, expectedResult); // Tests passed!

// const wrongCourseIdAgResults = getLearnerData(CourseInfo, wrongCourseIdAG, LearnerSubmissions);
// validateResults("Assignment Group with Wrong Course Id", wrongCourseIdAgResults, expectedResult); // Tests passed!

// const highPercentAGResults = getLearnerData(CourseInfo, highPercentAG, LearnerSubmissions);
// validateResults("Assignment Group with Group Weight > 100", highPercentAGResults, expectedResult); // Tests passed!

// const wrongAGassignmentsResult = getLearnerData(CourseInfo, wrongAGassignments, LearnerSubmissions);
// validateResults("Assignment Group's Assignments With Wrong Type", wrongAGassignmentsResult, expectedResult); // Tests passed! An array is an object so the error message is fine.

// const wrongAGassignments2Result = getLearnerData(CourseInfo, wrongAGassignments2, LearnerSubmissions);
// validateResults("Assignment Group's Assignments With Extra Key, Incorrect Key, and Missing Key", wrongAGassignments2Result, expectedResult); // Tests passed!

// const wrongAGassignments3Result = getLearnerData(CourseInfo, wrongAGassignments3, LearnerSubmissions);
// validateResults("Assignment Group's Id Key Wrong Name and Assignments Key Errors", wrongAGassignments3Result, expectedResult); // Tests passed! Expected behavior is to stop validation at validateKeys if there is a mismatch in the main object. That's why the key errors in assignments do not show up.


// // Submissions Tests
// const emptyLearnerSubmissionsResult = getLearnerData(CourseInfo, AssignmentGroup, []);
// validateResults("Empty Learner Submissions Result", emptyLearnerSubmissionsResult, expectedResult); // Tests passed!

// // Test to ensure getLearnerData works for an array that isn't sorted by learner_id or assignment_id
// const unorderedResult = getLearnerData(CourseInfo, AssignmentGroup, unorderedLearnerSubmissions);
// validateResults("Unordered Submissions", unorderedResult, expectedResult); // Tests passed because results are unequal! Order does matter because the first learner added is id 132. This is because a learner object is not created for learner id 125 for an assignment not due yet. This is to avoid creating a learner object for someone that only turned in an assignment that is not due yet.

// const duplicateLSResult = getLearnerData(CourseInfo, AssignmentGroup, duplicateLearnerSubmissions);
// validateResults("Duplicated Entry of Pair (learner_id, assignment_id)", duplicateLSResult, expectedResult);

// const wrongLearnerSubsResult = getLearnerData(CourseInfo, AssignmentGroup, wrongLearnerSubs);
// validateResults("LearnerSubs With Errors (Check comments by Sub's Declaration)", wrongLearnerSubsResult, expectedResult);

// const wrongLearnerSubsResult2 = getLearnerData(CourseInfo, AssignmentGroup, wrongLearnerSubs2);
// validateResults("LearnerSubs2 With Errors (Check comments by Sub's Declaration", wrongLearnerSubsResult2, expectedResult);