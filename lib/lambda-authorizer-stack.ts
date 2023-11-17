import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2-alpha";
import * as apigwv2_integrations from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as authorizers from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";

import * as lambda from "aws-cdk-lib/aws-lambda";

export class LambdaAuthorizerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { service, stage } = props?.tags!;

    const userTable = new dynamodb.Table(this, `${service}-${stage}-user-table`, {
      tableName: `${service}-${stage}-user-table`,
      partitionKey: {
        name: "user_id",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const httpApi = new apigwv2.HttpApi(this, `${service}-${stage}`, {
      apiName: `${service}-${stage}`,
      description: "This api is responsible for crud operation of user table of dynamodb",
      corsPreflight: {
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: [apigwv2.CorsHttpMethod.POST],
        allowCredentials: false,
        allowOrigins: ["*"],
      },
    });

    const layer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      `${service}-${stage}-layer`,
      `arn:aws:lambda:us-east-1:015783570782:layer:lambda-layers-${stage}-layer:1`
    );

    const lambdaAuthorizor = new lambda.Function(this, `${service}-${stage}-lambda`, {
      functionName: `${service}-${stage}-lambda`,
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "lambdaAuthroizer.handler",
      environment: {
        TABLE_NAME: userTable.tableName,
      },
      layers: [layer],
      timeout: cdk.Duration.seconds(30),
    });

    const getUsersLambdaAuthorizor = new authorizers.HttpLambdaAuthorizer(
      `${service}-${stage}-get-users-lambda-authorizor`,
      lambdaAuthorizor,
      { responseTypes: [authorizers.HttpLambdaResponseType.SIMPLE] }
    );

    const createUserLambda = new lambda.Function(this, `${service}-${stage}-create-users-lambda`, {
      functionName: `${service}-${stage}-create-users-lambda`,
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "CreateUsers.handler",
      environment: {
        TABLE_NAME: userTable.tableName,
      },
      layers: [layer],
      timeout: cdk.Duration.seconds(30),
    });

    const getUsersLambda = new lambda.Function(this, `${service}-${stage}-get-users-lambda`, {
      functionName: `${service}-${stage}-get-users-lambda`,
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "GetUsers.handler",
      environment: {
        TABLE_NAME: userTable.tableName,
      },
      layers: [layer],
    });

    const createUserLambdaIntegration = new apigwv2_integrations.HttpLambdaIntegration(
      `${service}-${stage}-create-user-lambda-integration`,
      createUserLambda
    );

    const getUsersLambdaIntegration = new apigwv2_integrations.HttpLambdaIntegration(
      `${service}-${stage}-get-users-lambda-integration`,
      getUsersLambda
    );

    httpApi.addRoutes({
      path: "/create-user",
      methods: [apigwv2.HttpMethod.POST],
      integration: createUserLambdaIntegration,
    });

    httpApi.addRoutes({
      path: "/get-users",
      methods: [apigwv2.HttpMethod.POST],
      integration: getUsersLambdaIntegration,
      authorizer: getUsersLambdaAuthorizor,
    });

    userTable.grantFullAccess(createUserLambda);
    userTable.grantFullAccess(getUsersLambda);
    userTable.grantFullAccess(lambdaAuthorizor);
  }
}
