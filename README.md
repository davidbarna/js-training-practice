# JS Training: practice project

## How to launch dev mode?


**Launch the project on dev mode**

 ```
$ npm run start-dev
```

**Open the project in in Chrome**

URL: http://localhost:8080/webpack-dev-server/  

Now you can start coding.

**Once you're done, create a pull request**

Assign [davidbarna](https://github.com/davidbarna)


## Refactor steps

### Objects

Create a constructor named `UserQuiz` that will manage the state of the quiz.

`UserQuiz` has the following properties:
* **responses:** array with responses given by user
* **currentQuestion:** index of current question
* **responseCount:** number of responses

`UserQuiz` has the following methods:

* **init():** fills its properties from local storage
* **save():** saves info to local storage like `saveQuizData`
* **addResponse(questionIndex, response):** adds response given by user
* **isResponseCorrect(questionIndex, response):** returns if response if correct, like `isResponseCorrect`

```js

var quiz = function (element, options) {
  var userQuiz
  getQuizConfig()
    .then(function (data) {
      userQuiz = new UserQuiz().init()
      buildQuiz(data.title, data.questions, $(element))
    });
/* ... */
}

```

Make `userQuiz` manage the state of the quiz.
Unused code should be removed.

### Object-Oriented Programming

Create the following classes and implement them in the program:
* **UserQuiz:** responsible for the state of the quiz
* **Question:** handles question info and related operations
* **QuizNav:** shows/hides questions in the view
* **QuizApi:** makes requests to the JSON API


### Object-Oriented Design and Patterns

Fill in the structure of files to implement OOD principles

```
| DOM
| QuizApi
| QuizCtrl
├── QuizView
│   ├── ProgressView
│   ├── QuestionView
│       ├── FieldViewFactory
│       ├── FieldViewAbstract
├── UserQuiz
│   ├── Question
```
