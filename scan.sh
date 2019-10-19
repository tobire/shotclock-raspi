PORT=8060
NETWORK=192.168.178.0
RETRY_WAIT=5

while true; do
	echo "Scanning for servers in network $NETWORK on port $PORT..."
	nmap -p $PORT $NETWORK/24 -oG scan.out > /dev/null
	sed -ni '/open/p' scan.out
	FOUND=0
	while read line; do
		IP=$(cut -d ' ' -f2 <<<"$line")
		echo "Found running server. Opening browser: http://$IP:$PORT"
		chromium-browser --incognito --kiosk --disable-infobars --app=http://$IP:$PORT &
		FOUND=1
		break
	done <scan.out
	rm scan.out
	if [ $FOUND == 1 ] ; then
		break
	fi
	echo "No running server found. Retrying in $RETRY_WAIT seconds..."
	sleep $RETRY_WAIT
done
