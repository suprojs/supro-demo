#!/bin/sh

# any param "$1" will redirect node's output: 1>>log/stdout 2>>log/stderr

set -e
PATH=.:bin:$PATH

trap 'echo "
Unexpected Script Error! Use /bin/sh -x $0 to trace it.
"
set +e

trap "" 0
exit 0
' 0

normal_exit(){
    echo "
Normal Exit${1:- (backend is running)}
"
    set +e
    trap '' 0
    exit 0
}

trap 'normal_exit' HUP TERM INT

echo '
^ reading config in $ENV'
NODEJS_CONFIG=`dd if=./config/cfg_default.js 2>/dev/null`
echo '^ exporting it for childs'
export NODEJS_CONFIG

BACKEND_PORT=${NODEJS_CONFIG##*ctl_port:}
BACKEND_PORT=${BACKEND_PORT## }
BACKEND_PORT=${BACKEND_PORT%%,*}

A=${NODEJS_CONFIG##*backend:{}
A=${A##*file:[ \'\"][\'\"]}
A=${A%%[\'\"],*} # app_main/app_back.js

BACKEND="node $A"

A=${A##*/}
A=${A%%.js*} # app_back

echo '
^ running Node.JS backend
^ command: `'"$BACKEND"'`
^ ctlport: "'"$BACKEND_PORT"'"
'

_lftp_http() { # $1=timeout $2=cmd
    { # http head request with contentlength=0 reply
        echo "[lftp->nodeJS:$JSAPPCTLPORT] sending '$2'"
        lftp -c '
set net:timeout 2;
set cmd:long-running 2;
set net:max-retries 2;
set net:reconnect-interval-base '"$1"';
set net:reconnect-interval-multiplier 1;

cd http://127.0.0.1:'"$BACKEND_PORT"'/ && cat '"$2"' && exit 0 || exit 1
'
    } 0</dev/null
    return $?
}

[ "$1" ] && {
    echo 'Logging in "./log/"'
    [ -d './log/' ] || {
        echo 'Creating "./log/"'
        mkdir log
    }
    exec 7>>log/${A}_stdout.txt 8>>log/${A}_stderr.txt
} || {
    exec 7>&1 8>&2
}
$BACKEND 1>&7 2>&8 &

while echo '
Press "Enter" key to reload, "CTRL+D" stop backend || CTRL+C to break...

NOTE: config is not reloaded (stop + start required)!
'
do
    read A || {
        echo '
Stop backend (y/n)? '
        read A && {
            [ 'y' = "$A" ] && {
                _lftp_http 1 'cmd_exit'
                A='.'
                normal_exit "$A"
            }
        } || normal_exit
    }

    _lftp_http 1 'cmd_exit' || :
    $BACKEND 1>&7 2>&8 &
done
