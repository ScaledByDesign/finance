import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { userId: string } }) {
    const { userId } = params;
    const apiKey = process.env.PUBLIC_API_KEY;
    const openapi_spec = {
        "openapi": "3.1.0",
        "info": {
          "title": "Finance API",
          "description": "API for accessing user accounts and transactions in the Finance application.",
          "version": "1.0.0"
        },
        "servers": [
          {
            "url": "https://mint-clone.vercel.app",
            "description": "Production server"
          }
        ],
        "paths": {
          "/api/public/user/{userId}/accounts": {
            "get": {
              "operationId": "getUserAccounts",
              "summary": "Retrieve accounts for a specific user.",
              "parameters": [
                {
                  "name": "userId",
                  "in": "path",
                  "required": true,
                  "description": "Unique identifier to use for this user is " + userId,
                  "schema": {
                    "type": "string"
                  }
                },
                {
                  "name": "x-api-key",
                  "in": "header",
                  "required": true,
                  "description": "API key for authorization is " + apiKey,
                  "schema": {
                    "type": "string"
                  }
                }
              ],
              "responses": {
                "200": {
                  "description": "List of user accounts.",
                  "content": {
                    "application/json": {
                      "schema": {
                        "type": "object",
                        "properties": {
                          "message": {
                            "type": "string",
                            "example": "Authorized"
                          },
                          "data": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "id": { "type": "string" },
                                "userId": { "type": "string" },
                                "institutionId": { "type": "string" },
                                "institution": {
                                  "type": "object",
                                  "properties": {
                                    "id": { "type": "string" },
                                    "institution_id": { "type": "string" },
                                    "name": { "type": "string" }
                                  }
                                },
                                "accounts": {
                                  "type": "array",
                                  "items": {
                                    "type": "object",
                                    "properties": {
                                      "id": { "type": "string" },
                                      "name": { "type": "string" },
                                      "balances": {
                                        "type": "object",
                                        "properties": {
                                          "available": { "type": "number", "nullable": true },
                                          "current": { "type": "number" },
                                          "iso_currency_code": { "type": "string" },
                                          "limit": { "type": "number", "nullable": true }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "401": {
                  "description": "Unauthorized."
                }
              }
            }
          },
          "/api/public/user/{userId}/transactions": {
            "get": {
              "operationId": "getUserTransactions",
              "summary": "Retrieve transactions for a specific user.",
              "parameters": [
                {
                  "name": "userId",
                  "in": "path",
                  "required": true,
                  "description": "Unique identifier to use for this user is " + userId,
                  "schema": {
                    "type": "string"
                  }
                },
                {
                  "name": "x-api-key",
                  "in": "header",
                  "required": true,
                  "description": "API key for authorization is " + apiKey,
                  "schema": {
                    "type": "string"
                  }
                }
              ],
              "responses": {
                "200": {
                  "description": "List of user transactions.",
                  "content": {
                    "application/json": {
                      "schema": {
                        "type": "object",
                        "properties": {
                          "message": {
                            "type": "string",
                            "example": "Authorized"
                          },
                          "data": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "id": { "type": "string" },
                                "userId": { "type": "string" },
                                "name": { "type": "string" },
                                "amount": { "type": "number" },
                                "date": { "type": "string", "format": "date-time" },
                                "category": {
                                  "type": "array",
                                  "items": { "type": "string" }
                                },
                                "payment_channel": { "type": "string" },
                                "transaction_id": { "type": "string" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "401": {
                  "description": "Unauthorized."
                }
              }
            }
          }
        }
      }
    return NextResponse.json(openapi_spec);
}

