# Sourced by the sclorg MySQL image on startup, while a local-only server is running.
# Loads the schema and seed data once; later restarts keep whatever the app has written.
mysql_cmd="mysql ${mysql_flags:--u root --socket=/tmp/mysql.sock}"

if ! $mysql_cmd -N -e "SELECT 1 FROM information_schema.tables WHERE table_schema='${MYSQL_DATABASE}' AND table_name='aircraft_data'" | grep -q 1; then
  echo "=> Loading airbus schema and seed data into ${MYSQL_DATABASE}"
  $mysql_cmd "${MYSQL_DATABASE}" < /opt/app-root/src/deployDB.sql
fi
