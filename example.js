window.addEvent('domready', function() {
   createDraggableElements(1000);

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

