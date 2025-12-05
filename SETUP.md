# Database Setup Guide

## 1. Install PostgreSQL

Since you are on a Mac, the easiest way is to use **Postgres.app**.

1.  Download **Postgres.app** from [https://postgresapp.com/](https://postgresapp.com/).
2.  Move it to your `Applications` folder and open it.
3.  Click **"Initialize"** to create a new server.
4.  Ensure the server is **Running**.

## 2. Create the Database

1.  Open Postgres.app and double-click the database icon (usually named after your user) to open a terminal window (`psql`).
2.  Run the following command to create the database:
    ```sql
    CREATE DATABASE prompt_catalog;
    ```
3.  (Optional) If you want to use a specific user/password, create them now. Otherwise, Postgres.app uses your macOS username and no password by default.

## 3. Configure Environment Variables

1.  Copy the example environment file:
    ```bash
    cp server/.env.example server/.env
    ```
2.  Open `server/.env` and update the settings.
    *   **If using Postgres.app default:**
        *   `DB_USER`: Your macOS username (run `whoami` in terminal to check)
        *   `DB_PASSWORD`: Leave empty or remove the line
        *   `DB_HOST`: `localhost`
        *   `DB_NAME`: `prompt_catalog`

## 4. Seed the Database

Run the following command in the root directory of the project to create tables and add initial data:

```bash
cd server
npm run seed
```

## 5. Run the Application

Return to the root directory and start the app:

```bash
cd ..
npm run dev
```
