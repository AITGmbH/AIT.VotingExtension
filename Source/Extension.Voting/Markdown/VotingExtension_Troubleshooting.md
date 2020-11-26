
# Build and publish

## npm run publish-debug-package fails after enter personal access token

    error: TypeError [ERR_INVALID_ARG_TYPE]: The "data" argument...


As a workaround, it is possible to build and publish in two steps.

    npm run build-prod
    npm run gallery-publish false

To get a deeper understanding about building and publishing see 'package.json'.