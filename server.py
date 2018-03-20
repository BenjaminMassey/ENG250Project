import flask
from flask import request, session
from pymongo import MongoClient


app = flask.Flask(__name__)
client = MongoClient("mongodb://b:b@ds117749.mlab.com:17749/eng250")
db = client.get_default_database()
collection = db['times']

@app.route("/submit")
def submit():
	type = request.args.get('type', 0, type=str)
	time = request.args.get('time', 0, type=str)
	collection.insert({"type":type, "time":time})
	return "yay"

if __name__ == "__main__":
    app.run(port=5000, host="0.0.0.0")