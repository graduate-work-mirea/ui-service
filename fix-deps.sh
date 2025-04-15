#!/bin/sh

# Install required dependencies
npm install --save react-router-dom
npm install --save-dev @types/react-router-dom

# Fix any potential dependency issues
npm install

# Build the application
npm run build 