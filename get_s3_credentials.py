#!/usr/bin/env python3
"""
Script to fetch CSC Allas S3 credentials.
Uses clouds.yaml file or environment variables for authentication.

QUICK START:
1. Install dependencies: pip install keystoneauth1 python-keystoneclient pyyaml
2. Download clouds.yaml from CSC Pouta (API Access section)
3. Place clouds.yaml in ~/.config/openstack/clouds.yaml
4. Run: python get_s3_credentials.py
5. Enter your CSC password when prompted
6. Copy the Access Key and Secret Key for your S3 applications

USAGE:
- Endpoint: https://a3s.fi
- Region: regionOne
- Use the credentials in your Python/JS code with boto3 or AWS SDK
"""

import ast
import json
import os
from typing import Any, Dict, List, Optional

import yaml
from keystoneauth1 import session
from keystoneauth1.identity import v3
from keystoneclient.v3 import client as keystone_client


def parse_credential_blob(blob_str: str) -> Dict[str, Any]:
    """Safely parse credential blob string"""
    if not blob_str:
        return {}

    try:
        # Try JSON first
        return json.loads(blob_str)
    except (json.JSONDecodeError, TypeError):
        try:
            # If JSON fails, try ast.literal_eval (safe eval)
            return ast.literal_eval(blob_str)
        except (ValueError, SyntaxError):
            # If nothing works, return empty dict
            print(f"Warning: Could not parse credential blob: {blob_str}")
            return {}


def load_clouds_config() -> Optional[Dict[str, Any]]:
    """Load clouds.yaml file"""
    config_paths = [
        os.path.expanduser("~/.config/openstack/clouds.yaml"),
        os.path.expanduser("~/clouds.yaml"),
        "./clouds.yaml",
    ]

    for path in config_paths:
        if os.path.exists(path):
            with open(path, "r") as f:
                config = yaml.safe_load(f)
                return config.get("clouds", {}).get("openstack", {})

    return None


def get_session_from_config(cloud_config: Dict[str, Any]) -> session.Session:
    """Create session from clouds.yaml config"""
    auth_config = cloud_config.get("auth", {})

    # Check that required fields exist
    auth_url = auth_config.get("auth_url")
    username = auth_config.get("username")
    project_id = auth_config.get("project_id")

    if not all([auth_url, username, project_id]):
        raise ValueError("Missing required auth fields from clouds.yaml")

    # Ask for password if not in config
    password = auth_config.get("password")
    if not password:
        import getpass

        password = getpass.getpass(f"Password for {username}: ")

    auth = v3.Password(
        auth_url=str(auth_url),  # Ensure it's a string
        username=str(username),
        password=password,
        project_id=str(project_id),
        user_domain_name=auth_config.get("user_domain_name", "Default"),
    )

    return session.Session(auth=auth)


def get_session_from_env() -> session.Session:
    """Create session from environment variables"""
    # Check that required environment variables exist
    auth_url = os.getenv("OS_AUTH_URL")
    username = os.getenv("OS_USERNAME")
    project_id = os.getenv("OS_PROJECT_ID")

    if not all([auth_url, username, project_id]):
        raise ValueError("Missing required environment variables")

    # Ask for password if not in environment variable
    password = os.getenv("OS_PASSWORD")
    if not password:
        import getpass

        password = getpass.getpass(f"Password for {username}: ")

    auth = v3.Password(
        auth_url=str(auth_url),
        username=str(username),
        password=password,
        project_id=str(project_id),
        user_domain_name=os.getenv("OS_USER_DOMAIN_NAME", "Default"),
    )

    return session.Session(auth=auth)


def list_s3_credentials(sess: session.Session) -> List[Any]:
    """List existing S3 credentials"""
    keystone = keystone_client.Client(session=sess)

    try:
        credentials_response = keystone.credentials.list()
        if credentials_response is None:
            return []
        # Convert response to list if it has a data attribute, otherwise try to iterate directly
        credentials = (
            getattr(credentials_response, "data", credentials_response)
            if hasattr(credentials_response, "data")
            else list(credentials_response) # type: ignore
        )
        # Filter for EC2 credentials (S3 credentials)
        ec2_creds = [
            cred for cred in credentials if hasattr(cred, "type") and cred.type == "ec2" # type: ignore
        ]  # type: ignore
        return ec2_creds
    except Exception as e:
        print(f"Error fetching credentials: {e}")
        return []


