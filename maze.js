var numbers = ['2','3','4','5','6','7','8','9','10','j','q','k'];
var suits = ['h', 'd', 'c', 's'];
var cards = [];
var field;
$(document).onReady(function() {
  // populating arrays
  for (var i = 0; i < suits.size(); i++) {
    for (var j = 0; j < numbers.size(); j++) {
      cards = cards.merge(suits[i] + numbers[j]);
    }
  }
  field = cards;
  (suits.size()*numbers.size()).upto(9*6-1, function(i) {
    field[i] = '';
  });
  field = field.shuffle();

  // generating for the first time
  field.each(function(card, i) {
    createElem(i);
  });
  recalcAll();
});

function createElem(i) {
  var card = field[i];
  var y = (i/9).floor();
  var x = i-(y*9);
  var pos = {top: (y*98)+'px', left: (x*73)+'px'};
  var elem;

  if (card.blank()) {
    elem = $E('div', {id: 'blank_'+i, 'data-id': i, 'class': 'empty', style: pos});
    var accepted = [];
    if (i == 0) {
      accepted = accepted.merge(suits.map(function(suit, i) { return suit+'2' }));
    } else if (!field[i-1].blank()) {
      var num = numbers.indexOf(field[i-1].slice(1)) + 1;
      num = num > numbers.size()-1 ? numbers.first() : numbers[num];
      accepted = accepted.merge(field[i-1][0] + num);
    }
    if (i < field.size() && !field[i+1].blank()) {
      var num = numbers.indexOf(field[i+1].slice(1)) - 1;
      num = num < 0 ? numbers.last() : numbers[num];
      accepted = accepted.merge(field[i+1][0] + num);
    }
    accepted.each(function(elem, j) {
      if ($(elem)) {
        $(elem).addClass('drop_'+i);
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
        var tmp = field[card_id];
        field[card_id] = field[empty_id];
        field[empty_id] = tmp;
        draggable.revert = function(){};
        draggable.destroy().element.remove();
        droppable.destroy().element.remove();
        "div.card".removeClass('drop_'+empty_id);
        createElem(card_id);
        createElem(empty_id);
        recalcAll();
      }
    });
  }

  $('field').append(elem);
}

function recalcAll() {
  field.each(function(elem, i) {
    if (elem.blank()) {
      $('blank_'+i).remove();
      createElem(i);
    }
  });
}
