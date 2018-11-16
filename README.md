## endpoints

#### POST /ethauths/user 
check if users token is valid if it is refresh the token, return token

* userid
* token

#### GET /ethauths/message
get message to sign

#### POST /ethauths 
when token is invalid or does not exist create a new token, return token

#### POST /ismember
return true or false if member of dolo

* userid
* token

## examples

```bash
curl -H "Content-Type: application/json" -X POST -d '{"userId":"0xCedEEcB8438977Dda9f095dFc664422cB32007A1", "signature":"0x30755ed65396facf86c53e6217c52b4daebe72aa4941d89635409de4c9c7f9466d4e9aaec7977f05e923889b33c0d0dd27d7226b6e6f56ce737465c5cfd04be400"}' https://w65t9a9h3f.execute-api.us-east-1.amazonaws.com/latest/ethauths
```

```bash
curl -H "Content-Type: application/json" -X POST -d '{"userId":"0xCedEEcB8438977Dda9f095dFc664422cB32007A1", "token":"0x30755ed65396facf86c53e6217c52b4daebe72aa4941d89635409de4c9c7f9466d4e9aaec7977f05e923889b33c0d0dd27d7226b6e6f56ce737465c5cfd04be400"}' https://w65t9a9h3f.execute-api.us-east-1.amazonaws.com/latest/ethauths/user
```

## notes

aws dynamodb create-table --table-name ethauths \
 --attribute-definitions AttributeName=userid,AttributeType=S \
 --key-schema AttributeName=userid,KeyType=HASH \
 --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
 --region us-east-1 \
 --query TableDescription.TableArn --output text


arn:aws:dynamodb:us-east-1:947598263436:table/ethauths

{
 "lambda": {
   "role": "od-sls-ethauth-executor",
   "name": "od-sls-ethauth",
   "region": "us-east-1"
 },
 "api": {
   "id": "w65t9a9h3f",
   "module": "index",
   "url": "https://w65t9a9h3f.execute-api.us-east-1.amazonaws.com/latest"
 }
}