const AWS = require("aws-sdk");

export const handler = async (event: any): Promise<any> => {
  console.log("lambda authorizer event", event);
  const token = event.headers.Authorization || event.headers.authorization;

  const response = {
    isAuthroized: false,
  };

  if (token === "secret_token") {
    response.isAuthroized = true;
    console.log("user is authorized");
  }

  return response;
};
