responseCount = 0
currentQuestion = 0

function getFormHtml() {
  return $('<form class="ui form"></form>');
}

function getProgressBarHtml() {
  return '<div style="position: fixed; bottom: 0; background: #eee; width: 100%; height: 6px; ">'
        + '<div id="progress" style="background: #1678c2; width: 1%;">&nbsp;</div>'
        + '</div>';
}

function getH1Html(title) {
  return '<h1 class="ui header">' + title + '</h1>';
}

function getPreCodeHtml(code) {
  return '<pre><code>' + code + '</code></pre>';
}

function getRadioCheckboxHtml(question, responses, i) {
  var input = '<div class="inline fields">';

  for (j = 0; j < question.input.options.length; j++) {
    var option = question.input.options[j]
    var type = question.input.type

    if (!!responses[i] && responses[i].indexOf(option.label) !== -1) {
      var checked = 'checked'
    } else {
      var checked = ''
    }

    input += '<div class="field">'
      + '<div class="ui checkbox ' + type + '">'
      + '<input type="' + type + '" ' + checked + ' name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + option.label + '">'
      + '<label for="question_' + i + '_' + j + '">' + option.label + '</label>'
      + '</div>'
      + '</div>'
  }
  input += '</div>'

  return input;
}

function getInputHtml(question, responses, i) {
  var input = '<table>';

  for (j = 0; j < question.input.options.length; j++) {
    var option = question.input.options[j]
    var type = 'checkbox'

    if (!!responses[i]) {
      var value = responses[i][j]
    } else {
      var value = ''
    }

    input += '<tr>'
      + '<td><label for="question_' + i + '_' + j + '">' + option.label + '</label></td>'
      + '<td width="15px"></td>'
      + '<td><div class="ui input">'
      + '<input type="text" placeholder="Response..." name="question_' + i + '" id="question_' + i + '_' + j + '" value="' + value + '" />'
      + '</div></td>'
      + '</tr>'
      + '<tr><td colspan="3">&nbsp;</tr></tr>'
  }
  input += '</table>'

  return input;
}

function getDefaultInputHtml(responses, i) {
  if (!!responses[i]) {
    var value = responses[i]
  } else {
    var value = ''
  }
  return '<div class="ui input fluid">'
    + '<input type="text" placeholder="Response..." name="question_' + i + '" value="' + value + '" />'
    + '</div>'
}

function getQuestionHtml(i, question, responses) {
  var input = getInput(question, responses, i);
  var code = getQuestionCode(question.code);

  return $('<div id="question-' + i + '" class="ui card" style="width: 100%;">'
        + '<div class="content">'
        + '<div class="header">' + question.problem + '</div>'
        + '</div>'
        + '<div class="content">'
        + code
        + '</div>'
        + '<div class="content">'
        + input
        + '</div>'
        + '</div>'
      ).css('display', 'none')
}

function getQuestionCode(code) {
  return code !== undefined
    ? getPreCodeHtml(code)
    : '';
}

function getInput(question, responses, i) {
  if (question.input === undefined) {
    question.input = { type: 'input' }
  }

  switch (question.input.type) {
    case 'checkbox':
    case 'radio':
      return getRadioCheckboxHtml(question, responses, i);
      break

    case 'inputs':
      return getInputHtml(question, responses, i);
      break
    default:
      return getDefaultInputHtml(responses, i);
  }
}

function addProgressBarToBody() {
  $(document.body).append(getProgressBarHtml())
}

function processQuestion(question, i) {
  $questions.append(getQuestionHtml(i, question, responses));

  $('pre code').each(function (i, block) {
    hljs.highlightBlock(block)
  })

  $questions.find('#question-' + currentQuestion).css('display', 'block')
  $('#progress').css('width', (responseCount / questions.length * 100) + '%')
}

function getResponseCount(responses, questions) {
  var responseCount = 0

  for (i = 0; i < responses.length; i++) {
    question = questions[i]
    switch (question.input.type) {
      case 'checkbox':
      case 'radio':
      case 'inputs':
        if (!!responses[i] && !!responses[i].join('')) {
          responseCount++
        }
        break
      default:
        if (!!responses[i]) {
          responseCount++
        }
    }
  }

  return responseCount;
}

function printProgressBar(responses, questions) {
  var responseCount = getResponseCount(responses, questions);

  $('#progress').css('width', (responseCount / questions.length * 100) + '%')
}

function printQuestionnaire (element, data) {
  $element = $(element)
  questions = data.questions

  try {
    quizData = JSON.parse(localStorage.getItem('quiz'))
    responses = quizData.responses || []
    currentQuestion = quizData.currentQuestion || -1
    responseCount = quizData.responseCount || -1
  } catch (e) {}

  if (quizData == null) {
    quizData = { responses: [] }
    responses = quizData.responses
  }

  $questions = getFormHtml()

  addProgressBarToBody();
  
  $element
    .append(getH1Html(data.title))
    .append($questions)


  data.questions.forEach(processQuestion);

  $element.append('<button id="submit-response" class="ui primary button">Submit response</button>')

  if (responseCount === questions.length) {
    $('#submit-response').css('display', 'none')
    $element.append('<div>Thank you for your responses.<br/><br/> </div>')
    $element.append('<button class="ui primary button" onclick="window.print()">Print responses</button>')
  }

  $('#submit-response').on('click', function (){
    var $inputs = $('[name^=question_' + currentQuestion + ']')
  
    var question = questions[currentQuestion]

    console.log($inputs)

    switch (question.input.type) {
      case 'checkbox':
      case 'radio':
        responses[currentQuestion] = []
        $('[name=' + $inputs.attr('name') + ']:checked').each(function (i, input) {
          responses[currentQuestion].push(input.value)
        })
        if (responses[currentQuestion].length === 0) {
          responses[currentQuestion] = null
        }
        break
      case 'inputs':
        responses[currentQuestion] = []
        $inputs.each(function (i, input) {
          responses[currentQuestion].push(input.value)
        })
        break
      default:
        responses[currentQuestion] = $inputs.val()
    }

    printProgressBar(responses, questions);

    var isQuestionAnswered = true

    console.log('response', currentQuestion, responses[currentQuestion])
    if (!responses[currentQuestion]) {
      isQuestionAnswered = false
    }

    if (!!responses[currentQuestion] && !!responses[currentQuestion].length) {
      for (j = 0; j < responses[currentQuestion].length; j++) {
        if (!responses[currentQuestion][j]) {
          isQuestionAnswered = false
        }
      }
    }

    if (!isQuestionAnswered) {
      alert('You must give a response')
    } else {
      $questions.find('#question-' + currentQuestion).css('display', 'none')
      currentQuestion = currentQuestion + 1
      $questions.find('#question-' + currentQuestion).css('display', 'block')

      if (responseCount === questions.length) {
        $('#submit-response').css('display', 'none')
        $element.append('<div>Exam filled in successfully. Thank you.</div>')
        $element.append('<button>Print responses</button>')
      }
    }

    quizData.responses = responses
    quizData.responseCount = responseCount
    quizData.currentQuestion = currentQuestion
    localStorage.setItem('quiz', JSON.stringify(quizData))
  });
}

quiz = function (element, options) {
  $.ajax({
    url: options.url
  }).done(function(data) {
    printQuestionnaire(element, data)
  })
}



module.exports = quiz
