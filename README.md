Gestures
========

JavaScript library for handling touch gestures (experimental)

Mouse implementation
====================

Every action is abstracted to fingers, wether it is comming from
actual touch events or from mouse events. Mouse events get different
finger ids for different mouse buttons (each mouse button beeing an
individual finger). Vertical scrolling (mouse wheel) will be translated
to rotation and zoom transforming events.

To Do
=====

- Implement more events (like tap, hold)
- Needs a lot more testing (IE10 with touches)

