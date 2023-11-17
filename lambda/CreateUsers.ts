// import * as AWS from "aws-sdk";
const AWS = require("aws-sdk");
// import { v4 as uuidv4 } from "uuid";
// import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
const dynamodb = new AWS.DynamoDB.DocumentClient();

// export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
export const handler = async (event: any): Promise<any> => {
  const requestBody = JSON.parse(event.body!);

  let { name, age, email, isStudent } = requestBody;

  if (!name || !age || !email || !isStudent) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Bad Request! Required Credentials Are Missing" }),
    };
  }

  const params = {
    TableName: process.env.TABLE_NAME!,
    Item: {
      user_id: "1",
      name: name,
      age: age,
      email: email,
      isStudent: isStudent,
    },
  };

  try {
    await dynamodb.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ data: "User Created Successfully" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error }),
    };
  }
};
