var AWS= require('aws-sdk')
const keys = require('./config/key.js');

if (!AWS.config.region) {
  AWS.config.update({
    accessKeyId: keys.awsAccessKeyId,
    secretAccessKey: keys.awsSecretKey,
    region: 'ap-south-1'
  });
}

dyn= new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://localhost:8000') });
var dynamodb = new AWS.DynamoDB();


dynamodb.listTables(function (err, data)
{
   console.log('listTables',err,data);
});
