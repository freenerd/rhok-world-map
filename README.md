RHOK World Map
========

# What?

See all past and future RHOKs on a world map. A demo is deployed at http://rhokmap.meteor.com/ and the code is available at http://www.github.com/freenerd/rhokmap

# How?

The RHOK website's RSS feed of events is pulled, locations are extracted from the XML, passed to the client for geocoding against the Google Geocoding API, pushed back to the server, stored in a database and served on a Google Map.

# Why?

Because it is fun to see where on the world RHOKs are happening. Also I really wanted to play around with Meteor ;)

# Stuff

This was built during RHOK Berlin June 2012. Version 0.3.6 of Meteor was used, so expect this to break in the future.

# License

Copyright (c) 2012 Johan Uhle

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
