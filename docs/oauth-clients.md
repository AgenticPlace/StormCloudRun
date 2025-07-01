# Manage OAuth Clients
Your OAuth client is the credential which your application uses when making calls to Google OAuth 2.0 endpoint to receive an access token or ID token. After creating your OAuth client, you will receive a client ID and sometimes, a client secret.

Think of your client ID like your app's unique username when it needs to request an access token or ID token from Google's OAuth 2.0 endpoint. This ID helps Google identify your app and ensure that only authorized applications can access user data.

## Client ID and Client Secret
Similar to how you would use a username and password to log to online services, many applications use a client ID paired with a client secret. The client secret adds an extra layer of security, acting like your app's password.

Applications are categorized as either public or private clients:

**Private Clients:** These apps, like web server applications, can securely store the client secret because they run on servers you control.
**Public Clients:** Native apps or JavaScript-based apps fall under this category. They cannot securely store secrets, as they reside on user devices and as such do not use client secrets. 
To create an OAuth 2.0 client ID in the console: 

1. Navigate to the Google Auth Platform Clients page. 
2. You will be prompted to create a project if you do not have one selected. 
3. You will be prompted to register your application to use Google Auth if you are yet to do so. This is required before creating a client.   
4. Click CREATE CLIENT
5. Select the appropriate application type for your application and enter any additional information required. Application types are described in more detail in the following sections.
6. Fill out the required information for the select client type and click the CREATE button to create the client.

**Note:** Your application's client secret will only be shown after you create the client. Store this information in a secure place such as Google Cloud Secret Manager because it will not be visible or accessible again. Learn more.

## Application types
 
* Web Applications
* Native Applications (Android, iOS, Desktop, UWP, Chrome Extensions, TV and Limited Input)

## Delete OAuth Clients
To delete a client ID, go to the Clients page, check the box next to the ID you want to delete, and then click the DELETE button.

Before deleting a Client ID, ensure to check the ID is not in use by monitoring your traffic in the overview page.  

You can restore deleted clients within 30 days of the deletion. To restore a recently deleted client, navigate to the Deleted credentials page to find a list of clients you recently deleted and click the RESTORE button for the client you want to restore.  

Any client deleted over 30 days ago cannot be restored and is permanently deleted. 

**Note**: Clients can also be automatically deleted if they become inactive. Learn more.

## Rotating your clients secrets
Client secrets or credentials should be treated with extreme care as described in the OAuth 2.0 policies, because they allow anyone who has them to use your app's identity to gain access to user information. With the client secret rotation feature, you can add a new secret to your OAuth client configuration, migrate to the new secret while the old secret is still usable, and disable the old secret afterwards. This is useful when the client secret has been inadvertently disclosed or leaked. This also ensures good security practices by occasionally rotating your secrets without causing downtime of your app. In addition, Google started to issue more secure client secrets recommended by RFC 6749 in 2021. While apps that were created earlier are able to continue using the old secrets, we recommend that you migrate to the new secret with this rotation feature. 

To rotate your client secret, please follow the following steps:

1. Step 1: Create a new client secret
2. Step 2: Configure your app to use the new secret
3. Step 3: Disable the old secret
4. Step 4: Delete the old secret
 
## Unused Client Deletion
OAuth 2.0 clients that have been inactive for six months are automatically deleted. This mitigates risks associated with unused client credentials, such as potential app impersonation or unauthorized data access if credentials are compromised.

An OAuth 2.0 client is considered unused if neither of the following actions have occurred within the past six months:

* The client has not been used for any credential or token request via the Google OAuth2.0 endpoint.
* The client's settings have not been modified programmatically or manually within the Google Cloud Console. Examples of modifications include changing the client name, rotating the client secret, or updating redirect URIs.

You will receive an email notification 30 days before an inactive client is scheduled for deletion. To prevent the automatic deletion of a client you still require, ensure it is used for an authorization or authorization request before the 30 days elapses. 

A notification will also be sent after the client has been successfully deleted.

**Note** : You should only take action to prevent deletion if you actively require the client. Keeping unused clients active unnecessarily increases security risk for your application. If you determine a client is no longer needed, delete it yourself via the Google Auth Platform Clients page. Do not wait for the automatic deletion process.

Once an OAuth 2.0 client is deleted:

* It can no longer be used for Sign in with Google or for authorization for data access.
* Calls to Google APIs using existing access tokens or refresh tokens associated with the deleted client will fail.
* Attempts to use the deleted client ID in authorization requests will result in a deleted_client error.

Deleted clients are typically recoverable at least 30 days following deletion. To restore a deleted client, navigate to the Deleted Credentials page. Only restore a client if you have a confirmed, ongoing need for it.   

To ensure that you receive these notifications and others related to your app, review your contact information settings.

## Client Secret Handling and Visibility
**Note:** This feature is currently available for new clients created after June 2025 and will be extended to existing clients at a later date.

In April 2025, we announced that client secrets for OAuth 2.0 clients are only visible and downloadable from the Google Cloud Console at the time of their creation. 

Client secrets add a critical layer of security to your OAuth 2.0 client ID, functioning similarly to a password for your application. Protecting these secrets is important for maintaining application security and privacy. To prevent accidental exposure and increase protection, client secrets are hashed. This means you will only be able to view and download the full client secret once, at the time of its creation.

It is important that you download your OAuth 2.0 client secrets immediately upon creation and store them in a secure manner, for example in a secret manager such as Google Cloud Secret Manager.

After the initial creation, the Google Cloud Console will only display the last four characters of the client secret. This truncated version is provided solely for identification purposes, allowing you to distinguish between your client secrets. If you lose your client secret, you can use the client secret rotation feature to get a new one.

### Best Practices for Client Secret Management

* Never add client secrets directly in your code or check them into version control systems such as Git or Subversion. 
* Do not share client secrets in public forums, email, or other insecure communication channels.
* Store client secrets securely using a dedicated secret management service like Google Cloud Secret Manager or a similar secure storage solution.
* Rotate client secrets periodically and change immediately in the case of a leak.
