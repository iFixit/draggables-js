= About =
Allows flexible and fast drag/drop functionality.
Specifically designed to be performant in these situations:
* Many draggables
* Many droppables
* Draggables and droppables are not fixed collections and may change at any time
* Set of allowed droppables may change depending on what's being drug.

== Compatability ==
Initially designed to use MooTools, but it can easily be adapted to use any other library or likely
to be library agnostic.

= Usage =
All properties shown here are required.

    var dragdrop = new Draggables({
       root: Element that is the common ancestor of all the draggable and droppable elements
       getDraggable: function(target){
          // target is the element on which an event happened (mousedown, move, up, ...)
          // if target or one of it's ancestors is draggable, return the element that should be
          // draggable; otherwise, return null and no drag will happen.
       },
       getDroppable: function(target, draggable){
          // This is called while dragging, draggable is the element being drug.
          // target is the element on which an event happened (mousedown, move, up, ...)
          // if target or one of it's ancestors is a drop target, return the element that should
          // act as the drop target; otherwise, return null and no drop event will happen.
       }
    );

== Events ==
Draggables fires several events that you can listen to.
All of these events have a single argument `(event)` which is the standard event
object from the associated mouse or keyboard event. The event argument also has
`draggable` and `droppable` properties which are set to the element being dragged and the element
that is the current drop target respectively (if applicable)
* **`dragStart`**    -- Fired as soon as an element is drug more than 10 pixels
* **`dragInto`**     -- Fired while dragging when the mouse enters into a drop-target
* **`dragOut`**      -- Fired while dragging when the mouse exits a drop-target
* **`dragSuccess`**  -- Fired while dragging when the mouse is released on a drop-target
* **`dragFail`**     -- Fired while dragging when the mouse is released on an non-drop-target
* **`dragFinish`**   -- Fired after dropFail and dropSuccess, always fires once for every dragStart
