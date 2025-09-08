# SBA 308
## General Description
This repository contains a javascript file with several functions that help validate data before parsing it and returning an array of learner objects with key-value pairs of id: learner_id, avg: total_score/total_points_possible, and assignment id: score/points_possible. The number of key-value pairs with assignment id: score/points_possible depends on the number of unique submissions a learner has in the LearnerSubmissions array. The function getLearnerData will return an array with the learner objects only after the course, ag, and submissions arguments have been validated. Otherwise, no array is returned. The validation methods strictly ensure that each course object, ag object, and submissions array contains all necessary keys and that all respective values are the expected type. Otherwise, errors are logged in the console and the validation failed.

## Object Expected Behavior
This is a description of all objects and expected key-value behaviors. The object names of course, assignment group, and submissions are named after the provided data.

<table>
<tr>
<td>Object Name</td> <td>Structure</td> <td>Description</td>
</tr>
<tr>
<td>Course Info</td>
<td>

```javascript
{
  id: 451,
  name: "Introduction to JavaScript",
};
```

</td>
<td>An example of a valid Course Info Object. See comments for expected behavior. More info in the expected behavior section.</td>
</tr>
<tr>
<td>Assignment Group</td>
<td>

```javascript
{
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
        }
    ]
};
```

</td>
<td>An example of a valid Assignment Group Object. Each element of the array will be referred to as an Assignment Object. More info in the expected behavior section.</td>
</tr>
<tr>
<td>Learner Submissions</td>
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
];
```

</td>
<td>An example of a valid entry within the Generated Results Array. Each element of the array will be referred to as a Learner's Submission Object. The object nested in the Learner's Submission Object will be referred to as the Submission Details Object. For the key score, an inclusive upper bound of points_possible from assignment was considered, but extra credit exists. More info in the expected behavior section.</td>
</tr>
<tr>
<td>Generated Results</td>
<td>

```javascript
[
    {
        id: 125,
        avg: 0.985,
        1: 0.94,
        2: 1.0
    },
];
```

</td>
<td>An example of a valid entry within the Generated Results Array. This is the output of the `getLearnerData` function. Each element of the array will be referred to as a result object. More info in the expected behavior section.</td>
</tr>
</table>

## Expected Behavior of Key Value Pairs
| Key | Value Example | Value's Behavior | Usage of Key-Value Pair |
| ----- | ----- | ----- | ----- |
| `id` | `1` | Any integer larger than 0. Otherwise, it is invalid. | Course Info, Assignment Group, Assignment Object, and Generated Results's Learner Object elements |
| `name` | `"Course"` | Any non-empty string. Otherwise, it is invalid. | Course Info and Assignment Group |
| `course_id` | `1` | Any integer larger than 0 that matches the `id` value of the course. Otherwise, it is invalid. | Assignment Group |
| `group_weight` | `25` | Any integer larger than 0, but less than or equal to 100 because the weight is a percentage. Otherwise, it is invalid. | Assignment Group |
| `assignments` | `[{assignment object}]` | A non-empty array of unique assignment objects with keys `id`, `name`, `due_at`, `points_possible`. If the `id` already exists or other constraints are not met, the assignment is invalid. | Assignment Group |
| `due_at` | `2025-09-01` | A non-empty string in the format of YYYY-MM-DD. Invalid when the format is wrong. If the year (YYYY) does not have 4 characters and the month (MM) and day (DD) do not have 2 characters, date is invalid. If month isn't between 01 and 12 inclusively and the day isn't part of that month, it is also invalid. | Assignment Object |
| `points_possible` | `1` | Any number larger than 0. It cannot be 0 because this will be used to calculate the learner's average later on. If these constraints aren't met, it is invalid. | Assignment Object |
| `learner_id` | `1` | Any integer larger than 0. Otherwise, it is invalid. | Learner's Submission Object |
| `assignment_id` | `1` | Any integer larger than 0. Otherwise, it is invalid. | Learner's Submission Object |
| `submission` | `{submission details object}` | A non-empty object of with keys `id`, `name`, `due_at`, `points_possible`. If the `id` already exists or other constraints are not met, the assignment is invalid. | Submission Details Object |
| `submitted_at` | `2025-05-2025` | A non-empty string in the format of YYYY-MM-DD. Invalid when the format is wrong. If the year (YYYY) does not have 4 characters and the month (MM) and day (DD) do not have 2 characters, date is invalid. If month isn't between 01 and 12 inclusively and the day isn't part of that month, it is also invalid. | Submission Details Object |
| `score` | `150` | Any integer greater than or equal to 0 `id`, `name`, `due_at`, `points_possible`. If the `id` already exists or other constraints are not met, the assignment is invalid. | Submission Details Object |

## Description of Functions
| Function With Parameters | Arguments | Description | Expected Output |
| ----- | ---- | ------- | ----- |
| `getLearnerData(course, ag, submissions)` | Must contain a course
