# web-scraper-gcp
Scrape all the pages and links of a given domain and write the results to Google Cloud BigQuery.

# Steps

1. Clone the repo locally
2. Create a Google Cloud Platform project, enable Compute Engine API and BigQuery API
3. Install latest version of gcloud SDK
4. Authenticate against gcloud SDK and set the project to the one you created
5. Edit config.json.sample
-- a. Update "domain" to match what you consider an "internal" domain pattern
-- b. Update "startUrl" to give the entry point for the crawl
-- c. Update "projectId" to the GCP project ID
-- d. Update "bigQuery.datasetId" and "bigQuery.tableId" to a dataset ID and table ID you want the script to create and write the results to.
6. If you want to use e.g. GCP Memorystore, set "redis.active" to true and update the host and port to match the Redis instance
7. Save the config.json.sample to config.json, and upload it to a Google Cloud Storage bucket
8. Edit gce-install.sh and update the `bucket` variable to the URL to the config file in Google Cloud Storage
9. Once ready, run

```
gcloud compute instances create web-scraper-gcp \
    --machine-type=n1-standard-16 \
    --metadata-from-file=startup-script=./gce-install.sh \
    --scopes=bigquery,cloud-platform \
    --zone=europe-north1-a
```

Feel free to change `machine-type` to something more or less powerful if you wish. Feel free to change the zone, too.

This will create a new Compute Engine instance called "web-scraper-gcp", which will run the crawl as soon as the instance is started. Once the crawl is over, the instance is automatically stopped.
