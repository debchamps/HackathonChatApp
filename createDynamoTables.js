var AWS= require('aws-sdk')
const keys = require('./config/key.js');

if (!AWS.config.region) {
  AWS.config.update({
    accessKeyId: keys.awsAccessKeyId,
    secretAccessKey: keys.awsSecretKey,
    region: 'ap-south-1'
  });
}


var dyn = new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://localhost:8000') });


createTables();

function createTables() {
    var dynamodb = new AWS.DynamoDB();

    var choicesParams = {


        TableName : "Choices",
        KeySchema: [
            { AttributeName: "choiceId", KeyType: "HASH"}
            ],
        AttributeDefinitions: [
            { AttributeName: "choiceId", AttributeType: "S" },
            { AttributeName: "customerId", AttributeType: "S" },
            { AttributeName: "choiceCreationTime", AttributeType: "N" }
            ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
           },
        GlobalSecondaryIndexes: [
        {
          IndexName: "CustomerIndex",
          KeySchema: [
              {
                  AttributeName: "customerId",
                  KeyType: "HASH"
              },
              {
                  AttributeName: "choiceCreationTime",
                  KeyType: "RANGE"
              }
              ],
          Projection: {
          ProjectionType: "ALL"
          },
      ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1
         }
      }

      ]
    };




    var optionParams = {


        TableName : "Options",
        KeySchema: [
            { AttributeName: "optionId", KeyType: "HASH"}
            ],
        AttributeDefinitions: [
            { AttributeName: "optionId", AttributeType: "S" },
            { AttributeName: "choiceId", AttributeType: "S" },
            { AttributeName: "customerId", AttributeType: "S" },
            { AttributeName: "optionCreationTime", AttributeType: "N" }
            ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
           },
        GlobalSecondaryIndexes: [
          {
            IndexName: "ChoiceIndex",
            KeySchema: [
                {
                    AttributeName: "choiceId",
                    KeyType: "HASH"
                }
                ],
            Projection: {
            ProjectionType: "ALL"
            },
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
           }
        },
        {
          IndexName: "CustomerIndex",
          KeySchema: [
              {
                  AttributeName: "customerId",
                  KeyType: "HASH"
              },
              {
                  AttributeName: "optionCreationTime",
                  KeyType: "RANGE"
              }
              ],
          Projection: {
          ProjectionType: "ALL"
          },
      ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1
         }
      }

      ]
    };

    var orderParams = {
        TableName : "Orders",
        KeySchema: [
            { AttributeName: "orderId", KeyType: "HASH"}
            ],
        AttributeDefinitions: [
            { AttributeName: "orderId", AttributeType: "S" },
            { AttributeName: "customerId", AttributeType: "S" }
            ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
           },
        GlobalSecondaryIndexes: [{
            IndexName: "CustomerIndex",
            KeySchema: [
                {
                    AttributeName: "customerId",
                    KeyType: "HASH"
                }
                ],
            Projection: {
            ProjectionType: "ALL"
          },
          ProvisionedThroughput: { /* required */
            ReadCapacityUnits: 1, /* required */
            WriteCapacityUnits: 1 /* required */
          }

        }]
    };

    var cartParams = {
        TableName : "Carts",
        KeySchema: [
            { AttributeName: "cartId", KeyType: "HASH"}
            ],
        AttributeDefinitions: [
            { AttributeName: "cartId", AttributeType: "S" },
            { AttributeName: "customerId", AttributeType: "S" },
            { AttributeName: "cartCreationTime", AttributeType: "N" }


        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
           },
        GlobalSecondaryIndexes: [{
            IndexName: "CustomerIndex",
            KeySchema: [
                {
                    AttributeName: "customerId",
                    KeyType: "HASH"
                },
                {
                    AttributeName: "cartCreationTime",
                    KeyType: "RANGE"
                }

                ],
            Projection: {
            ProjectionType: "ALL"
          },
          ProvisionedThroughput: { /* required */
            ReadCapacityUnits: 1, /* required */
            WriteCapacityUnits: 1 /* required */
          }

        }]
    };

    var communicationsParams = {
        TableName : "Communications",
        KeySchema: [
            { AttributeName: "communicationId", KeyType: "HASH"}
            ],
        AttributeDefinitions: [
            { AttributeName: "communicationId", AttributeType: "S" },
            { AttributeName: "communicationTime", AttributeType: "S" },
            { AttributeName: "customerId", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
           },
        GlobalSecondaryIndexes: [{
            IndexName: "CustomerIndex",
            KeySchema: [
                {
                    AttributeName: "customerId",
                    KeyType: "HASH"
                },
                {
                    AttributeName: "communicationTime",
                    KeyType: "RANGE"
                }
                ],
            Projection: {
            ProjectionType: "ALL"
            },
            ProvisionedThroughput: { /* required */
              ReadCapacityUnits: 1, /* required */
              WriteCapacityUnits: 1 /* required */
            }


        }]
    };



    dynamodb.createTable(choicesParams, function(err, data) {
       if (err) console.log(err, err.stack); // an error occurred
       else     console.log(data);           // successful response
     });


     /*
    dynamodb.createTable(communicationsParams, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else     console.log(data);           // successful response
        });
        */




};
