window.addEvent('domready', function() {
   createDraggableElements(1000);
   setupDraggables();

   function setupDraggables() {
      var drags = new Draggables({
         root: $('numbers'),
         getDraggable: function(target) {
            if (target.get('tag') == 'span') return target;
         },
         getDroppable: function(target, draggable) {
            if (target != draggable && target.get('tag') == 'span') return target;
         }
      });
   }

   function createDraggableElements(count) {
      var numbers = $('numbers');
      for(var i=1; i<count; i++) {
         numbers.grab(numberBox(i));
         numbers.appendText(' ');
      }

      function numberBox(n) {
         var classes = [];
         classes.push(n % 2 == 0 ? 'even' : 'odd');
         if (n % 10 == 0) classes.push('ten');

         return new Element('span', {
            'class': classes.join(' '),
            'text': n
         });
      }
   }
});

