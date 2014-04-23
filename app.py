import json, redis, requests, os
from flask import Flask
from flask import render_template, request

app = Flask(__name__)
server = redis.from_url(os.getenv('REDISTOGO_URL', 'redis://localhost:6379'))

@app.route('/')
def root():
    return """
        Follow Hackers: <a href='https://chrome.google.com/webstore/detail/hapackcnjagkljgfjlgonohbabnfgopc?hl=en&gl=US'>Get it Here</a><br/>
        <iframe src='http://markdotto.github.com/github-buttons/github-btn.html?user=imfatyourefat&repo=Follow-Hackers&type=watch' allowtransparency='true' frameborder='0' scrolling='0' width='62px' height='20px'></iframe>
        <iframe src='http://markdotto.github.com/github-buttons/github-btn.html?user=imfatyourefat&repo=Follow-Hackers&type=fork' allowtransparency='true' frameborder='0' scrolling='0' width='53px' height='20px'></iframe>
        <iframe src='http://markdotto.github.com/github-buttons/github-btn.html?user=imfatyourefat&type=follow' allowtransparency='true' frameborder='0' scrolling='0' width='132px' height='20px'></iframe>"""

@app.route('/get_hackers/', methods=['GET'])
def get_hackers():
    user = request.args['user']
    hackers = server.lrange(user, 0, -1)
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
        r = requests.get('http://hn.algolia.com/api/v1/search_by_date?tags=comment,author_' + hacker)
        content = r.json()
        for item in content['hits']:
            try:
                # the story is on the page and the comment was made by the hacker
                if str(item['story_id']) in story_ids: #and str(item['author']) == hacker:
                    highlight_ids.append(item['story_id'])
            except:
                pass
    return json.dumps(list(set(highlight_ids)))

if __name__ == "__main__":
    app.debug = True
    app.run()
