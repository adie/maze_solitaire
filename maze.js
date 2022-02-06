const EMPTY_PLACE_STRING = ''
const NUMBERS = ['1','2','3','4','5','6','7','8','9','10','j','q','k']
const SUITS = ['h', 'd', 'c', 's']
const div_id = 'field'

class MazeGame {
  constructor(rules) {
    this.rules = rules
    this.field = []
    for (let i = 0; i < SUITS.length; i++) {
      for (let j = 0; j < NUMBERS.length; j++) {
        this.field = this.field.concat(SUITS[i] + NUMBERS[j])
      }
    }
    this.field.sort(() => Math.random() - 0.5)
    this.field = rules.prepareField(this.field)
  }
  start() {
    for (let i = 0; i < this.field.length; i++) {
      this.createElem(i)
    }
    this.rebuildBlanks()
  }
  refresh() {
    const div = document.getElementById(div_id)
    while (div.firstChild) { div.removeChild(div.lastChild) }
    this.start()
  }
  rebuildBlanks() {
    for (let i = 0; i < this.field.length; i++) {
      if (!this.field[i]) {
        if (document.getElementById('blank_'+i)) {
          document.getElementById('blank_'+i).remove()
        }
        this.createElem(i)
      }
    }
  }
  createElem(i) {
    i = parseInt(i)
    const card = this.field[i]
    const y = Math.floor(i/9)
    const x = i-(y*9)
    const pos = {top: (y*98)+'px', left: (x*73)+'px'}

    const elem = document.createElement('div')
    elem.style.top = pos.top
    elem.style.left = pos.left

    if (card == '') {
      elem.setAttribute('id', 'blank_'+i)
      elem.setAttribute('data-idx', i)
      elem.classList.add('empty')

      const accepted = this.rules.acceptedBy(this.field, i)

      elem.addEventListener('drop', (ev) => {
        ev.preventDefault()
        const card_id = ev.dataTransfer.getData('text/plain')

        const idx1 = this.field.indexOf(card_id)
        const idx2 = parseInt(ev.target.dataset.idx)

        let tmp = this.field[idx1]
        this.field[idx1] = this.field[idx2]
        this.field[idx2] = tmp

        this.refresh()
      })
      elem.addEventListener('dragenter', (ev) => {
        if (accepted.includes(this.dragging)) {
          ev.preventDefault()
          ev.currentTarget.style.background = 'lightblue'
        }
      })
      elem.addEventListener('dragover', (ev) => {
        if (accepted.includes(this.dragging)) {
          ev.preventDefault()
        }
      })
      elem.addEventListener('dragleave', (ev) => {
        ev.currentTarget.style.background = ''
      })
    } else {
      elem.setAttribute('id', card)
      elem.setAttribute('data-id', i)
      elem.classList.add('card')
      elem.style.backgroundImage = `url("cards_png/${card}.png")`

      elem.setAttribute('draggable', true)
      elem.addEventListener('dragstart', (ev) => {
        this.dragging = card
        ev.dataTransfer.setData('text/plain', ev.target.id)
      })
      elem.addEventListener('dragend', (ev) => {
        this.dragging = null
        ev.dataTransfer.clearData()
      })
    }

    document.getElementById(div_id).append(elem)
  }
}

class WikipediaRules {
  prepareField(field) {
    field.splice(8, 0, EMPTY_PLACE_STRING)
    field.splice(17, 0, EMPTY_PLACE_STRING)
    field = field.map((name, i) => {
      return name.endsWith('k') ? EMPTY_PLACE_STRING : name
    })
    return field
  }
  acceptedBy(field, i) {
    let accepted = []

    const prev = i === 0 ? field.slice(-1) : field[i - 1]
    if (prev !== EMPTY_PLACE_STRING) {
      const num = NUMBERS.indexOf(prev[1]) + 1
      if (num == 12) {
        // We're on queen, any Ace can be put.
        accepted = accepted.concat(SUITS.map(function(suit, i) { return suit + '1' }))
      } else {
        accepted = accepted.concat(prev[0] + NUMBERS[num])
      }
    }
    // Check to the right
    const next = i + 1 === field.length ? field[0] : field[i + 1]
    if (next !== EMPTY_PLACE_STRING) {
      const num = NUMBERS.indexOf(next[1]) - 1
      if (num >= 0) {
        accepted = accepted.concat(next[0] + NUMBERS[num])
      }
    }
    return accepted
  }
}

const game = new MazeGame(new WikipediaRules())
game.start()
