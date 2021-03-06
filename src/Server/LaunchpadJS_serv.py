import os
import codecs
import glob

from flask import Flask
from flask import json, jsonify
from flask_restful import reqparse
from flask import request, redirect, current_app

from functools import wraps
app = Flask(__name__)

import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

def getFile(name):
    file_list=os.listdir(name)
    return file_list

fd = codecs.open("Songs", "w", "utf-8")
fDir = getFile("Projects")
for dir1 in fDir:
    dir1 = os.path.join(os.path.normpath("Projects"),dir1)
    if os.path.isdir(dir1):
        fd.write(os.path.basename(dir1)+'\n')
        fd2 = codecs.open(os.path.join(dir1, "LEDList"),"w","utf-8")
        fDir2 = getFile(os.path.join(dir1, "keyLED"))
        for dir2 in fDir2:
            fname, ext = os.path.splitext(dir2)
            if not ext:
                fd2.write(fname+'\n')
        fd2.close()
fd.close()

def getData(name):
    tmp = os.path.split(name)
    tmp2 = getFile(tmp[0])
    for fname in tmp2:
        if fname.lower() == tmp[1].lower():
            name = os.path.join(tmp[0],fname)
    f = codecs.open(name, "r", "utf-8")
    lines = f.read().splitlines()
    f.close()
    return lines

def support_jsonp(kwd):
    @wraps(kwd)
    def decorated_function(*args, **kwargs):
        callback = request.args.get('callback', False)
        if callback:
            content = str(callback) + '(' + str(kwd().data.decode('UTF-8')) + ')'
            return current_app.response_class(content, mimetype='application/jsonp')
        else:
            return f(*args, **kwargs)
    return decorated_function

@app.route('/', methods=['GET', 'POST'])
@support_jsonp
def postJsonHandler():
    getmsg = request.args.get('msg')
    tmpp = json.loads(getmsg)
    
    return jsonify({"msg":getData(tmpp)})

if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0', port=9000)