def create_s3_credentials(sess: session.Session) -> Optional[Any]:
    """Create new S3 credentials"""
    keystone = keystone_client.Client(session=sess)

    try:
        # Create new EC2 credentials (S3 credentials)
        # Use keystone API to create EC2 credentials
        user_id = sess.get_user_id()
        project_id = sess.get_project_id()

        # EC2 credentials are created automatically when calling create method
        credential = keystone.credentials.create(
            user=user_id,
            type="ec2",
            project=project_id,
            blob="{}",  # Empty JSON blob, Keystone fills automatically
        )

        return credential
    except Exception as e:
        print(f"Error creating credentials: {e}")
        return None


def main():
    """Main function"""
    print("CSC Allas S3 Credentials Fetcher")
    print("=" * 35)

    # Try clouds.yaml first
    cloud_config = load_clouds_config()

    if cloud_config:
        print("Using clouds.yaml file...")
        sess = get_session_from_config(cloud_config)
    elif all(os.getenv(var) for var in ["OS_AUTH_URL", "OS_USERNAME", "OS_PROJECT_ID"]):
        print("Using environment variables...")
        sess = get_session_from_env()
    else:
        print("ERROR: No clouds.yaml or environment variables found!")
        print("\nYou need either:")
        print("1. clouds.yaml file in ~/.config/openstack/ directory")
        print("2. Or these environment variables:")
        print("   - OS_AUTH_URL")
        print("   - OS_USERNAME")
        print("   - OS_PROJECT_ID")
        print("   - OS_USER_DOMAIN_NAME")
        return

    try:
        # Test connection
        print(f"Logging into project: {sess.get_project_id()}")

        # List existing credentials
        print("\nSearching for existing S3 credentials...")
        existing_creds = list_s3_credentials(sess)

        if existing_creds:
            print(f"Found {len(existing_creds)} existing credential(s):")
            for i, cred in enumerate(existing_creds, 1):
                if hasattr(cred, "blob"):
                    blob = parse_credential_blob(cred.blob)
                    print(f"\n{i}. Credential ID: {cred.id}")
                    print(f"   Access Key: {blob.get('access', 'N/A')}")
                    print(f"   Secret Key: {blob.get('secret', 'N/A')}")
                    if not blob:
                        print(f"   Raw blob: {cred.blob}")
                else:
                    print(f"\n{i}. Credential ID: {getattr(cred, 'id', 'Unknown')}")
                    print("   Warning: Could not access credential data")

        else:
            print("No existing credentials found.")
            print("Creating new ones...")

            new_cred = create_s3_credentials(sess)
            if new_cred and hasattr(new_cred, "blob"):
                blob = parse_credential_blob(new_cred.blob)
                print(f"\n✅ New S3 credentials created!")
                print(f"Access Key: {blob.get('access', 'N/A')}")
                print(f"Secret Key: {blob.get('secret', 'N/A')}")
                if not blob:
                    print(f"Credential ID: {getattr(new_cred, 'id', 'Unknown')}")
                    print(f"Raw blob: {getattr(new_cred, 'blob', 'N/A')}")
            elif new_cred:
                print(f"\n✅ New S3 credentials created!")
                print(f"Credential ID: {getattr(new_cred, 'id', 'Unknown')}")
                print("Note: Could not parse credential data automatically")
            else:
                print("❌ Credential creation failed!")
                return

        # Print usage instructions
        print(f"\n" + "=" * 50)
        print("USAGE INSTRUCTIONS:")
        print("=" * 50)
        print("Use these credentials in Python/JS code:")
        print(f"Endpoint: https://a3s.fi")
        print(f"Region: regionOne")

        # If there were existing credentials, show the latest
        if existing_creds:
            latest_cred = existing_creds[-1]
            if hasattr(latest_cred, "blob"):
                blob = parse_credential_blob(latest_cred.blob)
                print(f"\nLatest credential:")
                print(f"Access Key: {blob.get('access', 'N/A')}")
                print(f"Secret Key: {blob.get('secret', 'N/A')}")
            else:
                print(f"\nLatest credential:")
                print(f"Credential ID: {getattr(latest_cred, 'id', 'Unknown')}")

    except Exception as e:
        print(f"ERROR: {e}")


if __name__ == "__main__":
    main()
