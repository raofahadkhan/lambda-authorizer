// import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
const AWS = require("aws-sdk");
// const dynamodb = new AWS.DynamoDB.DocumentClient();

// export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
export const handler = async (event: any): Promise<any> => {
  const token = event.headers.Authorization;

  const response = {
    isAuthroized: false,
  };

  if (token === "secret_token") {
    response.isAuthroized === true;
    console.log("user is authorized");
  }

  return response;
  //   const requestBody = JSON.parse(event.body!);

  //   let { user_id } = requestBody;

  //   console.log("user_id", user_id);
  //   if (!user_id) {
  //     return {
  //       statusCode: 400,
  //       body: JSON.stringify({ message: "Bad Request! user_id is required" }),
  //     };
  //   }

  //   const params = {
  //     TableName: process.env.TABLE_NAME!,
  //     KeyConditionExpression: "#pk = :pk",
  //     ExpressionAttributeNames: {
  //       "#pk": "user_id",
  //     },
  //     ExpressionAttributeValues: {
  //       ":pk": user_id,
  //     },
  //   };

  //   try {
  //     const items = await dynamodb.query(params).promise();

  //     return {
  //       statusCode: 200,
  //       body: JSON.stringify({ data: items.Items }),
  //     };
  //   } catch (error) {
  //     return {
  //       statusCode: 500,
  //       body: JSON.stringify({ error: error }),
  //     };
  //   }
};
