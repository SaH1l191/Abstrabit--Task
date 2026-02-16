# Smart Bookmark App

A modern bookmark management application built with Next.js, Supabase, and Tailwind CSS.

## Features

- **Google Authentication**: Secure sign-in with Google OAuth
- **Private Bookmarks**: Each user has their own private bookmark collection
- **Real-time Updates**: Bookmarks sync in real-time across devices
- **Tag System**: Organize bookmarks with custom tags
- **Search Functionality**: Quickly find bookmarks by title, URL, description, or tags
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean and intuitive interface with smooth animations

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Realtime)
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

1. A Supabase project (create one at [supabase.com](https://supabase.com))
2. Node.js 18+ installed

### Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <your-repo>
   cd smart-bookmark-app
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Configure Supabase**:
   - Go to your Supabase project dashboard
   - Navigate to Authentication → Providers
   - Enable Google provider and configure OAuth credentials
   - Add your redirect URL: `https://your-domain.com/auth/callback`

4. **Set up database schema**:
   - Go to the SQL Editor in your Supabase dashboard
   - Run the SQL commands from `database/schema.sql`

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Database Schema

The app uses a single `bookmarks` table with the following structure:

```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Features in Detail

### Authentication
- Google OAuth integration
- Secure session management
- Automatic redirect after login

### Bookmark Management
- Add bookmarks with title, URL, description, and tags
- Delete bookmarks with confirmation
- Real-time synchronization across devices
- Search and filter functionality

### User Interface
- Responsive grid layout
- Smooth animations and transitions
- Loading states and error handling
- Modern design with Tailwind CSS

## Performance Optimizations

- **React.memo**: Used in components to prevent unnecessary re-renders
- **Debounced Search**: Search input is debounced to reduce API calls
- **Lazy Loading**: Components load data only when needed
- **Optimistic Updates**: UI updates immediately with rollback on error
- **Real-time Subscriptions**: Efficient real-time updates using Supabase channels

## Deployment

### Vercel Deployment

1. **Push your code to GitHub**
2. **Connect your repository to Vercel**
3. **Set environment variables in Vercel dashboard**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy!**

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
