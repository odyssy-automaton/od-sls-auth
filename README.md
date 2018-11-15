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