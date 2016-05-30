# pixi-bin

Binary files and examples for gameofbombs [fork of pixi.js](https://github.com/gameofbombs/pixi.js), available online [here](http://gameofbombs.github.io/pixi-bin/).

## Running

You can view the examples online [here][ghio]. If you want to run it locally you can clone the repository
or download the zip file. Then just run a server pointing to the root of this repo.

For example using the node [http-server][httpserver] module:

```bash
git clone git@github.com:gameofbombs/pixi-bin.git
cd pixi-bin/

npm i && npm start
```

## Contributing

After starting local server, you can put your own versions of pixi.js and plugins into 'dev' folder. To test them, specify 'development (local)' in the dropbox or add '&v=dev' to search query.

Ideally you will need to have [node][node] setup on your machine.

Then you can add a new example, modify the section's `_details.json`, and rebuild the manifest file:

```js
node generateManifest.js
```
Your local copy of the website should then be updated automatically.

[node]: http://nodejs.org/
[ghio]: http://pixijs.github.io/examples
[httpserver]: https://www.npmjs.com/package/http-server
