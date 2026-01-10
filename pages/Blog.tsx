import React from 'react';

const blogPosts = [
  {
    id: 1,
    title: "Top 10 Hidden Gems of 2024",
    excerpt: "We dive deep into the indie scene to find the best movies you might have missed this year.",
    date: "Oct 12, 2024",
    image: "https://picsum.photos/800/400?random=1"
  },
  {
    id: 2,
    title: "The Evolution of CGI in Modern Cinema",
    excerpt: "From Jurassic Park to Avatar: The Way of Water, how technology has changed storytelling.",
    date: "Sep 28, 2024",
    image: "https://picsum.photos/800/400?random=2"
  },
  {
    id: 3,
    title: "Why We Love Anti-Heroes",
    excerpt: "Exploring the psychology behind our fascination with morally gray characters like Walter White and Tony Soprano.",
    date: "Sep 15, 2024",
    image: "https://picsum.photos/800/400?random=3"
  }
];

const Blog: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark pt-24 px-6 md:px-12 pb-12 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center border-b border-gray-800 pb-4">Movie Hub Blog</h1>
        
        <div className="space-y-12">
          {blogPosts.map(post => (
            <article key={post.id} className="bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img src={post.image} alt={post.title} className="h-64 w-full object-cover" />
                </div>
                <div className="p-8 md:w-1/2 flex flex-col justify-center">
                  <div className="text-primary text-sm font-bold uppercase tracking-wide mb-2">Editor's Pick</div>
                  <h2 className="text-2xl font-bold mb-4 hover:text-primary cursor-pointer transition">{post.title}</h2>
                  <p className="text-gray-400 mb-6">{post.excerpt}</p>
                  <div className="flex items-center justify-between mt-auto">
                     <span className="text-gray-500 text-sm">{post.date}</span>
                     <button className="text-white font-medium hover:underline">Read More</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
