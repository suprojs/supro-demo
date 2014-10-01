#!/bin/sh
# v000 2012-03-26 mongodb+.sh # v001 2012-03-27 Masterpiece
# v003 2012-04-10 `_start` to run multiple clients under w32 
#      "mongo": start mongo shell for all db chuncks (uses `_start`)
# v004 2012-05-30 `linux-gnu` final adoption
# v005 2012-06-12 removed `trap '' CHLD`, dash hungs in wait4() with it
#      empty $OSTYPE under non `bash` (`dash` in debian) is handled as "linux-gnu"
# v006 2012-06-20 removed bashizm: "${db_path=${db_chunk#*/}}"
# v007 2012-07-05 added --journal, added $MONGO_DBNAME
# v008 2012-08-14 fix: `source` ./path.conf
# v009 2013-03-11 fix: LOGPREF=db_${DBADDR#*:}.log,
#                 $MONGO_DBNAME without leading slash
# v010 2013-03-13 PATH: rename bin.w32 to bin.win

# TODO: --usePowerOf2sizes --nopreallocate --smallfiles --directory perdb

set -e

[ "$*" ] || { echo "
Usage: $0"' app_name.conf [&|] {start, stop, stat, mongo}
(script, abs path app config file,   command)
Managing of `mongodb` memory server under cygwin or linux-gnu OSes
'
exit 2
}

trap 'echo "
Unexpected Script Error! Use /bin/sh -x $0 to trace it.
"
set +e

trap "" 0
exit 0
' 0

_err() {
printf '[error] '"$@" >&2
}

[ -e "$1" ] || {
_err "No Config file $1 is there."
exit 1
}

_exit() {
trap "" 0
exit "$1"
}

case "$OSTYPE" in
*cygwin*) # OSTYPE=cygwin in `bash`
	LD_LIBRARY_PATH='/bin:/bin.win'
	PATH="/bin:/bin.win:$PATH"
	_start(){
	cmd /C start "$@"
	}
;;
*linux_gnu* | *)
	OSTYPE=linux-gnu
	LD_LIBRARY_PATH="/usr/local/bin:$LD_LIBRARY_PATH"
	case "$PATH" in
	  *"/usr/local/bin"*) ;;
	  *) PATH="/usr/local/bin:$PATH" ;;
	esac
	_start(){
	"$@"
	}
;;
esac
# including config here; make \r\n -> \n trasformation
sed 's/\r//g' "$1" >"$1".cr
/bin/sh -c ". ./${1}.cr"
. "./${1}.cr"
rm -f "${1}.cr"
shift 1
#
export PATH LD_LIBRARY_PATH

_date() { # ISO date
date -u '+%Y-%m-%dT%H:%M:%SZ'
}

_lftp_http() { # $1=timeout $2=cmd $3=real_url
{ # http head request with contentlength=0 reply
echo "[lftp->mongodb:${admin_web_console=$((1000 + ${DBADDR##*:}))}] sending '$2'"
lftp -c '
set net:timeout 2;
set cmd:long-running 2;
set net:max-retries 2;
set net:reconnect-interval-base '"$1"';
set net:reconnect-interval-multiplier 1;

cd http://127.0.0.1:'"${admin_web_console}"'/ && cat '"$3"' && exit 0 || exit 1
'
} 0</dev/null 2>&8
return $?
}

_mongo() { # $1=cmd
{
case "$1" in
#'cmd_stat') -- OLD PLAN --  cmd='print(tojson(getMemInfo()))';;
'sts_running' | 'cmd_stat') #cmd='quit()'
a=`_lftp_http 1 "$1" '/serverStatus' 7>&1` ; b=$?
echo "$a" | sed 's/.*\("uptime"[^,]*\),.*/\1/p;1!d'
return $b
;;
'cmd_exit') cmd='db.shutdownServer(1);quit()';;
* ) cmd=$1;;
esac

