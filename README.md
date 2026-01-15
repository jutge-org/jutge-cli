# Jutge CLI

A command-line interface for interacting with the [Jutge.org](https://jutge.org) platform API. Access your profile, submit solutions, upload problems, manage courses, and more directly from your terminal.

## Key Features

- 💻 Easy interface with Jutge.org API
- 👨‍🏫 Student operations (profile, awards, submissions, courses)
- 🎓 Instructor operations (queries, course management)
- 🔐 Multi-account authentication management
- 🔄 Auto-login with saved credentials
- 📊 Multiple output formats (JSON, YAML, CSV, table, raw)
- 📁 File upload and download support

## Installation

The CLI requires [Bun](https://bun.sh) as a JavaScript runtime.

### Quick Install

```bash
bun install --global @jutge.org/cli
```

Verify the installation:

```bash
jutge --version
```

## Getting Started

### First Time Setup

Login to your Jutge.org account:

```bash
jutge login
```

You'll be prompted for your email and password. Your credentials will be securely stored for future use.

### Basic Usage

```bash
# Get help about available commands
jutge --help

# Explore specific sections
jutge student --help
jutge instructor --help

# View your profile
jutge student profile

# List your courses
jutge student courses list
```

Much more commands are available; use `--help` to explore them.

## Account Management

The CLI supports managing multiple Jutge.org accounts, making it easy to switch between student and instructor roles or different user accounts.

### Managing Accounts

```bash
# List all registered accounts
jutge accounts list

# Add a new account
jutge accounts add -e prof@university.edu professor

# Switch active account
jutge accounts use professor

# Use a specific account for one command
jutge student profile -a professor

# Remove an account
jutge accounts remove professor

# Rename an account
jutge accounts rename professor prof

# View the accounts manual
jutge accounts manual
```

### Saving Passwords

For convenience, you can save the password of the current account locally (stored as base64):

```bash
jutge accounts save-password
```

**Warning:** Passwords are not securely encrypted. Use this feature at your own risk.

### Default Output Format

Set a preferred output format for current account:

```bash
jutge accounts default-format json
```

## Output Formats

The CLI supports multiple output formats for flexibility:

```bash
# JSON format (good for scripting)
jutge student profile --json

# Table format (human-readable)
jutge student courses list --table

# YAML format
jutge student awards list --yaml

# CSV format (for spreadsheets)
jutge instructor queries getCourseProblemSubmissions \
    --course_nm "PRO3_2024" \
    --problem_nm "P68688_ca" \
    --csv

# Raw format (no formatting)
jutge student profile --raw
```

### Working with Files

```bash
# Upload a file (input files are always arguments)
jutge student profile updateAvatar photo.jpg

# Download a file (use -o to specify output name)
jutge student submissions download --submission_id S001 -o my-submission.zip
```

## Advanced Features

### Debug Mode

See the raw API request and response:

```bash
jutge student profile --debug
```

### API Exploration

The CLI structure mirrors the Jutge.org API, making it easy to explore:

```bash
# Get help for any command
jutge student --help
jutge student courses --help
jutge instructor queries --help

# Each endpoint maps to a command
# API: student.profile → CLI: jutge student profile
# API: instructor.queries.getCourseProblemSubmissions →
#      CLI: jutge instructor queries getCourseProblemSubmissions
# See the API documentation for more details:
# https://api.jutge.org
```

## Configuration

Configuration files are stored in platform-specific locations.

### Files

- `credentials.json` - Account credentials and tokens
- `config.yml` - General settings

## Environment Variables

- `JUTGE_API_URL` - Override the default API endpoint (default: `https://api.jutge.org/api`)

Example:

```bash
export JUTGE_API_URL="https://api-dev.jutge.org/api"
jutge student profile
```

## Upgrading

Check for and install updates:

```bash
jutge upgrade
```

## Troubleshooting

### Authentication Issues

If you encounter authentication errors:

```bash
# Logout and login again
jutge logout
jutge login

# Check which account is active
jutge accounts list
```

### Connection Issues

```bash
# Verify the API endpoint
echo $JUTGE_API_URL

# Check if the API is accessible
curl https://api.jutge.org/api/dir
```

### Getting Help

- Use `--help` with any command to see detailed usage
- Check the [Jutge.org documentation](https://api.jutge.org) for API details
- Report issues on the project repository

## Requirements

- [Bun](https://bun.sh) - JavaScript runtime (required)
- Internet connection to access Jutge.org API

## Support

- **Documentation:** Use `jutge <command> --help` for command-specific help
- **API Documentation:** [https://api.jutge.org](https://api.jutge.org)
- **Platform:** [https://jutge.org](https://jutge.org)

## License

Copyright © Jutge.org. All rights reserved.
