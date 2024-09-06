#!/usr/bin/env node
await import(`./dist/${process.argv[2]}.js`);
