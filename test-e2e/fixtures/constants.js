const data = require('../../src/data/quiz.json')
const BUTTON_SELECTOR = '.primary.button'
const RESET_SELECTOR = '.negative.button'
const PROGRESS_SELECTOR = '#progress'
const RESPONSE_MSG = 'You must give a response'
const questionSelector = num => `.card:nth-child(${num})`

export {
  data,
  BUTTON_SELECTOR,
  RESET_SELECTOR,
  PROGRESS_SELECTOR,
  RESPONSE_MSG,
  questionSelector
}
