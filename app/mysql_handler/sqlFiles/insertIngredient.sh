#!/bin/bash

$user="crepesApplication"
$password="crepe"
$database="crepesdb"
$sql=$1

mysql \
	--user="$user" \
	--password="$password" \
	--database="$database" \
	--execute="$sql"