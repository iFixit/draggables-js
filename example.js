window.addEvent('domready', function() {
   createDraggableElements(1000);
   setupDraggables();

   // the Magic
   function setupDraggables() {
      var drags = new Draggables({
         root: $('draggables'),
         getDraggable: function(target) {
            // Put your own logic here
            if (target.get('tag') == 'span') return target;
         },
         getDroppable: function(target, draggable) {
            // Put your own logic here
            if (target.get('tag') == 'span') return target;
         }
      });

      drags.addEvent('dragSuccess', function(event) {
         event.droppable.appendText(event.draggable.get('text'));
         event.draggable.dispose();
      });
   }

   function createDraggableElements(count) {
      var shapes = {
         square   : '■',
         triangle : '◆',
         circle   : '●'
      },
      shapeNames = ['square', 'triangle', 'circle'];

      var container = $('draggables');
      for(var i=1; i<count; i++) {
         container.grab(createShape(randomShape()));
         container.appendText(' ');
      }

      function randomShape() {
         return shapeNames[Math.floor(Math.random() * 3)];
      }

      function createShape(shape) {
         var classes = [shape];

         var element = new Element('span', {
            'class': classes.join(' '),
            'text': shapes[shape]
         });
         return element;
      }
   }
});

