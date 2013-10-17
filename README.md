Gestures
========

Another JavaScript library for handling touch gestures (experimental)

Mouse implementation
====================

Every action is abstracted to fingers, wether it is comming from
actual touch events or from mouse events. Mouse events get different
finger ids for different mouse buttons (each mouse button beeing an
individual finger). Vertical scrolling (mouse wheel) will be translated
to rotation and zoom transforming events (to be re-added).

Event trap implementation
=========================

It's quite easy for a widget, specially if in use with various widgets from
different sources, that event bubbeling can get out of hand. I.e. we often need
to watch out for mouseup/touchend events on the whole screen. But if these
events happen on an element that consumes those events, we might never get
called at all. This can lead to corrupt internal states and can render your
widget completely unusable.

To cirumvent this I came up with a "solution" for jQuery. I do hook into
the jQuery event setup (via jQuery.event.special) for certain event types.
This code should behave the same as before, but also calling another event
that then bubbles up the dom tree (this event is prefixed with "trap").

This is very experimental and could break with future jQuery versions!

Main testing devices
====================

- Samsung Galaxy P5110 (Tab 2 10.1)
- Acer Icona W700 (Windows 8 / IE 10)

To Do
=====

- Implement more events (like tap, hold)
- Needs a lot more testing (iPhone and older IE)

