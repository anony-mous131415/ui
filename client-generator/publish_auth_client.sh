#!/bin/bash
rm -rf /tmp/auth-client-ts
java -jar swagger-codegen-cli-2.4.4.jar generate \
  -i $1/v2/api-docs \
  -l typescript-angular \
  -o /tmp/auth-client-ts \
  --additional-properties  npmName=@revxui/auth-client-ts,npmVersion=$2,snapshot=false,ngVersion=8.1.0
sed '/http/d' /tmp/auth-client-ts/package.json > /tmp/auth-client-ts/package.json.bk;mv /tmp/auth-client-ts/package.json.bk /tmp/auth-client-ts/package.json
cd /tmp/auth-client-ts/ && npm install && npm audit fix --force && npm install && npm audit fix --force && npm install && npm install typescript@" >=3.4.0 and <3.5.0" --save-dev && npm run build && npm publish dist --access=public
