var MazeGame = new Class({
  extend: {
    EMPTY_PLACE_STRING: '',
    NUMBERS: ['1','2','3','4','5','6','7','8','9','10','j','q','k'],
    SUITS: ['h', 'd', 'c', 's']
  },
  div_id: 'field',
  field: [],
  initialize: function(rules) {
    $ext(this, rules);
    this.field = [];
    for (var i = 0; i < MazeGame.SUITS.size(); i++) {
      for (var j = 0; j < MazeGame.NUMBERS.size(); j++) {
        this.field = this.field.merge(MazeGame.SUITS[i] + MazeGame.NUMBERS[j]);
      }
    }
    this.field = this.field.shuffle();
    this.prepareField();
  },
  start: function() {
    for (var i = 0; i < this.field.size(); i++) {
      this.createElem(i);
    }
    this.recalcAll();
  },
  refresh: function() {
    $(this.div_id).clean();
    this.start();
  },
  recalcAll: function() {
    for (var i = 0; i < this.field.size(); i++) {
      if (this.field[i].blank()) {
        $('blank_'+i).remove();
        this.createElem(i);
      }
    }
  },
  createElem: function(i) {
    i = parseInt(i);
    var card = this.field[i];
    var y = (i/9).floor();
    var x = i-(y*9);
    var pos = {top: (y*98)+'px', left: (x*73)+'px'};
    var elem;

    if (card.blank()) {
      elem = $E('div', {id: 'blank_'+i, 'data-id': i, 'class': 'empty', style: pos});
      var accepted = this.acceptedBy(i);
      accepted.each(function(accept_card, j) {
        if ($(accept_card)) {
          $(accept_card).addClass('drop_'+i);
        }
      });

      elem.makeDroppable({accept: '.drop_'+i});
    } else {
      elem = $E('div', {id: card, 'data-id': i, 'class': 'card', style: Object.merge(pos, {
        'background-image': 'url("cards_png/'+card+'.png")'})
      });
      elem.makeDraggable({
        revert: true,
        revertDuration: 'short',
        onDrop: function(droppable, draggable, event) {
          var card_id = draggable.element.get('data-id');
          var empty_id = droppable.element.get('data-id');
          var tmp = this.field[card_id];
          this.field[card_id] = this.field[empty_id];
          this.field[empty_id] = tmp;

          draggable.clone.remove();
          draggable.options.revert = false;

          draggable.element.remove();
          droppable.element.remove();
          "div.card".removeClass('drop_'+empty_id);
          this.createElem(card_id);
          this.createElem(empty_id);
          this.recalcAll();
        }.bind(this)
      });
    }

    $(this.div_id).append(elem);
  },
  // Rules-specific functions
  prepareField: function() {},
  acceptedBy: function(i) { return [] }
});

var WikipediaRules = new Class({
  prepareField: function() {
    this.field.splice(8, 0, MazeGame.EMPTY_PLACE_STRING);
    this.field.splice(17, 0, MazeGame.EMPTY_PLACE_STRING);
    this.field = this.field.walk(function(name, i) {
      return name.endsWith('k') ? MazeGame.EMPTY_PLACE_STRING : name;
    });
  },
  acceptedBy: function(i) {
    var accepted = [];
    if ((i == 0 && !this.field.last().blank()) || (i > 0 && !this.field[i-1].blank())) {
      var cell;
      if (i == 0) {
        cell = this.field.last();
      } else {
        cell = this.field[i-1];
      }
      var num = MazeGame.NUMBERS.indexOf(cell.slice(1)) + 1;
      if (num == 12) {
        accepted = accepted.merge(MazeGame.SUITS.map(function(suit, i) { return suit + '1' }));
      } else {
        accepted = accepted.merge(cell[0] + MazeGame.NUMBERS[num]);
      }
    }
    if ((i+1 < this.field.size() && !this.field[i+1].blank()) || (i+1 == this.field.size() && !this.field.last().blank())) {
      var cell;
      if (i+1 == this.field.size()) {
        cell = this.field.first();
      } else {
        cell = this.field[i+1];
      }
      var num = MazeGame.NUMBERS.indexOf(cell.slice(1)) - 1;
      if (num >=0) {
        accepted = accepted.merge(cell[0] + MazeGame.NUMBERS[num]);
      }
    }
    return accepted;
  }
});

var game = new MazeGame(new WikipediaRules());
$(document).onReady(function() {
  game.start();
});
