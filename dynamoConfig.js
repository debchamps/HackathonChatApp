const keys = require('./config/key.js');
var AWS = require("aws-sdk");

var loadDynamo = function() {
  if (!AWS.config.region) {
    AWS.config.update({
      accessKeyId: keys.awsAccessKeyId,
      secretAccessKey: keys.awsSecretKey,
      region: 'ap-south-1'
    });
  }
}

exports.loadDynamo = loadDynamo;
