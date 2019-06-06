# metre

[![Build Status](https://travis-ci.org/ivansglazunov/metre.svg?branch=master)](https://travis-ci.org/ivansglazunov/metre)

## install:

- https://git-scm.com/
- https://www.meteor.com
- https://bit.dev
- https://nodejs.org

## usage:

```
git clone git@github.com:ivansglazunov/metre.git metre
cd metre
meteor npm i
meteor run
```

## electron:

```
# terminal one
meteor --mobile-server=127.0.0.1:3000
# terminal two
npm run desktop -- init
npm run desktop -- build-installer
```

## users

### Meteor.users

Meteor users collection reviewed in concept. Now this collection just store authorization info. Each user (document) can be used just as one auth method.

### subjects (in progress)

In Metre, for authorization used subjects concept. As subject can be used any node in nodes collection. Any node can contain field `users: { type: 'user', value: any }[]`. This node automatically puts into nesting tree as root.

> May be nodes used as subjects can be denied for pull from nesting trees.
