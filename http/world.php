<?php
$config =  include(__DIR__.'/config.php');

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => $config['server_tap_scheme'].'://'.$config['server_tap_host'].':'.$config['server_tap_port'].'/v1/worlds',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_CONNECTTIMEOUT => 2,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'GET',
  CURLOPT_HTTPHEADER => array(
    'accept: application/json',
    'key: '.$config['server_tap_key'],
  ),
));

$response = curl_exec($curl);
$worldData = json_decode($response, true);

if (curl_errno($curl) == 28 || is_null($worldData)) {
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode([]);
	die();
}

curl_close($curl);

$outputData = array();

$worldNameKey = isset($_GET['nameAsKey']);
foreach ($worldData as $key => $value) {
	$worldSummary = [];
	
	foreach(['uuid','name','time','storm','thundering'] as $v) {
		$worldSummary[$v] = $value[$v];
	}
	
	$outputData[$worldNameKey ? $value['name'] : $value['uuid']] = $worldSummary;
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($outputData);