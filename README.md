Gestures
========

For my [slider] [1] I needed a robust and versatile gesture library which
was not really available at that time (2011). I'm trying to keep this
library updated and tested with each new device I can get my hands on.

There is a [small demo page] [2] that I use to test various
edge cases and the correct event bubbling and cancelation.


[1]: https://github.com/mgreter/slider
[2]: http://slider.rtp.ocbnet.ch/gestures/examples

Concept
=======

The library generates multiple custom jquery events, which are split
into two layers. The first abstraction is the "fingers" layer. We
have currently three input plugins which will generate finger events
for down, move and up/cancel events. These are the three currently
(AFAIK) available JavaScript APIs supported by the major browsers,
namely mouse, touch and pointer events. This abstraction is pretty
similar to how the new [w3c pointer event API] [3] works.

On top of these events we generate "hand" events, which are just a
group of fingers. Each hand gets a few additional properties like
`center`, `rotation`, `distance` or `swipeSector`. You can also
retrieve the list of fingers in order when they were put down.

[3]: http://www.w3.org/TR/pointerevents

Events
======

### `handstart`

The name may be a bit counter intuitive, as it is called for every
`fingerdown` event. Consumers can decide if the event should stop
bubbling up any further by calling `stopPropagation` and/or ignore the
current finger by calling `preventDefault` on the passed event object.

### `handstop`

This event is called for every finger that is removed from the hand, but
by default we stop the full hand when one finger is lifted. So you will
not recieve any further move updates for this hand. To prevent this need
to call `preventDefault` on the passed event object. You cannot abort
or stop this event, since the finger was actually physically lifted!

### `handmove`

You get this event for any finger move of the hand. As mentioned above,
you can access various additional information on the hand gesture object.
With `handmove` it's guaranteed that the hand has some center coordinates.
Just use a debugger to see what is available to the invoked functions.

### `handtransform`

Is called whenever `handmove` is called, but only if the gesture has
two or more fingers. This event guarantees that you can access the
`rotation` and `distance` properties and get a valid number.

### `handswipe`

Swipes are movements in a certain direction. Often you only need swipes
in horizontal direction and want to leave vertical swipes for the browser
to do the scrolling. We need to wait for a certain threshold of movement
until we can decide if a swipe gesture should be handled by the browser or by
the consumer. This event helps to abstract that logic and different browser
behaviors. Specially older devices show a variety of slightly different
implementations and it's difficult to get the event handling and cancelation
correct, without breaking native scrolling. This can be influenced by
changing the config options `decideOnFirst` or `swipeMinDistance`.

Touch and Pointer implementation
================================

Older devices and browsers only support the [JS touch API] [4] while newer browser
start to support [w3c pointer events] [5] ([currently supported] [6] by IE11/Edge and
partially by IE10 and experimentally in upcoming Firefox 44).

[4]: http://www.w3.org/TR/touch-events/
[5]: http://www.w3.org/TR/pointerevents
[6]: http://caniuse.com/#feat=pointer

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
Therefore this is only included in the experimental release build!

My test devices
===============

- HTC Legend (Android 2.2)
- Samsung Galaxy S3 (Android 4.3)
- Samsung Galaxy P5110 (Tab 2 10.1)
- Acer Icona W700 (Windows 8 / IE 10)
- MS Surface 2 (Windows RT 8.1 / IE 11)
- Lenovo Yoga 2 1051F (Windows 10 / IE Edge)

Tested in pretty much all available browsers.
No guarantee each version is equally tested ;)

Compile sources
===============

We use [webmerge](https://github.com/mgreter/webmerge) to create the release
files. Once it is installed, you simply need to execute the compiler scripts.

To Do
=====

- Implement more events (like tap, hold)
- Needs a lot more testing (iPhone and older IE)


License
=======

Copyright (c) Marcel Greter 2015 - OCBNET Gestures
- This plugin is available for use in all personal or
commercial projects under both MIT and GPL licenses.
