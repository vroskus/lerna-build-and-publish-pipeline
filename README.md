# @vroskus/lerna-build-and-publish-pipeline

Tool for building and publishing lerna project to docker registry. Implements lerna publish function with subsequent docker image build and publish for changed project packages.

## Installation

Call:

`npm install -D @vroskus/lerna-build-and-publish-pipeline`

`yarn add -D @vroskus/lerna-build-and-publish-pipeline`

## Usage

1. Just run ```lerna-build-and-publish-pipeline``` with args:

Docker registry configuration args (required):
```--registry=<docker registry uri> --username=<docker registry username> --password=<docker registry password>```

To run pipeline in docker agent add arg (optional):
```--agent=<true | false>```

To set version update level (optional):
```--version=<major | minor | patch>```
Hint: Last commit message is checked for "[major]" | "[minor]" | "[patch]" keywords and if found - sets version level accodringly.

To force build and publish all packages with updated versions add arg (optional):
```--all=<true | false>```
Hint: Last commit message is checked for "[all]" keyword and if found - sets this option to true.

To force re-build and publish all packages without updating the versions add arg (optional):
```--rebuild=<true | false>```
