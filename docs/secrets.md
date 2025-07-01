# Secret Manager API

Stores sensitive data such as API keys, passwords, and certificates. Provides convenience while improving security.

**Service:** `secretmanager.googleapis.com`

To call this service, we recommend that you use the Google-provided client libraries. If your application needs to use your own libraries to call this service, use the following information when you make the API requests.

## Discovery document
A Discovery Document is a machine-readable specification for describing and consuming REST APIs. It is used to build client libraries, IDE plugins, and other tools that interact with Google APIs. One service may provide multiple discovery documents. This service provides the following discovery documents:

-   `https://secretmanager.googleapis.com/$discovery/rest?version=v1`
-   `https://secretmanager.googleapis.com/$discovery/rest?version=v1beta1`

## Service endpoint
A service endpoint is a base URL that specifies the network address of an API service. One service might have multiple service endpoints. This service has the following service endpoint and all URIs below are relative to this service endpoint:

-   `https://secretmanager.googleapis.com`

## REST Resources

### `v1.projects.secrets`

| Method | HTTP Verb & Path | Description |
|---|---|---|
| addVersion | `POST /v1/{parent=projects/*/secrets/*}:addVersion` | Creates a new SecretVersion containing secret data and attaches it to an existing Secret. |
| create | `POST /v1/{parent=projects/*}/secrets` | Creates a new Secret containing no SecretVersions. |
| delete | `DELETE /v1/{name=projects/*/secrets/*}` | Deletes a Secret. |
| get | `GET /v1/{name=projects/*/secrets/*}` | Gets metadata for a given Secret. |
| getIamPolicy | `GET /v1/{resource=projects/*/secrets/*}:getIamPolicy` | Gets the access control policy for a secret. |
| list | `GET /v1/{parent=projects/*}/secrets` | Lists Secrets. |
| patch | `PATCH /v1/{secret.name=projects/*/secrets/*}` | Updates metadata of an existing Secret. |
| setIamPolicy | `POST /v1/{resource=projects/*/secrets/*}:setIamPolicy` | Sets the access control policy on the specified secret. |
| testIamPermissions | `POST /v1/{resource=projects/*/secrets/*}:testIamPermissions` | Returns permissions that a caller has for the specified secret. |

### `v1.projects.secrets.versions`

| Method | HTTP Verb & Path | Description |
|---|---|---|
| access | `GET /v1/{name=projects/*/secrets/*/versions/*}:access` | Accesses a SecretVersion. |
| destroy | `POST /v1/{name=projects/*/secrets/*/versions/*}:destroy` | Destroys a SecretVersion. |
| disable | `POST /v1/{name=projects/*/secrets/*/versions/*}:disable` | Disables a SecretVersion. |
| enable | `POST /v1/{name=projects/*/secrets/*/versions/*}:enable` | Enables a SecretVersion. |
| get | `GET /v1/{name=projects/*/secrets/*/versions/*}` | Gets metadata for a SecretVersion. |
| list | `GET /v1/{parent=projects/*/secrets/*}/versions` | Lists SecretVersions. |

## Secret Manager Roles

| Role | Permissions |
| --- | --- |
| **Secret Manager Admin** <br/> `roles/secretmanager.admin` | Full access to administer Secret Manager resources. |
| **Secret Manager Secret Accessor** <br/> `roles/secretmanager.secretAccessor` | Allows accessing the payload of secrets. |
| **Secret Manager Secret Version Adder** <br/> `roles/secretmanager.secretVersionAdder` | Allows adding versions to existing secrets. |
| **Secret Manager Secret Version Manager** <br/> `roles/secretmanager.secretVersionManager` | Allows creating and managing versions of existing secrets. |
| **Secret Manager Viewer** <br/> `roles/secretmanager.viewer` | Allows viewing metadata of all Secret Manager resources. |


## Secret Manager Permissions

| Permission | Included in roles |
| --- | --- |
| `secretmanager.locations.get` | Owner, Editor, Viewer, Secret Manager Admin, Secret Manager Viewer |
| `secretmanager.secrets.create` | Owner, Editor, Secret Manager Admin |
| `secretmanager.secrets.get` | Owner, Editor, Viewer, Secret Manager Admin, Secret Manager Viewer |
| `secretmanager.secrets.list` | Owner, Editor, Viewer, Secret Manager Admin, Secret Manager Viewer |
| `secretmanager.secrets.update` | Owner, Editor, Secret Manager Admin |
| `secretmanager.secrets.delete` | Owner, Editor, Secret Manager Admin |
| `secretmanager.versions.access` | Owner, Secret Manager Admin, Secret Manager Secret Accessor |
| `secretmanager.versions.add` | Owner, Editor, Secret Manager Admin, Secret Manager Secret Version Adder, Secret Manager Secret Version Manager |
| `secretmanager.versions.destroy` | Owner, Editor, Secret Manager Admin, Secret Manager Secret Version Manager |
| `secretmanager.versions.disable` | Owner, Editor, Secret Manager Admin, Secret Manager Secret Version Manager |
| `secretmanager.versions.enable` | Owner, Editor, Secret Manager Admin, Secret Manager Secret Version Manager |
| `secretmanager.versions.get` | Owner, Editor, Viewer, Secret Manager Admin, Secret Manager Secret Version Manager, Secret Manager Viewer |
| `secretmanager.versions.list` | Owner, Editor, Viewer, Secret Manager Admin, Secret Manager Secret Version Manager, Secret Manager Viewer |
| `secretmanager.secrets.getIamPolicy` | Owner, Security Admin, Secret Manager Admin, Secret Manager Viewer |
| `secretmanager.secrets.setIamPolicy` | Owner, Security Admin, Secret Manager Admin |