# FarmEase

FarmEase is a modern web application that connects farmers directly with consumers, facilitating the sale and rental of farming equipment and products.

## Features

- User authentication and authorization
- Product listing and management
- Equipment rental system with date-based pricing
- Shopping cart functionality
- Secure payment processing
- Email notifications for orders
- Responsive design for all devices

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase
- **Email Service**: EmailJS
- **Build Tool**: Vite

## Project Structure

```
farmease/
├── src/                  # Source code
│   ├── components/       # React components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Third-party integrations
│   ├── pages/            # Page components
│   ├── services/         # Service layer
│   ├── styles/           # Global styles
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
│   ├── videos/           # Video assets
│   └── email-template.html  # Email template
├── database/             # Database related files
│   └── sql/              # SQL migration files
├── docs/                 # Documentation
├── scripts/              # Setup and utility scripts
├── supabase/             # Supabase configuration
└── tests/                # Test files
```

## Getting Started

### Quick Setup

Run the setup script to automatically install dependencies and create necessary configuration files:

```bash
npm run setup
```

This script will:
1. Create a `.env` file from `.env.example` if it doesn't exist
2. Install all dependencies
3. Guide you through the next steps

### Manual Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/farmease.git
cd farmease
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy the `.env.example` file to a new file named `.env`
   - Fill in your own values for each environment variable
```bash
cp .env.example .env
# Now edit the .env file with your own values
```

4. Start the development server:
```bash
npm run dev
```

## Common Setup Issues and Solutions

### Environment Variables
- Make sure all environment variables in the `.env` file are properly set
- If you encounter authentication errors with Supabase or EmailJS, verify your API keys

### Node.js Version
- This project requires Node.js version 18 or higher
- If you encounter dependency issues, try using `nvm` to switch to the correct Node version:
```bash
nvm use 18
```

### Package Installation Issues
- If you encounter issues with package installation, try clearing npm cache:
```bash
npm cache clean --force
npm install
```

### Supabase Setup
- Make sure your Supabase project is properly set up with the required tables
- Check the database schema in the `database/sql` directory for reference

## Database Setup

1. Install Supabase CLI
2. Navigate to the `supabase` directory
3. Run the setup script:
```bash
supabase db reset
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.io/) for the backend infrastructure
- [EmailJS](https://www.emailjs.com/) for email services

## Deployment

You can deploy this project using any hosting service that supports Node.js applications. Some popular options include:

- Vercel
- Netlify
- Heroku
- DigitalOcean
- AWS

For detailed deployment instructions, check the documentation of your preferred hosting service.
