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
    let currentID = -1;
    let startingIndex = 0;

    if (validateAssignments(ag, course.id) && validateCourse(course) && validateSubmissions(submissions)) {

    }

    if (submissions) {
        for (let i = 0; i < submissions.length; i++) {
            const learnerSub = submissions[i];
            // console.log(learnerSub);
            let learnerObjIndex = findLearnerObj(results, learnerSub.learner_id);
            const aId = findAssignment(ag.assignments, learnerSub.assignment_id);
            if (learnerObjIndex === -1) { // If learnerObj does not exist, immediately initalize the first user
                if (currentID >= 0 && results) {
                    // console.log("Calc avg", currentID);
                    calculateAvg(results[findLearnerObj(results, currentID)], ag.assignments, submissions.slice(startingIndex, i));
                }
                startingIndex = i;
                currentID = learnerSub.learner_id;
                const learnerObj = {};
                learnerObj.id = learnerSub.learner_id;
                results.push(learnerObj);
                learnerObjIndex = findLearnerObj(results, learnerSub.learner_id);
            }
            // Only add assignments that have close due dates.
            if (checkAssignment(ag.assignments[aId])) {
                const learnerObj = results[learnerObjIndex];
                if (aId >= 0) {
                    const score = isLate(ag.assignments[aId], learnerSub.submission.submitted_at) ? (learnerSub.submission.score - (ag.assignments[aId].points_possible * 0.1)) : learnerSub.submission.score;
                    const grade = score / ag.assignments[aId].points_possible;
                    learnerObj[Number(learnerSub.assignment_id)] = grade;
                }
            }
        };
    }

    calculateAvg(results[findLearnerObj(results, currentID)], ag.assignments, submissions.slice(startingIndex));

    return results;
}

function calculateAvg(learnerObj, assignments, learnerSubmissions) {
    if (typeof learnerObj == "object") {
        const keys = Object.keys(learnerObj);
        let totalGrade = 0;
        let totalPointsPossible = 0;
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (key !== "id") {
                // Avg calc
                const assignmentIndex = findAssignment(assignments, Number(key));
                totalPointsPossible += assignments[assignmentIndex].points_possible;
                const isAssignmentLate = isLate(assignments[assignmentIndex], learnerSubmissions[i].submission.submitted_at);
                // console.log(isAssignmentLate, assignments[assignmentIndex], learnerSubmissions[i].submission.submitted_at);
                // 
                totalGrade += (isAssignmentLate) ? (learnerSubmissions[i].submission.score - assignments[assignmentIndex].points_possible * 0.1) : learnerSubmissions[i].submission.score;
            }
        };
        // console.log(totalGrade, totalPointsPossible);
        learnerObj.avg = totalGrade / totalPointsPossible;
    }
}

// Check if assignment is late
function isLate(assignment, submissionDate) {
    return (submissionDate > assignment.due_at);
}

// Check if assignment is due yet
function checkAssignment(assignment) {
    return (todaysDate > assignment.due_at);
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

function errorMsgUndefined(category, variableName){
    return `The ${category}'s ${variableName} must be defined!`;
}

function errorMsgWrongType(category, variableName, type){
    return `The ${category}'s ${variableName} cannot be the type ${type}! Must be a number.`
}

function errorMsgNegativeValue(category, variableName, variable){
    return `The ${category}'s ${variableName} is ${variable} and cannot be less than 1!`;
}

function errorMsgFloatValue(category, variableName, variable){
    return `The ${category}'s ${variableName} is ${variable} and must be a whole number!`;
}

function errorMsgUnequalIds(category1, variableName, category2){
    return `The ${category1}'s ${variableName} is not equal to the ${variableName} of ${category2}!`;
}

function errorMsgUnequalArrays(arr1Name, arr2Name){
    
}

// Validate that arr1 is equal to arr2.
function equalArrays(arr1, arr2){
    if (!arr1 || !arr2){
        return false;
    } else if ((arr1.length != arr2.length)){
        return false;
    } else{
        for(let i = 0; i < arr1.length; i++){
            if (arr1[i] != arr2[i]) return false;
        }
    }
    return true;
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
    const assignmentGroupKeys = ["id", "name", "course_id", "group_weight", "assignments"]
    if (typeof assignmentGroup == 'object') {
        // Validate that the keys are properly named and that none of them are missing.
        try {
            if (!equalArrays(Object.keys(assignmentGroup), assignmentGroupKeys)){
                throw (``);
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
            } else if (assignmentGroup.id < 1){
                throw (errorMsgNegativeValue(category, "id", assignmentGroup.id));
            } else if (assignmentGroup.id % 1){
                throw (errorMsgFloatValue(category, "id", assignmentGroup.id));
            }
        } catch (error) {
            console.log(error);
        }

        // Validate assignment group's name
        try {
            if (!assignmentGroup.name){
                throw (errorMsgUndefined(category, "name"));
            } else if (typeof assignmentGroup.name != "string") {
                throw (errorMsgWrongType(category, "id", typeof assignmentGroup.name));
            }
        } catch (error) {
            console.log(error);
        }

        // Validate assignment group's course id
        try {
            if (!assignmentGroup.course_id) {
                throw (errorMsgUndefined(category, "id"));
            } else if (typeof assignmentGroup.course_id != "number") {
                throw (errorMsgWrongType(category, "id", typeof assignmentGroup.course_id));
            } else if (assignmentGroup.course_id < 1){
                throw (errorMsgNegativeValue(category, "id", assignmentGroup.course_id));
            } else if (assignmentGroup.course_id % 1){
                throw (errorMsgFloatValue(category, "id", assignmentGroup.course_id));
            } else if (assignmentGroup.course_id != courseId){
                throw (errorMsgUnequalIds(category, "course id", "the course"))
            }
        } catch (error) {
            console.log(error);
        }

        // Validate assignment group's group_weight
        try {
            if (!assignmentGroup.group_weight) {
                throw (errorMsgUndefined(category, "id"));
            } else if (typeof assignmentGroup.group_weight != "number") {
                throw (errorMsgWrongType(category, "id", typeof assignmentGroup.group_weight));
            } else if (assignmentGroup.group_weight < 1){
                throw (errorMsgNegativeValue(category, "id", assignmentGroup.group_weight));
            } else if (assignmentGroup.group_weight % 1){
                throw (errorMsgFloatValue(category, "id", assignmentGroup.group_weight));
            }
        } catch (error) {
            console.log(error);
        }

        for(const assignment in assignmentGroup){
            try {
                if (!validateAssignment(assignment)) {
                    throw "Assignment is invalid!";
                }
            } catch (error) {
                console.log(error);
            }

        };
    }
    return true;
}

// Check individual assignments
function validateAssignment(assignment) {
    return true;
}

// Check individual submissions
function validateSubmissions(submissions) {
    return true;
}

const result = getLearnerData(CourseInfo, AssignmentGroup, LearnerSubmissions);

console.log(result);
