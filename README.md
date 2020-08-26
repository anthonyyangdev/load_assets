# load_assets
A command that generates a JavaScript file which contains an object that maps to loaded assets from a directory, including static images files, using require(...). 
This was built to support writing many imports/require statements for bundlers that load static assets/resources like webpack.

## Install
```bash
npm install -g @ayang4114/load_assets
```

## Usage

On the command line, execute the following command
```bash
load_assets <directory_of_assets>
```

## Flags

Any arguments passed without a flag is treated as an argument for the `--input` flag, i.e. it treated as the input directory.

|Flag|Description|Default
|-------------|---|---|
|--input     | The path to the directory to be converted into an asset file. | None
|--output    | The output path name of the converted asset file | assets.js or assets.ts
|--targetLang| The target language of the output asset file: either 'ts' or 'js' | 'js'
|--indents   | The number of indents in output file. | 2
|--excludeExt| A space-separated sequence of all filetype extensions to ignore. | None
|--includeExt| A space-separated sequence of all filetype extensions to include. | None

## Supported Type Extensions

By default: all files with the extensions jpg, jpeg, png, and gif are included when traversing through the assets array. These files can be ignored instead by adding the unwanted extensions as arguments for `--excludeExt`.

## Example
Consider the following tree:
```txt
assets
├── moon.png
├── sun.png
├── nested_assets_1
│   ├── moon.jpg
│   └── sun.jpg
└── nested_assets_2
    ├── moon.jpg
    ├── nested_assets
    │   ├── moon.jpg
    │   └── sun.jpg
    └── sun.jpg
```

Then, `load_assets assets` will produce the following output in `assets.js`:

```javascript
module.asset = {
  jpg: {
    "nested_assets_1": {
      "moon": require("./assets/nested_assets_1/moon.jpg"),
      "sun": require("./assets/nested_assets_1/sun.jpg"),
    },
    "nested_assets_2": {
      "moon": require("./assets/nested_assets_2/moon.jpg"),
      "nested_assets": {
        "moon": require("./assets/nested_assets_2/nested_assets/moon.jpg"),
        "sun": require("./assets/nested_assets_2/nested_assets/sun.jpg"),
      },
      "sun": require("./assets/nested_assets_2/sun.jpg"),
    },
  },
  png: {
    "moon": require("./assets/moon.png"),
    "sun": require("./assets/sun.png"),
  }
};
```

## Contributing

Feel free to add issues or suggestions [in the repository](https://github.com/ayang4114/load_assets/issues/new).

You can also make PRs:
1) Fork the repository.
2) Create a feature branch in the forked repository.
3) Push changes to the feature branch.
4) Submit a PR request.

## License

[ISC License](LICENSE.md)