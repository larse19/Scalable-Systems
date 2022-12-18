from pyspark.sql import SparkSession
from pyspark.sql.types import StructType,IntegerType, StringType, StructField
from pyspark.sql.functions import from_csv, col, from_json

issuesSchemaString = "repoid STRING, reponame STRING, eventtype STRING, action STRING, user STRING, title STRING, issuebody STRING, issuestate STRING, commentbody STRING, created_at STRING, closed_at STRING, eventtime STRING"

spark = SparkSession \
    .builder \
    .appName("SparkToCassandra") \
    .config("spark.cassandra.connection.host","cassandra1")\
    .config("spark.cassandra.connection.port","9042")\
    .config("spark.cassacdra.auth.username","cassandra")\
    .config("spark.cassandra.auth.password","cassandra")\
    .config('spark.master', 'spark://spark-master:7077') \
    .config('spark.executor.cores', 1) \
    .config('spark.submit.deployMode', 'client') \
    .config('spark.ui.showConsoleProgress', 'true') \
    .config('spark.cores.max', 1) \
    .config('spark.executor.memory', '1g') \
    .getOrCreate()

spark.sparkContext.setLogLevel('WARN')

df = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("startingOffsets", "earliest") \
    .option("subscribe", "issues_topic") \
    .load()

#NOTE Det er den her den er helt gal med, aner ikke hvordan jeg får data ud
df1 = df.selectExpr("CAST(value AS STRING) as value").select(from_csv('value', issuesSchemaString).alias('data')).select('data.*')
df2 = df1.withColumn("repoid",col("repoid").cast('int'))
df2.printSchema()

df2.writeStream \
    .format('console') \
    .outputMode('append') \
    .option('truncate', "false") \
    .start()

#NOTE Man er nødt til at kalde det som en metode tror jeg
def writeToCassandra(writeDF, _):
    writeDF.write \
    .format("org.apache.spark.sql.cassandra") \
    .mode("append") \
    .options(table="issuesinfo", keyspace="issuedata") \
    .save()

df2.writeStream \
    .foreachBatch(writeToCassandra) \
    .outputMode("append") \
    .start() \
    .awaitTermination()