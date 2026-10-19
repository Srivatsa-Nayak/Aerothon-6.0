# MySQL 8 image from Software Collections: runs as non-root and works under OpenShift's restricted SCC.
# Build from the repo root:  docker build -f database/Dockerfile .
FROM quay.io/sclorg/mysql-80-c9s
ENV MYSQL_DATABASE=airbus
# The backend's `mysql` npm driver can't do MySQL 8's default caching_sha2_password auth.
ENV MYSQL_AUTHENTICATION_POLICY="mysql_native_password,,"
COPY deployDB.sql /opt/app-root/src/deployDB.sql
COPY database/mysql-init/ /opt/app-root/src/mysql-init/
