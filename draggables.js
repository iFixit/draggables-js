/**
 * Creates a generic Dragging and Dropping interface
 *
 * Each instance of this represents a set of draggable elements and a set of
 * compatable places to drop them
 * example:
 * var dragdrop = new Draggables({
 *    root: Element that is the common ancestor of all the draggable and droppable elements
 *    getDraggable: function(target){
 *       // target is the element on which an event happened (mousedown, move, up, ...)
 *       // if target or one of it's ancestors is draggable, return the draggable element
 *       // otherwise, return null and no drag will happen
 *    },
 *    getDroppable: function(target, draggable){
 *       // This is called while dragging, draggable is the element being drug.
 *       // target is the element on which an event happened (mousedown, move, up, ...)
 *       // if target or one of it's ancestors is a drop target, return the drop target
 *       // element otherwise, return null and no drag will happen.
 *    }
 * );
 *
 * == Draggables fires several events ==
 * All of these events have a single argument (event) which has the standard Mootools event
 * properties of the associated mouse event. The event argument also has
 * 'draggable' and 'droppable' which are set to the element being dragged and the element
 * that is the current drop target respectively (if applicable)
 *
 * dragStart -- Fired as soon as an element is drug more than 10 pixels
 * dragInto -- Fired while dragging when the mouse enters into a drop-target
 * dragOut -- Fired while dragging when the mouse exits a drop-target
 * dragSuccess -- Fired while dragging when the mouse is released on a drop-target
 * dragFail -- Fired while dragging when the mouse is released on an non-drop-target
 * dragFinish -- Fired after dropFail and dropSuccess, always fires once for every dragStart
 *
 */
var Draggables = new Class({
   Implements: Events,

   initialize: function (config){
      var self = this,
      root = config.root,
      getDraggable = config.getDraggable,
      getDroppable = config.getDroppable,
      mouseMoveHandler,
      mouseOverHandler,
      mouseOutHandler,
      dragging,
      mouseDown,
      mouseDownEvent,
      mouseOver,
      draggableHeight,
      draggableSpacingAboveCursor = 10,
      snap = 10,
      highlightClass = 'dragOver';
      
      root
      .addEvent('mousedown', function(event){
         if(event.rightClick) return;

         setDroppableDraggable(event);

         mouseDown = event.draggable;
         if(mouseDown){
            mouseDownEvent = event;
            event.preventDefault();
            attachEvents(true);
            draggableHeight = mouseDown.getHeight();
         }
      });


      // Listen for the mouseup and key events on the document so we can catch and deal with
      // dropping and key presses outside the container
      $(document).addEvent('mouseup', function(event){
         if (event.rightClick)
            return;

         if (mouseOver)
            toggleHighlight(mouseOver, false);

         setDroppableDraggable(event);
         var dropper = event.droppable;

         stopDragging(dragging && dropper && mouseDown != dropper, event);
      })

      .addEvent('keyup', function(event){
         if(dragging && event.key == 'esc')
            stopDragging();
      });


      mouseMoveHandler = function(event){
         setDroppableDraggable(event);

         if (!dragging && mouseDown && distance(mouseDownEvent.page, event.page) > snap){
            dragging = true;
            event.draggable = mouseDown;
            self.fireEvent('dragStart', [event]);
            root.setStyle('cursor', 'move');
         }

         if(dragging){
            mouseDown.setStyle('position', 'relative');
            mouseDown.setPosition({
               x:event.page.x - mouseDownEvent.page.x,
               y:event.page.y - mouseDownEvent.page.y -
                  (draggableHeight + draggableSpacingAboveCursor)});
            event.stopPropagation();
            event.preventDefault();
         }
      };

      mouseOverHandler = function(event){
         if(!dragging)
            return;

         setDroppableDraggable(event);

         var dropper = event.droppable;
         if (dropper && mouseDown != dropper){
            mouseOver = dropper;
            toggleHighlight(dropper, true);

            event.draggable = mouseDown;
            self.fireEvent('dragInto', [event])
         }
      };
      
      mouseOutHandler = function(event){
         if(!dragging)
            return;

         setDroppableDraggable(event);

         var dropper = event.droppable;
         if (dropper && mouseDown != dropper){
            if (mouseOver)
               toggleHighlight(mouseOver, false);
            toggleHighlight(dropper, false);
            mouseOver = dropper;

            event.draggable = mouseDown;
            self.fireEvent('dragOut', [event])
         }
      };

      function stopDragging(success, event){
         if (dragging){
            event = event || {};
            event.draggable = mouseDown;

            if (mouseOver)
               toggleHighlight(mouseOver, false);

            if (success)
               self.fireEvent('dragSuccess', [event]);
            else
               self.fireEvent('dragFail', [event]);

            self.fireEvent('dragFinish', [event]);
            mouseDown.setPosition({x:0,y:0});
            root.setStyle('cursor', '');
         }
         reset();
      }

      /**
       * Sets event.draggable and event.droppable to the results from getDraggable and getDroppable
       * if appropriate (given the dragging state);
       */
      function setDroppableDraggable(event){
         event.draggable = !dragging && getDraggable(event.target);
         event.droppable = dragging && getDroppable(event.target, mouseDown);
      }

      function toggleHighlight(element, on){
         element[(on ? 'add' : 'remove') + 'Class'](highlightClass);
      }

      // Not the real distance formula, just a fast approximation that doesn't use multiply 
      function distance(p1, p2){
         var deltax = Math.abs(p1.x - p2.x),
         deltay = Math.abs(p1.y - p2.y);
         return (p1 && p2) ? Math.max(deltax, deltay) : null;
      }

      function reset(){
         mouseOver = dragging = mouseDown = null;
         attachEvents(false);
      }
      this.cancel = stopDragging;

      var lastAttach = false;
      function attachEvents(attach){
         if(lastAttach == !!attach) return;
         lastAttach = !!attach;
         root[(attach ? 'add' : 'remove') + 'Events']({
            'mousemove': mouseMoveHandler,
            'mouseover': mouseOverHandler,
            'mouseout' : mouseOutHandler,
         });
      }
   }   
});

