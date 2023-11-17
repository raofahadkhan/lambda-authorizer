#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { LambdaAuthorizerStack } from "../lib/lambda-authorizer-stack";

const service = "lambda-authorizer";
let stage;
const app = new cdk.App();

stage = "m";
new LambdaAuthorizerStack(app, `${service}-${stage}`, {
  tags: {
    service,
    stage,
  },
});

stage = "d";
new LambdaAuthorizerStack(app, `${service}-${stage}`, {
  tags: {
    service,
    stage,
  },
});
