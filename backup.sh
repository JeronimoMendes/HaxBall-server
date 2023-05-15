#!/bin/bash

# Set the source file and backup destination
source_file="./stats/players.json"
backup_dir="./stats/backup"

# Generate a timestamp for the backup file
timestamp=$(date +"%Y%m%d%H%M%S")

# Create the backup filename with the timestamp
backup_file="${backup_dir}/${timestamp}_players.bak"

# Copy the source file to the backup location
cp "$source_file" "$backup_file"

# Print a success message
echo "Backup created: $backup_file"