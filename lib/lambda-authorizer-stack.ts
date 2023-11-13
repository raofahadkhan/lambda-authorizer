import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2-alpha";
import * as apigwv2_integrations from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
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

    const lambdaAuthorizor = new lambda.Function(this, `${service}-${stage}-lambda`, {
      functionName: `${service}-${stage}-lambda`,
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "lambdaAuthroizer.handler",
      environment: {
        TABLE_NAME: userTable.tableName,
      },
    });

    const createUserLambda = new lambda.Function(this, `${service}-${stage}-create-users-lambda`, {
      functionName: `${service}-${stage}-create-users-lambda`,
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "CreateUsers.handler",
      environment: {
        TABLE_NAME: userTable.tableName,
      },
    });

    const getUsersLambda = new lambda.Function(this, `${service}-${stage}-get-users-lambda`, {
      functionName: `${service}-${stage}-get-users-lambda`,
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "GetUsers.handler",
      environment: {
        TABLE_NAME: userTable.tableName,
      },
    });
  }
}
