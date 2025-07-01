# OAuth 2.0 for Client-side Web Applications

This document explains how to implement OAuth 2.0 authorization to access Google APIs from a JavaScript web application. OAuth 2.0 allows users to share specific data with an application while keeping their usernames, passwords, and other information private. For example, an application can use OAuth 2.0 to obtain permission from users to store files in their Google Drives.

This OAuth 2.0 flow is called the **implicit grant flow**. It is designed for applications that access APIs only while the user is present at the application. These applications are not able to store confidential information.

In this flow, your app opens a Google URL that uses query parameters to identify your app and the type of API access that the app requires. You can open the URL in the current browser window or a popup. The user can authenticate with Google and grant the requested permissions. Google then redirects the user back to your app. The redirect includes an access token, which your app verifies and then uses to make API requests.

## Prerequisites
### Create authorization credentials
Any application that uses OAuth 2.0 to access Google APIs must have authorization credentials that identify the application to Google's OAuth 2.0 server. 

1. Go to the **Clients page** in the Google Cloud Console.
2. Click **Create Client**.
3. Select the **Web application** application type.
4. Complete the form. Applications that use JavaScript to make authorized Google API requests must specify **authorized JavaScript origins**. The origins identify the domains from which your application can send requests to the OAuth 2.0 server. 

### Identify access scopes
Scopes enable your application to only request access to the resources that it needs while also enabling users to control the amount of access that they grant to your application. Thus, there may be an inverse relationship between the number of scopes requested and the likelihood of obtaining user consent.

## Obtaining OAuth 2.0 access tokens
The following steps show how your application interacts with Google's OAuth 2.0 server to obtain a user's consent to perform an API request on the user's behalf. Your application must have that consent before it can execute a Google API request that requires user authorization.

### Step 1: Redirect to Google's OAuth 2.0 server
To request permission to access a user's data, redirect the user to Google's OAuth 2.0 server at `https://accounts.google.com/o/oauth2/v2/auth`.

The authorization server supports the following query string parameters:

- **`client_id` (Required)**: The client ID for your application.
- **`redirect_uri` (Required)**: Determines where the API server redirects the user after the user completes the authorization flow. The value must exactly match one of the authorized redirect URIs for the OAuth 2.0 client.
- **`response_type` (Required)**: JavaScript applications must set the parameter's value to `token`. This value instructs the Google Authorization Server to return the access token in the fragment identifier of the redirect URI.
- **`scope` (Required)**: A space-delimited list of scopes that identify the resources that your application could access on the user's behalf.
- **`state` (Recommended)**: An opaque value used to maintain state between the request and the response, and to prevent cross-site request forgery (CSRF).
- **`include_granted_scopes` (Optional)**: Enables incremental authorization.
- **`login_hint` (Optional)**: Provides a hint to the server about the user trying to authenticate.
- **`prompt` (Optional)**: A space-delimited list of prompts to present the user, such as `consent` or `select_account`.

### Step 2: Google prompts user for consent
In this step, the user decides whether to grant your application the requested access. Google displays a consent window showing the name of your application and the Google API services it is requesting permission to access.

### Step 3: Handle the OAuth 2.0 server response
The OAuth 2.0 server sends a response to the `redirect_uri` specified in your access token request. **Before handling the response, you must confirm that the state received from Google matches the state you sent.**

If the user approves the request, the response contains an access token in the URL's hash fragment.
- **Access token response**: `https://oauth2.example.com/callback#access_token=4/P7q7W91&token_type=Bearer&expires_in=3600&state=...`
- **Error response**: `https://oauth2.example.com/callback#error=access_denied`

### Step 4: Call Google APIs
After your application obtains an access token, you can use the token to make calls to a Google API on behalf of a given user account. To do this, include the access token in a request to the API by including either an `access_token` query parameter or an `Authorization: Bearer` HTTP header.
