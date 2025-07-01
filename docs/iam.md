# IAM overview

This page describes how Google Cloud's Identity and Access Management (IAM) system works and how you can use it to manage access in Google Cloud.

IAM is a tool to manage fine-grained authorization for Google Cloud. In other words, it lets you control who can do what on which resources.


## Access in Google Cloud
Every action in Google Cloud requires certain permissions. When someone tries to perform an action in Google Cloud—for example, create a VM instance or view a dataset—IAM first checks to see if they have the required permissions. If they don't, then IAM prevents them from performing the action.

Giving someone permissions in IAM involves the following three components:

Principal: The identity of the person or system that you want to give permissions to
Role: The collection of permissions that you want to give the principal
Resource: The Google Cloud resource that you want to let the principal access
To give the principal permission to access the resource, you grant them the role on the resource. You grant these roles using an allow policy.

The following sections describe these concepts in more detail.


## Principals
In Google Cloud you control access for principals. Principals represent one or more identities that have authenticated to Google Cloud.

In the past, principals were referred to as members. Some APIs still use that term.

There are a variety of types of principals in IAM, but they can be divided into two broad categories:

Human users: Some IAM principal types represent human users. You use these principal types for managing your employees' access to Google Cloud resources.

Principal types that represent human users include Google Accounts, Google groups, and federated identities in workforce identity pools.

Workloads: Some IAM principal types represent workloads. You use these principal types when managing your workloads' access Google Cloud resources.

Principal types that represent workloads include service accounts and federated identities in a workload identity pool.

For more information about principals, see IAM principals.


## Permissions and roles
Permissions determine what operations are allowed on a resource. In IAM, permissions are typically represented in the form service.resource.verb. Often, permissions correspond one-to-one with REST API methods—for example, the resourcemanager.projects.list permission lets you list Resource Manager projects.

You can't directly grant permissions to a principal. Instead, you give principals permissions by granting them roles.

Roles are collections of permissions. When you grant a role to a principal, you give that principal all of the permissions in that role.

There are three types of roles:

Predefined roles: Roles that are managed by Google Cloud services. These roles contain the permissions needed to perform common tasks for each given service. For example, the Pub/Sub Publisher role (roles/pubsub.publisher) provides access to publish messages to a Pub/Sub topic.

Custom roles: Roles that you create that contain only the permissions that you specify. You have complete control over the permissions in these roles. However, they have a higher maintenance burden than predefined roles and there's a limit to the number of custom roles that you can have in your project and in your organization.

Basic roles: Highly permissive roles that provide broad access to Google Cloud services. These roles can be useful for testing purposes, but shouldn't be used in production environments.

For more information about roles and permissions, see Roles and permissions.

## Resources
Most Google Cloud services have their own resources. For example, Compute Engine has resources like instances, disks, and subnetworks.

In IAM, you grant roles on a resource. Granting a principal a role on a resource means that the principal can use the permissions in that role to access the resource.

You can grant roles on a subset of Google Cloud resources. For a full list of resources that you can grant roles on, see Resource types that accept allow policies.

Google Cloud also has several container resources, including projects, folders, and organizations. Granting a principal a role on a container resource gives the principal access the container resource and the resources in that container. This feature lets you use a single role grant to give a principal access to multiple resources, including resources that you can't grant roles on directly. For more information, see Policy inheritance on this page.


## Allow policies
You grant roles to principals using allow policies. In the past, these policies were referred to as IAM policies.

An allow policy is a YAML or JSON object that's attached to a Google Cloud resource.

Each allow policy contains a list of role bindings that associate IAM roles with the principals who are granted those roles.

When an authenticated principal attempts to access a resource, IAM checks the resource's allow policy to determine whether the principal has the required permissions. If the principal is in a role binding that includes a role with the required permissions, then they're allowed to access the resource.

To see examples of allow policies and learn about their structure, see Understanding allow policies.


## Policy inheritance
Google Cloud has container resources—such as projects, folders, and organizations—that let you organize your resources in a parent-child hierarchy. This hierarchy is called the resource hierarchy.

The Google Cloud resource hierarchy has the following structure:

The organization is the root node in the hierarchy.
Folders are children of the organization, or of another folder.
Projects are children of the organization, or of a folder.
Resources for each service are descendants of projects.

If you set an allow policy on a container resource, then the allow policy also applies to all resources in that container. This concept is called policy inheritance, because descendant resources effectively inherit their ancestor resources' allow policies.

Policy inheritance has the following implications:

You can use a single role binding to grant access to multiple resources. If you want to give a principal access to all resources in a container, then grant them a role on the container instead of on the resources in the container.

For example, if you want to let your security administrator manage allow policies for all resources in your organization, then you could grant them the Security Admin role (roles/iam.securityAdmin) on the organization.

You can grant access to resources that don't have their own allow policies. Not all resources accept allow policies, but all resources inherit allow policies from their ancestors. To give a principal access to a resource that can't have its own allow policy, grant them a role on one of the resource's ancestors.

For example, imagine you want to give someone permission to write logs to a log bucket. Log buckets don't have their own allow policies, so to give someone this permission, you can instead grant them the Logs Bucket Writer role (roles/logging.bucketWriter) on the project that contains the log bucket.

To understand who can access a resource, you need to also view all of the allow policies that affect the resource. To get a complete list of the principals that have access to the resource, you need to view the resource's allow policy and the resource's ancestors' allow policies. The union of all of these policies is called the effective allow policy.

## Custom roles
IAM also lets you create custom IAM roles. Custom roles help you enforce the principle of least privilege, because they help to ensure that the principals in your organization have only the permissions that they need.

Custom roles are user-defined, and allow you to bundle one or more supported permissions to meet your specific needs. When you create a custom role, you must choose an organization or project to create it in. You can then grant the custom role on the organization or project, as well as any resources within that organization or project.

You can only grant a custom role within the project or organization in which you created it. You cannot grant custom roles on other projects or organizations, or on resources within other projects or organizations.
