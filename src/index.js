var quiz = function (element, options) {
  function getJson (url) {
    return new Promise(function (resolve, reject) {
      $.ajax({ url: url }).done(resolve)
    })
  }

  function getQuizConfig () {
    return getJson(options.url)
  }

  function getQuizResponse (i) {
    return getJson(options.responsesUrl.replace(':index', i))
      .then(response => response.response)
  }

  function getStoredQuizData () {
    storedData = localStorage.getItem('quiz')
    return (storedData) ? JSON.parse(storedData) : {}
  }

  function getQuizData () {
    var quizData = getStoredQuizData()

    quizData.responses = quizData.responses || []
    quizData.currentQuestion = quizData.currentQuestion || 0
    quizData.responseCount = quizData.responseCount || 0

    return quizData
  }

  function createQuestionsForm () {
    return $('<form class="ui form"></form>')
  }

  function createProgressElement () {
    return $('<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
      + '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
      + '</div>')
  }

  function createTitleElement (title) {
    return $('<h1 class="ui header">' + title + '</h1>')
  }

  function isOptionInResponse (option, response) {
    return !!response && response.indexOf(option.label) !== -1 ? true : false
  }

  function getMultipleChoiceField (type, name, idx, label, checked) {
    checked ? 'checked' : ''

    return '<div class="field">'
    + '<div class="ui checkbox ' + type + '">'
    + '<input type="' + type + '" ' + checked + ' name="' + name + '" id="' + name + '_' + idx + '" value="' + label + '">'
    + '<label for="' + name + '_' + idx + '">' + label + '</label>'
    + '</div>'
    + '</div>'
  }

  function getMultipleInputsField (name, idx, label, value) {
    return '<tr>'
    + '<td><label for="' + name + '_' + idx + '">' + label + '</label></td>'
    + '<td width="15px"></td>'
    + '<td><div class="ui input">'
    + '<input type="text" placeholder="Response..." name="' + name + '" id="' + name + '_' + idx + '" value="' + value + '" />'
    + '</div></td>'
    + '</tr>'
    + '<tr><td colspan="3">&nbsp;</tr></tr>'
  }

  function getInputField (name, value) {
    return '<div class="ui input fluid">'
    + '<input type="text" placeholder="Response..." name="' + name + '" value="' + value + '" />'
    + '</div>'
  }

  function getFieldMarkup (question, response, i) {
    switch (question.input.type) {
      case 'checkbox':
      case 'radio':
        var input = '<div class="inline fields">'
        question.input.options.forEach(function (option, j) {
          var type = question.input.type
          var checked = isOptionInResponse(option, response)
          input += getMultipleChoiceField(
            type, getFieldName(i), j, option.label, checked
          )
        })
        input += '</div>'
        break
      case 'inputs':
        var input = '<table>'
        question.input.options.forEach(function (option, j) {
          var value = !!response ? response[j] : ''
          input += getMultipleInputsField(getFieldName(i), j, option.label, value)
        })
        input += '</table>'
        break
      default:
        var value = response ? response : ''
        var input = getInputField(getFieldName(i), value)
    }

    return input
  }

  function getQuestionMarkup (question, response, i) {

    var code = question.code ? '<pre><code>' + question.code + '</code></pre>' : question.code

    question.input = question.input || { type: 'input' }

    return '<div id="' + getFieldId(i) + '" class="ui card" style="width: 100%;">'
    + '<div class="content">'
    + '<div class="header">' + question.problem + '</div>'
    + '</div>'
    + '<div class="content">'
    + (code || '')
    + '</div>'
    + '<div class="content">'
    + getFieldMarkup(question, response, i)
    + '</div>'
    + '</div>'
  }

  function createQuestionsElements (questions, responses) {
    return questions.map((question, i) => {
      return $(getQuestionMarkup(question, responses[i], i)).css('display', 'none')
    })
  }

  function getFieldName (idx) {
    return 'question_' + idx
  }

  function getFieldId (idx) {
    return 'question-' + idx
  }

  function createSubmitButton ($questions, questions) {
    return $('<button id="submit-response" class="ui primary button">Submit response</button>')
      .on('click', function () {
        processResponse($questions, questions)
      })
  }

  function createResetButton () {
    return $('<button class="ui button negative">Reset</button>')
      .on('click', function () {
        localStorage.removeItem('quiz')
        location.reload()
      })
  }

  function getQuestionResponse (question, i) {
    var $inputs = $('[name^=' + getFieldName(i) + ']')
    switch (question.input.type) {
      case 'checkbox':
      case 'radio':
        return $inputs.filter('[name=' + $inputs.attr('name') + ']:checked')
          .toArray().map(input => input.value)
        break
      case 'inputs':
        return $inputs.toArray().map(input => input.value)
        break
      default:
        return $inputs.val()
    }
  }

  function isEmptyResponse (response) {
    return !response || (response.join && !response.join('')) ?  true : false
  }

  function getResponseCount (responses) {
    return responses.reduce(function (result, response) {
      return isEmptyResponse(response) ?  result : result + 1
    }, 0)
  }

  function showQuestion (idx, show) {
    var display = show ? 'block' : 'none'
    $('#' + getFieldId(idx)).css('display', display)
  }

  function showCurrentQuestion (current) {
    showQuestion(current - 1, false)
    showQuestion(current, true)
  }

  function showTextEndMessage () {
    $('#submit-response').css('display', 'none')
    $(element)
      .append('<div>Thank you for your responses.<br /><br /> </div>')
      .append('<button class="ui primary button" onclick="window.print()" >Print responses</button>')
  }

  function updateProgressBar (questions, responses) {
    $('#progress').css('width', (responses / questions * 100) + '%')
  }

  function processResponse ($questions, questions) {

    var {currentQuestion, responses} = getQuizData()
    var response = getQuestionResponse(questions[currentQuestion], currentQuestion)

    responses[currentQuestion] = response

    if (isEmptyResponse(responses[currentQuestion])) {
      alert('You must give a response')
    } else {
      var responseCount = getResponseCount(responses)

      getQuizResponse(currentQuestion)
        .then(function (correctResponse) {
          isResponseCorrect(response, correctResponse) ? alert('Response is correct!') : alert('Response is not correct! It was: ' + serializeResponse(correctResponse))


          updateQuizStatus(questions, responseCount)
          saveQuizData({
            responses: responses,
            responseCount: responseCount,
            currentQuestion: currentQuestion + 1
          })
        })
    }
  }

  function isResponseCorrect (userResponse, correctResponse) {
    return serializeResponse(userResponse) == serializeResponse(correctResponse)
  }

  function serializeResponse (response) {

    return response.join ? response.sort().join(', ') : response

  }

  function updateQuizStatus (questions, responseCount) {
    showCurrentQuestion(responseCount)
    updateProgressBar(questions.length, responseCount)

    questions.length === responseCount && showTextEndMessage()

  }

  function saveQuizData (changes) {
    var quizData = Object.assign(getQuizData(), changes)
    localStorage.setItem('quiz', JSON.stringify(quizData))
  }

  function buildQuiz (title, questions, $element) {
    var quizData = getQuizData()
    var [responses, responseCount, $questions ] = [quizData.responses, quizData.responseCount, createQuestionsForm()]

    $(document.body)
      .append(createProgressElement())

    $element
      .append(createTitleElement(title))
      .append($questions)
      .append(createSubmitButton($questions, questions))
      .append(createResetButton())

    $questions
      .append(createQuestionsElements(questions, responses))
      .find('pre code').each((i, block) => {
      hljs.highlightBlock(block)})

    updateQuizStatus(questions, responseCount)
  }

  getQuizConfig()
    .then(function (data) {
      buildQuiz(data.title, data.questions, $(element))
    })
}

module.exports = quiz
