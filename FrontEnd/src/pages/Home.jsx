import React from 'react';
import Header from '../components/Header';
import VideoGrid from '../components/VideoGrid';

function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Trending Videos</h2>
        <VideoGrid />
      </main>
    </div>
  );
}

export default Home;
