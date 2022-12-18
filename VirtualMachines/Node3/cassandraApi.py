from cassandra.cluster import Cluster
from flask import Flask, request, jsonify, Response
from kafka import KafkaConsumer
import os
import datetime
import json

app = Flask(__name__)

cluster = Cluster(['cassandra1'], port=9042)
session = cluster.connect('issuedata')

consumer = KafkaConsumer('issues_topic', group_id='view', bootstrap_servers=['kafka:9092'])

def clean(inp) :
    if(inp == "null"):
        inp = None
    return inp

def toIssueJson(arr):
    return {
            "repoId": clean(arr[0]),
            "reponame": clean(arr[9]),
            "eventType": clean(arr[6]),
            "action": clean(arr[2]),
            "user": clean(arr[11]),
            "title": clean(arr[10]),
            "issueBody": clean(arr[7]),
            "issueState": clean(arr[8]),
            "commentBody": clean(arr[4]),
            "created_at": clean(arr[5]),
            "closed_at": clean(arr[3]),
            "eventTime": clean(arr[1]),
        }

def toStreamJson(bytes):
    arr = str(bytes, "utf-8").split(",")

    return {
            "repoId": clean(arr[0]),
            "reponame": clean(arr[9]),
            "eventType": clean(arr[6]),
            "action": clean(arr[2]),
            "user": clean(arr[11]),
            "title": clean(arr[10]),
            "issueBody": clean(arr[7]),
            "issueState": clean(arr[8]),
            "commentBody": clean(arr[4]),
            "created_at": clean(arr[5]),
            "closed_at": clean(arr[3]),
            "eventTime": clean(arr[1]),
    }


def format_sse(data: str, event=None) -> str:
    msg = f'data: {data}\n\n'
    if event is not None:
        msg = f'event: {event}\n{msg}'
    return msg

# #session.execute('USE issueData')
@app.route('/', methods=['GET'])
def hello_geek():
    rows = session.execute('SELECT reponame FROM issuesinfo')
    app.logger.info('Reading data from cassandra...')
    allRows = []
    for row in rows:
        allRows += row
    return jsonify(allRows)

@app.route('/issues', methods=['GET'])
def get_all_issues():
    bodyName = request.args.get('repoName')
    app.logger.info(bodyName)
    prepared_statement = session.prepare('SELECT * FROM issuesinfo WHERE reponame=? allow filtering')
    repo = session.execute(prepared_statement, [bodyName])
    result = []
    for row in repo:
        result.append(toIssueJson(row))
        app.logger.info(row)
    return jsonify(result)
    #return repo.reponame

@app.route('/open-issues', methods=['GET'])
def get_open_issues():
    bodyName = request.args.get('repoName')
    app.logger.info(bodyName)
    prepared_statement = session.prepare("SELECT * FROM issuesinfo WHERE reponame=? AND issueState='open' AND eventtype='IssuesEvent' ALLOW FILTERING")
    repo = session.execute(prepared_statement, [bodyName])
    result = []
    for row in repo:
       
        result.append(toIssueJson(row))
        app.logger.info(row)
    return jsonify(result)
    #return repo.reponame

@app.route('/stream', methods=['GET'])
def consume():
    return Response(kafkaStream(), mimetype="text/event-stream", headers={'Access-Control-Allow-Origin': "*"})


def kafkaStream():
    for msg in consumer:
        yield format_sse(json.dumps(toStreamJson(msg.value)))

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)