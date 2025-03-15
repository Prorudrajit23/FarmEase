# Supabase Database Setup Guide

This guide will help you set up your Supabase database for the FarmEase application.

## Step 1: Access the SQL Editor

1. Go to your Supabase dashboard at https://app.supabase.com/
2. Select your project (with URL: https://pfrzcecnwgnxvpjhjoqr.supabase.co)
3. In the left sidebar, click on "SQL Editor"
4. Click "New Query" to create a new SQL query

## Step 2: Run the Setup Script

1. Copy the entire contents of the `setup.sql` file in this directory
2. Paste it into the SQL Editor
3. Click "Run" to execute the script

This script will:
- Create the necessary tables (categories, products, profiles)
- Insert sample data for categories and products
- Set up Row Level Security (RLS) policies
- Create a trigger to automatically create a profile when a user signs up

## Step 3: Verify the Setup

After running the script, you can verify that everything is set up correctly:

1. In the left sidebar, click on "Table Editor"
2. You should see the following tables:
   - categories (with 4 entries)
   - products (with 9 entries)
   - profiles (empty until users sign up)

3. Click on each table to view its contents and structure

## Step 4: Test the Connection in the App

1. Go back to your FarmEase application
2. On the home page, click "Show Supabase Connection Test"
3. Click "Test Connection"
4. You should see a success message with the categories listed

## Creating a Seller Account

To create a seller account:

1. Go to your application's signup page (/signup)
2. Fill out the registration form with:
   - Email address
   - Password
   - Select "seller" as the user type
3. Complete the registration process

Alternatively, you can create a user directly in Supabase:

1. In the Supabase dashboard, go to "Authentication" → "Users"
2. Click "Add User" or "Invite" button
3. Enter the email and password for the seller account
4. After creating the user, add a record in the `profiles` table with:
   - The user's ID (from the authentication table)
   - Set `user_type` to "seller"

## Troubleshooting

If you encounter any issues:

1. Check the browser console for error messages
2. Verify that your Supabase URL and anon key are correct in the `.env` file
3. Make sure all tables were created successfully
4. Check that the RLS policies are properly configured

For more help, refer to the [Supabase documentation](https://supabase.com/docs). 