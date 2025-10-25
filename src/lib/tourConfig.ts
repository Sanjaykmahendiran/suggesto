export const tourConfigs: Record<string, { id: string; steps: any[] }> = {

  home: {
    id: "home",
    steps: [
      {
        title: "Welcome to Home!",
        message: "This is your main hub where you can discover movies, manage your watchlist, and connect with friends. Let's explore the key features together!",
        position: "bottom",
        animation: "sparkle"
      },
      {
        target: "pro-icon",
        title: "Go Premium",
        message: "Tap here to explore exclusive features and unlock the full experience with Pro access.",
        position: "bottom",
        highlight: "bounce",
      },

      {
        target: "pull-refresh-zone",
        title: "Pull to Refresh ↓",
        message: "Long press and pull down in this area to refresh your content!",
        position: "bottom",
        highlight: "bounce",
      },
    ],
  },

  watchlist: {
    id: "watchlist",
    steps: [
      {

        title: "Welcome to Your Movie Hub! 🎬",
        message: "Keep track of movies you want to watch and get personalized suggestions.",
        position: "bottom",
        highlight: "glow",
      },
      {
        target: "search-button",
        title: "Quick Search",
        message: "Quickly find movies in your watchlist with our powerful search feature.",
        position: "bottom",
        highlight: "pulse",
      },
      {
        target: "list-toggle",
        title: "Switch Views",
        message: "Switch between card stack and grid view to browse your movies your way!",
        position: "bottom",
        highlight: "bounce",
      },
      {
        target: "filter-button",
        title: "Smart Filters",
        message: "Filter your movies by genre, rating, year, and more.",
        position: "bottom",
        highlight: "shake",
      },
      {
        target: "movie-count",
        title: "Movie Counter",
        message: "See how many movies you've added to your watchlist!",
        position: "left",
        highlight: "scale",
      },
      {
        target: "movie-cards",
        title: "Interactive Cards",
        message: "Swipe left to skip, swipe right or tap to watch!",
        position: "top",
        highlight: "glow",
      },
      {
        target: "genie-button",
        title: "AI Suggestions ✨",
        message: "Get AI-powered movie recommendations!",
        position: "top",
        highlight: "sparkle",
      },
      {
        target: "add-button",
        title: "Add Movies",
        message: "Add new movies to your watchlist!",
        position: "top",
        highlight: "pulse",
      },
    ],
  },

  watchRoom: {
    id: "watchRoom",
    steps: [
      {
        title: "Watch Room Hub 🍿",
        message: "Create and join watch rooms to enjoy movies with friends!",
        position: "bottom",
        highlight: "glow",
      },
      {
        target: "room-list",
        title: "Your Watch Rooms",
        message: "View all your created and joined watch rooms here.",
        position: "bottom",
        highlight: "slide",
      },
      {
        target: "room-card",
        title: "Room Details",
        message: "Tap any room to view details, members, and suggested movies.",
        position: "bottom",
        highlight: "scale",
      },
      {
        target: "room-stats",
        title: "Room Statistics",
        message: "View member count and number of suggested movies.",
        position: "top",
        highlight: "bounce",
      },
      {
        target: "create-room-button",
        title: "Create New Room ➕",
        message: "Tap here to create a new watch room and invite friends!",
        position: "top",
        highlight: "sparkle",
      },
    ],
  },

  roomDetail: {
    id: "roomDetail",
    steps: [
      {
        title: "Watch Room Details 🍿",
        message: "Manage your movie watch room and plan viewing sessions with friends!",
        position: "bottom",
        highlight: "glow",
      },
      {
        target: "room-info-card",
        title: "Room Information",
        message: "View room details, member count, and movie statistics.",
        position: "bottom",
        highlight: "slide",
      },
      {
        target: "edit-room-name",
        title: "Edit Room Name ✏️",
        message: "Room creators can edit the room name anytime.",
        position: "bottom",
        highlight: "bounce",
      },
      {
        target: "room-settings",
        title: "Room Management ⚙️",
        message: "Creators can manage members and room settings.",
        position: "bottom",
        highlight: "shake",
      },
      {
        target: "delete-room",
        title: "Delete Room 🗑️",
        message: "Room creators can permanently delete the watch room.",
        position: "bottom",
        highlight: "scale",
      },
      {
        target: "leave-room",
        title: "Leave Room 🚪",
        message: "Members can leave the room if they no longer want to participate.",
        position: "bottom",
        highlight: "pulse",
      },
      {
        target: "movie-tabs",
        title: "Movie Categories",
        message: "Switch between planned movies and already watched movies.",
        position: "bottom",
        highlight: "slide",
      },
      {
        target: "planned-movies",
        title: "Planned Movies 📋",
        message: "Movies the group plans to watch together.",
        position: "top",
        highlight: "glow",
      },
      {
        target: "watched-movies",
        title: "Watched Movies ✅",
        message: "Movies the group has already watched and discussed.",
        position: "top",
        highlight: "sparkle",
      },
      {
        target: "movie-grid",
        title: "Movie Collection",
        message: "Browse and tap movies to view details or mark as watched.",
        position: "top",
        highlight: "pulse",
      },
      {
        target: "add-movie-button",
        title: "Add Movies ➕",
        message: "Add new movies to your watch room for group viewing.",
        position: "top",
        highlight: "scale",
      },
    ],
  },

  suggest: {
    id: "suggest",
    steps: [
      {
        title: "Movie Suggestions Hub 🎬",
        message: "Discover, share, and manage movie suggestions with friends!",
        position: "bottom",
        highlight: "glow",
      },
      {
        target: "main-tabs",
        title: "Suggestions & Requests",
        message: "Switch between movie suggestions and friend requests.",
        position: "bottom",
        highlight: "slide",
      },
      {
        target: "sub-filter-tabs",
        title: "Filter Options",
        message: "View received or sent suggestions and requests.",
        position: "bottom",
        highlight: "bounce",
      },
      // {
      //   target: "suggestion-card",
      //   title: "Interactive Suggestions",
      //   message: "Tap on pending suggestions to view details and take action.",
      //   position: "top",
      //   highlight: "glow",
      // },
      // {
      //   target: "suggestion-stats",
      //   title: "Track Performance",
      //   message: "See how many friends viewed and accepted your suggestions.",
      //   position: "top",
      //   highlight: "scale",
      // },
      // {
      //   target: "boost-button",
      //   title: "Boost Suggestions ⚡",
      //   message: "Premium users can boost suggestions for better visibility!",
      //   position: "top",
      //   highlight: "sparkle",
      // },
      {
        target: "floating-action-menu",
        title: "Quick Actions",
        message: "Tap to suggest movies or request recommendations from friends.",
        position: "top",
        highlight: "pulse",
      },
    ],
  },

  suggestedMovieDetail: {
    id: "suggestedMovieDetail",
    steps: [
      {
        title: "Movie Suggestion Details 🎬",
        message: "Review the movie your friend suggested just for you!",
        position: "bottom",
        highlight: "glow",
      },
      {
        target: "movie-poster",
        title: "Movie Poster",
        message: "Tap the play button to watch the trailer if available.",
        position: "bottom",
        highlight: "bounce",
      },
      {
        target: "movie-info",
        title: "Movie Information",
        message: "View title, release year, rating, and genre details.",
        position: "bottom",
        highlight: "slide",
      },
      {
        target: "movie-overview",
        title: "Plot Overview",
        message: "Read the movie synopsis. Tap 'more' to expand full description.",
        position: "bottom",
        highlight: "shake",
      },
      {
        target: "suggestion-info",
        title: "Suggestion Details",
        message: "See who suggested this movie and any personal note they added.",
        position: "bottom",
        highlight: "glow",
      },
      {
        target: "accept-suggestion",
        title: "Add to Watchlist ✅",
        message: "Accept the suggestion and add it to your personal watchlist.",
        position: "top",
        highlight: "sparkle",
      },
      {
        target: "reject-suggestion",
        title: "Decline Suggestion ❌",
        message: "Politely decline if the movie isn't for you.",
        position: "top",
        highlight: "shake",
      },

    ],
  },

  friends: {
    id: "friends",
    steps: [
      {
        title: "Your Social Network 👥",
        message: "Manage your movie-loving friends and discover new connections!",
        position: "bottom",
        highlight: "glow",
      },
      {
        target: "search-friends",
        title: "Search Friends",
        message: "Quickly find friends by name or interests.",
        position: "bottom",
        highlight: "shake",
      },
      {
        target: "friends-tabs",
        title: "Friend Categories",
        message: "Browse friends, requests, suggestions, and starred connections.",
        position: "bottom",
        highlight: "slide",
      },
      {
        target: "friend-card",
        title: "Friend Profiles",
        message: "Tap any friend to view their profile and movie preferences.",
        position: "top",
        highlight: "glow",
      },
      {
        target: "add-friends-button",
        title: "Add New Friends",
        message: "Search and connect with new movie enthusiasts.",
        position: "top",
        highlight: "scale",
      },
    ],
  },

  top10wall: {
    id: "top10wall",
    steps: [
      {
        title: "Welcome to Top 10 Wall!",
        message: "This is your personalized top 10 movies wall where you can rank your favorite movies and share with friends!",
        position: "bottom",
        animation: "sparkle"
      },
      {
        target: "saved-top10-link",
        title: "Saved Top 10 Lists",
        message: "View and manage your saved top 10 lists from other users here.",
        position: "bottom",
        highlight: "bounce",
      },
      {
        target: "podium-section",
        title: "Top 3 Podium",
        message: "Your top 3 movies are displayed here in podium style. Click on any position to add or change movies!",
        position: "bottom",
        highlight: "bounce",
      },
      {
        target: "podium-position-1",
        title: "Add Your #1 Movie",
        message: "Click on this position to add your favorite movie to the #1 spot! A movie selection modal will open.",
        position: "bottom",
        highlight: "bounce",
        action: "click"
      },
      {
        target: "ranking-list",
        title: "Complete Rankings",
        message: "View your complete top 10 list here. Click on any position to update your rankings!",
        position: "bottom",
        highlight: "bounce",
      },
      {
        target: "ranking-item-4",
        title: "Add Movies to Rankings",
        message: "Click on any ranking position to add or change movies. You can build your complete top 10 list!",
        position: "bottom",
        highlight: "bounce",
        action: "click"
      },
      {
        target: "mock-data-notice",
        title: "Getting Started",
        message: "This sample data shows you how your wall will look. Click on any position to add your own movies!",
        position: "bottom",
        highlight: "bounce",
      }
    ]
  },

  movieDetail: {
  id: "movieDetail",
  steps: [
    {
      title: "Movie Details",
      message: "This is your movie detail page where you can view comprehensive information about movies, manage your watchlist, and interact with content.",
      position: "bottom",
      animation: "sparkle"
    },
    {
      target: "share-button",
      title: "Share Movie",
      message: "Share this movie with your friends and social networks.",
      position: "bottom",
      highlight: "bounce",
    },
    // {
    //   target: "play-button",
    //   title: "Watch Trailer",
    //   message: "Tap to watch the movie trailer or promotional video.",
    //   position: "bottom",
    //   highlight: "bounce",
    // },
    {
      target: "overview-section",
      title: "Movie Overview",
      message: "Read the movie synopsis. Tap 'more' to expand the full description.",
      position: "bottom",
      highlight: "bounce",
    },
    {
      target: "delete-button",
      title: "Remove Movie",
      message: "Tap here to remove this movie from your watchlist or watchroom.",
      position: "bottom",
      highlight: "bounce",
    },
    {
      target: "main-action-button",
      title: "Primary Action",
      message: "This is your main action button - add to watchlist, mark as watched, or other relevant actions.",
      position: "top",
      highlight: "bounce",
    },
    {
      target: "favorite-button",
      title: "Add to Favorites",
      message: "Tap the heart icon to add this movie to your favorites and earn coins!",
      position: "top",
      highlight: "bounce",
    },
  ],
}

}
