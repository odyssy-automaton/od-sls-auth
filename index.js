const ApiBuilder = require('claudia-api-builder'),
    AWS = require('aws-sdk'),
    jwt = require('jsonwebtoken'),
    ethers = require('ethers');
var api = new ApiBuilder(),
    dynamoDb = new AWS.DynamoDB.DocumentClient();

const messages = {
    web3: "Hello world",
    jwt: "Hello world"
}

function userExists(userid){
    'use strict';

	var params = {
		TableName:'ethauths',
		Key: {
			userid: userid
		}
	};

	// post-process dynamo result before returning
	return dynamoDb.get(params).promise().then(function (response) {
		return response.Item;
	});
}

function verifyToken(userid, token) {
    'use strict';
    return jwt.verify(token, messages.jwt, function(err, decoded) {
        if (err) { 
            throw 'Failed to authenticate token.'
        }
        else {
            userid = decoded.user;
            return true;
        };
    });
  }

function verifyWeb3(signature, msg, userid) {
    const addr = ethers.utils.verifyMessage(msg, signature)
    if(addr !== userid) {
        return false
    } 
    return true;
  }

// get  new token
api.post('/ethauths', function (request) { 
    const userid = request.body.userId;
    const signature = request.body.signature;
    let isValid = false

    // check web3 signature
    // if valid return new token
    isValid = verifyWeb3(signature, message.web3, userid);
    if(isValid){
        var token = jwt.sign({user: userid}, messages.jwt,  { expiresIn: "1d" });
        var params = {  
            TableName: 'ethauths',  
            Item: {
                userid,
                token
            } 
        }
        return dynamoDb.put(params).promise().then(function (response) {
            return token;
        });
    }
    throw "invalid web3 signature"
}, { error: 400 }, { success: 201 }); // returns HTTP status 201 - Created if successful

// check if token is valid for user
api.post('/ethauths/user', function (request) { 
    const userid = request.body.userId;
    const token = request.body.token;
    let isValid = false

    isValid = verifytoken(userid, token);
    if(isValid){
        // refresh token
        token = jwt.sign({user: userid}, messages.jwt,  { expiresIn: "1d" });
        var params = {  
            TableName: 'ethauths',  
            Item: {
                userid,
                token
            } 
        }
        return dynamoDb.put(params).promise().then(function (response) {
            return token;
        });
    } 
    throw 'invalid token'
}, { error: 400 }, { success: 201 }); // returns HTTP status 201 - Created if successful

//get message to test sig against
api.get('/ethauths/message', function (request) { 
    return messages.web3;
  });

module.exports = api;