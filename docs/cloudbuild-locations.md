# Cloud Build locations

Cloud Build supports regional builds in private pools and default pools.

When selecting a region for your builds, your primary considerations should be latency and availability. You can generally select the region closest to your Cloud Build's users, but you should also consider the location of the other Google Cloud products and services that your build might integrate with. Using services across multiple locations can affect your app's latency, as well as pricing.

Cloud Build is available in the following regions:

- africa-south1
- asia-east1
- asia-east2
- asia-northeast1
- asia-northeast2
- asia-northeast3
- asia-south1
- asia-south2
- asia-southeast1
- asia-southeast2
- australia-southeast1
- australia-southeast2
- europe-central2
- europe-north1
- europe-west1
- europe-west2
- europe-west3
- europe-west4
- europe-west6
- us-central1
- us-east1
- us-east4
- us-west1
- us-west2
- us-west3
- us-west4

## Restricted regions for some projects
Depending on usage, certain projects may be restricted to only use Cloud Build in the following regions:

- us-central1
- us-west2
- europe-west1
- asia-east1
- australia-southeast1
- southamerica-east1
