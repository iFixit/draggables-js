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
 *       // If target or one of it's ancestors is draggable, return the element that should be
 *       // draggable; otherwise, return null and no drag will happen.
 *    },
 *    getDroppable: function(target, draggable){
 *       // This is called while dragging, draggable is the element being drug.
 *       // target is the element on which an event happened (mousedown, move, up, ...)
 *       // if target or one of it's ancestors is a drop target, return the element that should
 *       // act as the drop target; otherwise, return null and no drop event will happen.
 *    }
 * );
 *
 * ## Events ##
 * Draggables fires several events that you can listen to.
 * All of these events have a single argument `(event)` which is the standard event
 * object from the associated mouse or keyboard event. The event argument also has
 * `draggable` and `droppable` properties which are set to the element being dragged and the element
 * that is the current drop target respectively (if applicable)
 *
 * dragStart -- Fired as soon as an element is drug more than 10 pixels
 * dragInto -- Fired while dragging when the mouse enters into a drop-target
 * dragOut -- Fired while dragging when the mouse exits a drop-target
 * dragSuccess -- Fired while dragging when the mouse is released on a drop-target
 * dragFail -- Fired while dragging when the mouse is released on an non-drop-target
 * dragFinish -- Fired after dropFail and dropSuccess, always fires once for every dragStart
 *
 * ## CSS Classes ##
 * To make drag and drop styling of UI elements easier, the class `dragOver` is added to the
 * element returned from `getDroppable` while the mouse is over it during a drag event.  You can use
 * this to highlight that an area is a valid drop-target.
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
      disableClick,
      snap = 10,
      highlightClass = 'dragOver';
      
      root.addEvent('mousedown', function(event){
         if(event.rightClick) return;

         setDroppableDraggable(event);

         mouseDown = event.draggable;
         if(mouseDown){
            mouseDownEvent = event;
            event.preventDefault();
            attachEvents(true);
         }
      });


      // Listen for the mouseup and key events on the document so we can catch and deal with
      // dropping and key presses outside the container
      var doc = $(document);
      doc.addEvent('mouseup', function(event){
         if (event.rightClick)
            return;

         if (mouseOver)
            toggleHighlight(mouseOver, false);

         event.droppable = elementUnderMousePosition(event.client);
         var dropper = event.droppable;

         stopDragging(dragging && dropper && mouseDown != dropper, event);
         event.stop();
      });

      // Temporarily disable click event after dragging
      doc.addEvent('click', function(event){
         if (disableClick)
            event.stop();
      });

      doc.addEvent('keyup', function(event){
         if(dragging && event.key == 'esc')
            stopDragging();
      });

      /**
       * Check for and fire our own mouseover / mouseout events because we
       * constantly move the dragged element under the mouse and those events
       * don't fire when the mouse doesn't techincally 'leave' the element.
       */
      var lastMouseOverElement;
      function mouseOverCheck(event) {
         if (!mouseDown || !dragging)
            return;

         var mouseOverElement = event.droppable;

         if (mouseOverElement != lastMouseOverElement) {
            if (lastMouseOverElement) {
               event.droppable = lastMouseOverElement;
               mouseOutHandler(event);
            }
            if (mouseOverElement) {
               event.droppable = mouseOverElement;
               mouseOverHandler(event);
            }
            lastMouseOverElement = mouseOverElement;
         }
      }

      /**
       * We move the element out of the way, check what's underneath
       * at the same mouse location and then move it back and simulate our
       * own mouseout / mouseover events
       * See Here: http://www.quirksmode.org/dom/w3c_cssom.html#t20
       */
      function elementUnderMousePosition(position) {
         if (!mouseDown)
            return null;

         var originalTop = mouseDown.getStyle('top');
         mouseDown.setStyle("top", -10000);
         var mouseOverElement = document.elementFromPoint(position.x,position.y);
         mouseDown.setStyle('top', originalTop);
         if (!mouseOverElement)
            return null;
         if (mouseOverElement.nodeType == 3) { // Opera has weirdness
            mouseOverElement = mouseOverElement.parentNode;
         }
         mouseOverElement = getDroppable(mouseOverElement, mouseDown);
         return mouseOverElement;
      }

      mouseMoveHandler = function(event){
         setDroppableDraggable(event);

         if (!dragging && mouseDown && distance(mouseDownEvent.page, event.page) > snap){
            dragging = true;
            event.draggable = mouseDown;
            mouseDown.addClass('dragging');
            self.fireEvent('dragStart', [event]);
            root.setStyle('cursor', 'move');
         }

         if(dragging){
            mouseDown.setStyle('position', 'relative');
            mouseDown.setPosition({
               x:event.page.x - mouseDownEvent.page.x,
               y:event.page.y - mouseDownEvent.page.y
            });
            // fire our own mouseover / mouseout events because we constantly
            // move the dragged element under the mouse.
            mouseOverCheck(event);
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
            self.fireEvent('dragInto', [event]);
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
            self.fireEvent('dragOut', [event]);
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
            mouseDown.setStyle('position', '');
            mouseDown.setPosition({x:0,y:0});
            mouseDown.removeClass('dragging');
            root.setStyle('cursor', '');
            if(event && event.stop)
               event.stop();
            // Temporarily disable all click events... as the event.stop() on
            // a mouseup event doesn't stop the following click event.
            disableClick = true;
            setTimeout(function() {
               disableClick = false;
            }, 500);
         }
         reset();
      }

      /**
       * Sets event.draggable and event.droppable to the results from getDraggable and getDroppable
       * if appropriate (given the dragging state);
       */
      function setDroppableDraggable(event){
         event.draggable = !dragging && getDraggable(event.target);
         // we use === false here so we don't repeat this check after we
         // haven't found a match
         if (dragging && event.droppable !== false) {
            var mouseOverElement = elementUnderMousePosition(event.client);
            if (mouseOverElement)
               event.droppable = getDroppable(mouseOverElement, mouseDown) || false;
         }
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
            'mouseout' : mouseOutHandler
         });
      }
   }   
});
