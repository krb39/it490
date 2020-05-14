<?php

require('rpc_client.php');

$msg = $_POST['msg'];

echo "Establishing connection to messaging service... ";
$rpc = new RpcClient();
echo "[SUCCESS]<br>";

echo "Sending \"$msg\" to the echo procedure and waiting for response... ";
$response = $rpc->echo($msg);
echo "[SUCCESS]<br>";
echo "Response: $response<br>";
