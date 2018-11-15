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


//middleware
function authMw(req) {

    return jwt.verify(req.body.token, message.jwt, function(err, decoded) {
        if (err) { 
            throw 'Failed to authenticate token.'
        }
        else {
            req.user = decoded.user;
            return req;
        };
    });
  }

  function verify(signature, userId) {}
  function isAuthenticated(userId, sessionId) {}

// api.registerAuthorizer('authtest', {
// 	lambdaName: 'authtest',
// 	lambdaVersion: true
// });

// register
api.post('/ethauths', function (request) { 
    const userid = request.body.userId;
    const signature = request.body.signature;

    const addr = ethers.utils.verifyMessage(message.web3, signature)

    if(addr !== userid) {
        throw addr;
    } else {
        var token = jwt.sign({user: userid}, message.jwt,  { expiresIn: "1d" });
        var params = {  
            TableName: 'ethauths',  
            Item: {
                userid,
                signature,
                token
            } 
        }
        var result = dynamoDb.put(params).promise();
        return {result, token};
    }


}, { error: 400 }, { success: 201 }); // returns HTTP status 201 - Created if successful

api.get('/ethauths/message', function (request) { 
    return message;
  });

api.post('/ethauths/authcheck', function (request) { 
  const _req = authMw(request);
  return _req.user + ' :test';
});

// clear session

// member of check

module.exports = api;