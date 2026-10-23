import React, { useEffect } from 'react';
import { BlogPostDetail } from '../BlogPostDetail';
import { blogArticles } from '../../data/blogArticles';

interface PageProps {
  onBackToHome?: () => void;
  onNavigateToPost?: (postId: string) => void;
  onRegisterClick?: () => void;
}

export const TrainingTipsPage: React.FC<PageProps> = ({
  onBackToHome,
  onNavigateToPost,
  onRegisterClick,
}) => {
  const post = blogArticles.find((a) => a.id === 'conquering-the-sand') || blogArticles[0];

  useEffect(() => {
    document.title = `${post.title} — Udupipages Beach Run 2026`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [post]);

  return (
    <BlogPostDetail
      post={post}
      onBackToBlog={() => {
        if (onBackToHome) {
          onBackToHome();
        } else {
          window.location.hash = 'blog-page';
        }
      }}
      onNavigateToPost={(id) => {
        if (onNavigateToPost) {
          onNavigateToPost(id);
        } else {
          window.location.hash = `blog-page-${id}`;
        }
      }}
      onRegisterClick={onRegisterClick}
    />
  );
};
