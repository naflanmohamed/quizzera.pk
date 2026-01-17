# Quizzera Deployment Guide

This guide outlines the steps to deploy your Quizzera MERN stack application. We will use:

- **MongoDB Atlas** for the database.
- **Render** for the backend (Node.js/Express).
- **Vercel** for the frontend (React/Vite).

## 1. Database Deployment (MongoDB Atlas)

If you haven't already:

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a free cluster (M0 Sandbox).
3.  Create a database user (username/password) in "Database Access".
4.  Allow access from anywhere (`0.0.0.0/0`) in "Network Access".
5.  Get your connection string (Driver: Node.js > 2.2.12 or later). It will look like:
    `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
    _Save this for the backend step._

## 2. Backend Deployment (Render)

We will deploy the `server` directory to Render.

1.  Push your code to GitHub if you haven't already.
2.  Go to [Render Dashboard](https://dashboard.render.com/).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Configuration**:
    - **Name**: `quizzera-server` (or similar)
    - **Root Directory**: `server`
    - **Environment**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
    - **Plan**: Free
6.  **Environment Variables** (Advanced section):
    Add the following keys and values:
    | Key | Value | Description |
    | :--- | :--- | :--- |
    | `NODE_ENV` | `production` | Optimizes performance |
    | `MONGO_URI` | _Your MongoDB Connection String_ | From Step 1 |
    | `JWT_SECRET` | _A long random string_ | Used for signing tokens |
    | `JWT_EXPIRE` | `30d` | Token expiration time |
    | `CLIENT_URL` | _Your Frontend URL_ | We will update this later after deploying frontend. For now, you can put `*` or leave it empty if you want to test. (Ideally, update it to your Vercel URL later to secure CORS). |

7.  Click **Create Web Service**.
8.  Wait for the deployment to finish. **Copy the URL** provided by Render (e.g., `https://quizzera-server.onrender.com`).

## 3. Frontend Deployment (Vercel)

We will deploy the `client` directory to Vercel.

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configure Project**:
    - **Root Directory**: Click the `Edit` button and select `client`.
    - **Framework Preset**: Vite (should be auto-detected).
    - **Build Command**: `npm run build` (or `tsc -b && vite build`) - _Default is usually fine_.
    - **Output Directory**: `dist` - _Default is usually fine_.
5.  **Environment Variables**:
    Add the following:
    | Key | Value | Description |
    | :--- | :--- | :--- |
    | `VITE_API_URL` | `https://quizzera-server.onrender.com/api` | **IMPORTANT**: Append `/api` to your Render backend URL. |

6.  Click **Deploy**.
7.  Wait for the build to complete. You will get a live URL (e.g., `https://quizzera.vercel.app`).

## 4. Final Configuration

1.  Go back to your **Render Dashboard** -> `quizzera-server` -> **Environment**.
2.  Update `CLIENT_URL` to your new Vercel URL (e.g., `https://quizzera.vercel.app`) to properly configure CORS.
3.  **Redeploy** the backend (Manual Deploy -> Deploy latest commit) for `CLIENT_URL` to take effect.

## Troubleshooting

- **CORS Issues**: If you see CORS errors in the browser console, double-check that `CLIENT_URL` in Render matches your Vercel URL exactly (no trailing slash usually preferred, unless your code handles it).
- **API Connection**: If login fails or data doesn't load, check the Network tab. If requests go to `localhost`, you didn't set `VITE_API_URL` correctly in Vercel. **Note**: You might need to Redeploy the frontend in Vercel after adding environment variables if you added them _after_ the initial build.
- **White Screen**: Check the console for errors. It might be a routing issue. Vercel automatically handles client-side routing for Vite, so a `vercel.json` is usually not required, but if you have issues, ensure your redirects are correct.
