#!/bin/bash

# Set the source file and backup destination
source_dir="./stats"
backup_dir="./backup"

# Generate a timestamp for the backup file
timestamp=$(date +"%Y%m%d%H%M%S")

mkdir -p "$backup_dir/$timestamp"
cp -r "$source_dir" "$backup_dir/$timestamp"

echo "Backup created: $timestamp"