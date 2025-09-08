# SBA 308
## General Description
This repository contains a javascript file with several functions that help validate data before parsing it and returning an array of learner objects with key-value pairs of id: learner_id, avg: total_score/total_points_possible, and assignment id: score/points_possible. The number of key-value pairs with assignment id: score/points_possible depends on the number of unique submissions a learner has in the LearnerSubmissions array. The function getLearnerData will return an array with the learner objects only after the course, ag, and submissions arguments have been validated. Otherwise, no array is returned. The validation methods strictly ensure that each course object, ag object, and submissions array contains all necessary keys and that all respective values are the expected type. Otherwise, errors are logged in the console and the validation failed.

## Object Expected Behavior
This is a description of all objects and expected key-value behaviors. The object names of course, assignment group, and submissions are named after the provided data.

<table>
<tr>
<td>Object Name</td> <td>Type</td> <td>Structure</td> <td>Description</td>
</tr>
<tr>
<td>Course Info</td> <td>Object</td>
<td>

```javascript
{
  id: 451,
  name: "Introduction to JavaScript",
};
```

</td>
<td>The id attribute must be an integer greater than 1. The name attribute must be a non-empty string.</td>
</tr>
<tr>
<td>Assignment Group</td> <td>Object</td>
<td>

```javascript
{
    id: 12345,
    name: "Fundamentals of JavaScript",
    course_id: 451,
    group_weight: 25,
    assignments: [] // Non-empty array of assignment objects
};
```

</td>
<td>The id attribute must be an integer greater than 1. The name attribute must be a non-empty string.</td>
</tr>
<tr>
<td>Assignments</td> <td>Object</td>
<td>

```javascript
[
    {
        id: 1,
        name: "Declare a Variable",
        due_at: "2023-01-25",
        points_possible: 50
    }
]
```

</td>
<td>The id attribute must be an integer greater than 1. The name attribute must be a non-empty string.</td>
</tr>
<tr>
<td>Learner Submissions</td> <td>Array</td>
<td>

```javascript
[
    {
        learner_id: 125,
        assignment_id: 1,
        submission: {
            submitted_at: "2023-01-25",
            score: 47
        }
    }
]
```

</td>
<td>The id attribute must be an integer greater than 1. The name attribute must be a non-empty string.</td>
</tr>
</table>

## Description of Functions
| Function With Parameters | Arguments | Description | Expected Output |
| ---- | --- | ------ | ---- |
| `getLearnerData(course, ag, submissions)` | Must contain a course