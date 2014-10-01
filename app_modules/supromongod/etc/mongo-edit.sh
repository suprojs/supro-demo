#!/bin/sh

cd '/d/' || cd '/cygdrive/d/' || exit 1
cd './#_projects/mongo-edit/git-repo/mongo-edit/'

echo 'starting `mongo-edit` at URL
http://127.0.0.1:2764/

(ctrl+c to kill)'
node server.js config/suproLocal.js
