import gzip
import json
import time
import random
from kafka import KafkaProducer

#This script is runned from our own local machines with an ssh connection to Node1 and port '9092' forwarded
#The 'data.json.gz' is downloaded from GHArchive
producer = KafkaProducer(bootstrap_servers=['localhost:9092'], api_version=(2, 5, 0), value_serializer=lambda v: json.dumps(v).encode('utf-8'))


#send "historical data"
with gzip.open('./data.json.gz', mode='rt', encoding='utf-8') as f:
    for line in f:
        jsonLine = json.loads(line)
        if 'issue' in jsonLine["type"].lower():
            producer.send('ghData', value=jsonLine, key=str(jsonLine["repo"]["id"]).encode('utf8')) 

#NOTE This is used when simulating streaming data at a random interval
#simulate "streaming data"
# with gzip.open('./2015-01-02-15.json.gz', mode='rt', encoding='utf-8') as l:
#     for line in l:
#         producer.send('ghData', value=json.dumps(line).encode('utf8'), key=str(jsonLine["repo"]["id"]).encode('utf8'))
#         time.sleep(random.randint(3,10)) 