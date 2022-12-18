FROM intezer/python-cassandra-driver

WORKDIR /app

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . /app

ENTRYPOINT [ "python" ]
CMD [ "cassandraApi.py" ]