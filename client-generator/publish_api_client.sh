#!/bin/bash
rm -rf /tmp/api-client-ts
java -jar swagger-codegen-cli-2.4.4.jar generate \
  -i $1/v2/api-docs \
  -l typescript-angular \
  -o /tmp/api-client-ts \
  -c options.json \
  --additional-properties  npmName=@revxui/api-client-ts,npmVersion=$2,snapshot=false,ngVersion=8.1.0
sed '/http/d' /tmp/api-client-ts/package.json > /tmp/api-client-ts/package.json.bk;mv /tmp/api-client-ts/package.json.bk /tmp/api-client-ts/package.json
cd /tmp/api-client-ts/ && npm install && npm audit fix --force && npm install && npm audit fix --force && npm install && npm install typescript@" >=3.4.0 and <3.5.0" --save-dev && npm run build
