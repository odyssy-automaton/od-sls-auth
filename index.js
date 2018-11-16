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

const abi = [{"constant":false,"inputs":[{"name":"_curator","type":"address"}],"name":"transferCurator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"nativeTokenInstance","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"uuid","type":"uint256"}],"name":"cancelProject","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"stakeCommunityTokens","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_lockupPeriodSeconds","type":"uint256"}],"name":"setLockupPeriodSeconds","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_voteController","type":"address"}],"name":"transferVoteController","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"uuid","type":"uint256"},{"name":"amount","type":"uint256"}],"name":"createNewTask","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"setCommunityAccountOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newLoggerAddress","type":"address"}],"name":"setLogger","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"uuid","type":"uint256"}],"name":"rewardProjectCompletion","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"uuid","type":"uint256"},{"name":"amount","type":"uint256"},{"name":"projectPayee","type":"address"}],"name":"createNewProject","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"communityTokenInstance","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_minimumStakingRequirement","type":"uint256"}],"name":"setMinimumStakingRequirement","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"uuid","type":"uint256"}],"name":"cancelTask","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"unstakeCommunityTokens","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"lockupPeriodSeconds","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"voteController","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"memberAddress","type":"address"}],"name":"isMember","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"communityAccount","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newNativeTokenAddress","type":"address"},{"name":"newCommunityTokenAddress","type":"address"}],"name":"setTokenAddresses","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newCommunityAccountAddress","type":"address"}],"name":"setCommunityAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getAvailableDevFund","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getLockedDevFundAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"curator","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"uuid","type":"uint256"},{"name":"user","type":"address"}],"name":"rewardTaskCompletion","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"minimumStakingRequirement","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"logger","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_minimumStakingRequirement","type":"uint256"},{"name":"_lockupPeriodSeconds","type":"uint256"},{"name":"_curator","type":"address"},{"name":"_communityTokenContractAddress","type":"address"},{"name":"_nativeTokenContractAddress","type":"address"},{"name":"_voteController","type":"address"},{"name":"_loggerContractAddress","type":"address"},{"name":"_communityAccountContractAddress","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]
const provider = ethers.getDefaultProvider();
//const provider = new ethers.providers.InfuraProvider('ropsten', apikey);
const contractAddress = "0xd2039877775b91ade93c7658b656c3d06a59f111";

const contract = new ethers.Contract(contractAddress, abi, provider);
// isMember

function userExists(userid){
    'use strict';

	var params = {
		TableName:'ethauths',
		Key: {
			userid: userid
		}
	};

	// post-process dynamo result before returning
	return dynamoDb.get(params).promise();
}

function verifyToken(userid, token) {
    'use strict';
    var isUser;
    return jwt.verify(token, messages.jwt, function(err, decoded) {
        if (err) { 
            throw 'Failed to authenticate token.'
        }
        else {
            return userid === decoded.user;
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
    isValid = verifyWeb3(signature, messages.web3, userid);
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
api.post('/ethauths/user', async function (request) { 
    const userid = request.body.userId;
    let token = request.body.token;
    let isValid = false

    await userExists(userid).then(function (response) {
        let user = response.Item;
        
        if(user === undefined) {
            throw "user not registarted"
        }
    });
    

    isValid = verifyToken(userid, token);
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

api.post('/ethauths/ismember', async function (request) { 
    const userid = request.body.userId;
    let token = request.body.token;
    isValid = verifyToken(userid, token);
    if(isValid){
        let isMember = await contract.isMember(userid);
        return isMember
    }
    throw "invalid token"
}, { error: 400 }, { success: 201 });

//get message to test sig against
api.get('/ethauths/message', function (request) { 
    return messages.web3;
  });

module.exports = api;