# NOTICE

It looks like this project was originally being built and deployed via Travis to GitHub Pages, then at some point this changed in a hurry to using `gulp build && gulp deploy` to manually deploy it to the IG server. But the travis stuff never got cleaned up. TODO: remove travis stuff from this repo

The live site is here:

https://ig.ft.com/sites/new-year-honours-2016/

---

# [New Year Honours List, 2015](https://ft-interactive.github.com/new-year-honours-2016/) [![Build Status][travis-image]][travis-url]
new-year-honours-2016
## Usage

To begin, clone this repo and running `npm install`.

You'll then need a `.env` file in the root of the project with a `SPREADSHEET_KEY` variable.

From then on run the app in development mode:

```sh
> npm start
```

## Deploy

Commits to the master branch will built on CI. Successful builds will be published to live. Write tests to prevent bad code being made live.

## Uses Starter Kit

This project began life with the [starter-kit](https://github.com/ft-interactive/starter-kit).

## Licence
This software is published by the Financial Times under the [MIT licence](http://opensource.org/licenses/MIT).

Please note the MIT licence includes only the software, and none of the content of this site, which is Copyright (c) Financial Times Ltd. For more information about re-publishing FT content, please contact our [syndication department](http://syndication.ft.com/).

[travis-url]: https://travis-ci.org/ft-interactive/new-year-honours-2016
[travis-image]: https://travis-ci.org/ft-interactive/new-year-honours-2016.svg