echo "[mongo->mongodb] sending '$1'"
"$MONGO" --eval "$cmd" "$DBADDR/admin"
} 0</dev/null 1>&7 2>&8
return $?
}

_con(){
printf "$@" >&7
}

#set -x#set +x
if [ 'console' = "$JSAPPSTART" ]
then _con "
Managing mongodb under \"$OSTYPE\"...

"
[ "$MONGOD_SRVs" ] || { _con '
development: $MONGOD_SRVs config is empty, nothing to start.

'
exit 0
}
fi 7>&1

[ -d "$JSAPPLOGS" ] || {
	mkdir -p "$JSAPPLOGS"
	[ 'console' = "$JSAPPSTART" ] && echo "Created logs dir: $JSAPPLOGS"
}

while [ "$*" ]
do for db_chunk in $MONGOD_SRVs
do

# "url:port/fs/path2/db" like this "127.0.0.1:27017/_data/db"
DBADDR=${db_chunk%%/*} # 127.0.0.1:27017
LOGPREF=db_${DBADDR#*:}.log # db_27017.log

if [ 'console' = "$JSAPPSTART" ]
then exec 8>>"$JSAPPLOGS/${LOGPREF}" 7>&1
else case "$1" in
 'stat') exec 7>/dev/null 8>&7 ;;
 *) exec 7>>"$JSAPPLOGS/${LOGPREF}" 8>&7 ;
 esac
fi

if _mongo 'sts_running' 7>/dev/null 8>&7
then # == REstart: stop, start ==
	case "$1" in
	'stop')
_mongo 'cmd_exit' 7>/dev/null 8>&7 && {
	_con 'stop sent
'
_mongo 'sts_running' 7>/dev/null 8>&7 && _exit 1 || _con "mongodb for '${db_chunk}'"' stopped
'
} || _con "${db_chunk}"' already dead'
;;
	'stat')
_mongo 'cmd_stat' && _con "
runnig status of mongodb '${db_chunk}': OK

" 7>&1 || _con "
deep shit happend

" 7>&1
;;
	'start')
	_con "mongodb for '${db_chunk}'"' already started and is running
'
	_exit 7
;;
	'mongo')
	_con "starting mongodb shell for '$db_chunk'"'
'
	_start mongo "${db_chunk%%/*}/$MONGO_DBNAME"

	_exit $?
;;
	esac
else # == start ==
	case "$1" in
	'start')
	db_path=${db_chunk#*/}
	{ [ -d "${db_path}" ] || {
	   _con "creating '$db_path': "
	   mkdir -p "$db_path" && _con "OK 
"   ; }
    } && {
     _con "@[`_date`] mongo`$MONGOD --version | sed '1!d'` is starting...
"
# journal: 32 bit nuances?
# There is extra memory mapped file activity with journaling. This will
# further constrain the limited db size of 32 bit builds. Thus, for now
# journaling by default is disabled on 32 bit systems.
$MONGOD  --repair --upgrade --dbpath "$db_path" 0</dev/null 1>&8 2>&8 7>&- 8>&-
$MONGOD  --bind_ip "${DBADDR%%:*}" --port "${DBADDR##*:}" --journal \
	 --dbpath "$db_path" 0</dev/null 1>&8 2>&8 7>&- 8>&- &
	 _con "'${db_chunk}$MONGO_DBNAME' running status: "
	 _mongo 'sts_running' 7>/dev/null 8>&7 && _con "OK
" ; } || {
_err "Error
"
if [ 'console' = "$JSAPPSTART" ]
then tail "$JSAPPLOGS/${LOGPREF}"
fi
_exit 1
}
;;
	'stat' | 'stop' | 'mongo')
_con "mongodb for '$db_chunk' is not running
"
_exit 8
;;
	esac
fi
exec 7>&- 8>&-

done # for db_chunks

shift 1
done # while "$*" script commands

_exit 0

# mongodb+.sh ends here #
olecom
