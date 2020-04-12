# defiads-webapp

## Abstract

HTML+CSS+JS client for the [defiant ads network](https://github.com/defiads/defiads).

This client allows easy access to defiads which can serve as either:
* Ad network,
* Censorship- and tracking- resistant web which is hosted at the client's internal hard drive,
* News and opinions resource with a built-in protection against spam and fake news, or
* Decentralized storage for small texts (e.g. with encryption).

## Installation

Try out the demo version at http://95.217.158.9/.

Ready for the real thing?

* Install defiads (please refer to https://github.com/defiads/defiads for instructions).
* Launch defiads with `--defiads-peers 95.217.158.9:21866`

Now you can either:
* Download the client at http://95.217.158.9/ in Download section.
* Download it directly from the network.
* Clone this repo and run `yarn install && yarn build-open` (you'll need `yarn`).
* Get your API key in defiads config directory (default `~/.defiads/testnet/defiads.cfg`).

## Current limitations

* At this moment the iframe containing the ad has the most restrictive sandbox possible.
This means it can't run any scripts or make requests to same-site. In the future scripts are likely to be enabled.
Those worried about tracking can use the browser's offline mode.
* Does not work in Tor Browser because of its restrictive local resource access policy.

## Features

* Completely self-sufficient and does not request any outside resources except defiads API on the local machine.
* Suitable for browser's offline mode. Turn it on in Firefox to go 100% tracking-free and continue to browse even when
on a plane.
* If your browser (e.g Brave) does not permit access to local storage, modify the config in the target html at line 7.
* Keeps track of all Bitcoin transaction IDs. Double click on TxId menu item to clear.
* Press Ctrl-F when viewing ad to enter full screen mode. Does not work in all browsers.
* A very simple sign-verify system which is likely to be replaced by an internal defiads solution.
* Automatic update notifier. Note that it does not use network requests of any kind since it checks for updates inside
defiads network, so it works same way in offline mode.

## Contributing

The code is in progress of total refactoring (this was my first encounter with TypeScript and writing a meaningful app
for the browser). One strict requirement is zero external dependencies.
Pull requests are very welcome as well as requests for new features.
