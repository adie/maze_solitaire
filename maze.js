var MazeGame = new Class({
  extend: {
    EMPTY_PLACE_STRING: '',
    NUMBERS: ['1','2','3','4','5','6','7','8','9','10','j','q'],
    SUITS: ['h', 'd', 'c', 's']
  },
  div_id: 'field',
  field: [],
  initialize: function() {
    var cards = [];
    MazeGame.SUITS.each(function(suit, i) {
      MazeGame.NUMBERS.merge(['k']).each(function(number, j) {
        cards = cards.merge(suit + number);
      });
    });
    this.field = cards.shuffle();
    this.field.splice(8, 0, MazeGame.EMPTY_PLACE_STRING);
    this.field.splice(17, 0, MazeGame.EMPTY_PLACE_STRING);
    this.field = this.field.walk(function(name, i) {
      return name.endsWith('k') ? MazeGame.EMPTY_PLACE_STRING : name;
    });
  },
  start: function() {
    for (var i = 0; i < this.field.size(); i++) {
      this.createElem(i);
    }
    this.recalcAll();
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
    var card = this.field[i];
    var y = (i/9).floor();
    var x = i-(y*9);
    var pos = {top: (y*98)+'px', left: (x*73)+'px'};
    var elem;

    if (card.blank()) {
      elem = $E('div', {id: 'blank_'+i, 'data-id': i, 'class': 'empty', style: pos});
      var accepted = [];
      if (i == 0) {
        accepted = accepted.merge(MazeGame.SUITS.map(function(suit, i) { return suit+'2' }));
      } else if (!this.field[i-1].blank()) {
        var num = MazeGame.NUMBERS.indexOf(this.field[i-1].slice(1)) + 1;
        num = num > MazeGame.NUMBERS.size()-1 ? MazeGame.NUMBERS.first() : MazeGame.NUMBERS[num];
        accepted = accepted.merge(this.field[i-1][0] + num);
      }
      if ((i+1 < this.field.size()) && !this.field[i+1].blank()) {
        var num = MazeGame.NUMBERS.indexOf(this.field[i+1].slice(1)) - 1;
        num = num < 0 ? MazeGame.NUMBERS.last() : MazeGame.NUMBERS[num];
        accepted = accepted.merge(this.field[i+1][0] + num);
      }
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
          //FIXME
          var tmp = this.field[card_id];
          this.field[card_id] = this.field[empty_id];
          this.field[empty_id] = tmp;

          draggable.clone.remove();
          draggable.options.revert = false;

          draggable.element.remove();
          droppable.element.remove();
          "div.card".removeClass('drop_'+empty_id);
          //FIXME
          this.createElem(card_id);
          this.createElem(empty_id);
          this.recalcAll();
        }.bind(this)
      });
    }

    $(this.div_id).append(elem);
  }
});

var game = new MazeGame();
$(document).onReady(function() {
  game.start();
});
