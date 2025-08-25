# LINE Message Validator

migrated repos from [milogos/validate-line-message-chrome-extension](https://github.com/milogos/validate-line-message-chrome-extension)

## Prerequisites

- versions

| runtime | version  |
| ------- | -------- |
| node    | v18.12.1 |
| npm     | 8.19.2   |
| yarn    | 1.22.19  |

## Getting Started

First, run the development server:

```bash
yarn install
yarn dev
```

## Token Handling

Tokens used by the validator are sensitive credentials.  To reduce the risk of
unintended exposure, the application stores the token only in
`chrome.storage.session`, which keeps data in memory for the duration of the
extension session and is cleared when the extension closes.  Tokens are never
persisted to disk.  The message body is still saved in `chrome.storage.local`
for convenience.  Users should avoid sharing tokens and should enter them again
for each new session.
