#import pyspark
from pyspark.sql import SparkSession
from pyspark.sql.functions import to_json,col,array,get_json_object,regexp_replace

spark = SparkSession.builder.appName("ConvertToIssues") \
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
    .option("subscribe", "ghData") \
    .load()

values = df.selectExpr("CAST(key AS STRING) as key", "CAST(value AS STRING) as value") \
    .select( 
    get_json_object(col('value'), "$.repo.id").alias("repoId"),
    get_json_object(col('value'), "$.repo.name").alias("repoName"),
    get_json_object(col('value'), "$.type").alias("type"),
    get_json_object(col('value'), "$.payload.action").alias("action"),
    get_json_object(col('value'), "$.actor.login").alias("user"),
    get_json_object(col('value'), "$.payload.issue.title").alias("title"),
    get_json_object(col('value'), "$.payload.issue.body").alias("issueBody"),
    get_json_object(col('value'), "$.payload.issue.state").alias("issueState"),
    get_json_object(col('value'), "$.payload.comment.body").alias("commentBody"),
    get_json_object(col('value'), "$.payload.issue.created_at").alias("created_at"),
    get_json_object(col('value'), "$.payload.issue.closed_at").alias("closed_at"),
    get_json_object(col('value'), "$.created_at").alias("eventTime"),
    )

columns = [col(c) for c in values.columns]

mergedColumns = values.withColumn("value", array(columns))

# mergedColumns.select(to_json(mergedColumns.value).alias('mvalue')).select(regexp_replace('mvalue','^\[', '').alias('value1')).select(regexp_replace('value1',']$', '').alias('value')).writeStream \
#     .format('console') \
#     .outputMode('append') \
#     .option('truncate', "false") \
#     .start()

mergedColumns.select(to_json(mergedColumns.value).alias('mvalue')).select(regexp_replace('mvalue','^\[', '').alias('value1')).select(regexp_replace('value1',']$', '').alias('value2')).selectExpr("CAST(value2 AS STRING) as value") \
    .writeStream \
    .format("kafka") \
    .outputMode("append") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("topic", "issues_topic") \
    .option("checkpointLocation", "./checkpoint") \
    .start() \
    .awaitTermination()