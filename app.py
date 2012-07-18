import json, redis
from flask import Flask
from flask import render_template, request

from bs4 import BeautifulSoup, SoupStrainer
import human_curl as requests


app = Flask(__name__)
server = redis.Redis('localhost')

@app.route('/')
def root():
    return "Follow Hackers: <a href='link to google web store'>Get it Here</a>"

@app.route('/get_hackers/', methods=['GET'])
def get_hackers():
    user = request.args['user']
    hackers = server.lrange(user, 0, -1)
    print hackers
    return json.dumps(hackers)

@app.route('/is_following/', methods=['GET'])
def is_following():
    user = request.args['user']
    hacker = request.args['hacker']
    hackers = server.lrange(user, 0, -1)
    if hacker in hackers:
        return json.dumps(True)
    else:
        return json.dumps(False)

@app.route('/follow/', methods=['POST'])
def follow():
    user = request.form['user']
    hacker = request.form['hacker']    
    server.rpush(user, hacker)
    return json.dumps(True)

@app.route('/unfollow/', methods=['POST'])
def unfollow():
    user = request.form['user']
    hacker = request.form['hacker']
    server.lrem(user, hacker)
    return json.dumps(False)

@app.route('/hackers_stories/', methods=['GET'])
def hackers_stories():
    user = request.args['user']
    story_ids = request.args['story_ids'].split(',')
    hackers = server.lrange(user, 0, -1)

    highlight_ids = []
    for hacker in hackers:
        r = requests.get('http://api.thriftdb.com/api.hnsearch.com/items/_search?q=' + hacker + '&limit=50&sortby=create_ts+desc')
        content = json.loads(r.content)
        for item in content['results']:
            try:
                if str(item['item']['discussion']['id']) in story_ids:
                    highlight_ids.append(item['item']['discussion']['id'])
            except:
                pass
    return json.dumps(list(set(highlight_ids)))

if __name__ == "__main__":
    app.debug = True
    app.run()