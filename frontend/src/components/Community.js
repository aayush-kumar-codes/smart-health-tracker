import React, { useState, useEffect } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Button, TextArea, List, ListItem } from 'semantic-ui-react';

const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      content
      comments {
        id
        content
      }
    }
  }
`;

const ADD_POST = gql`
  mutation AddPost($content: String!) {
    addPost(content: $content) {
      id
      content
    }
  }
`;

const ADD_COMMENT = gql`
  mutation AddComment($postId: ID!, $content: String!) {
    addComment(postId: $postId, content: $content) {
      id
      content
    }
  }
`;

const Community = () => {
  const { loading, error, data } = useQuery(GET_POSTS);
  const [addPost] = useMutation(ADD_POST);
  const [addComment] = useMutation(ADD_COMMENT);
  const [postContent, setPostContent] = useState('');
  const [commentContent, setCommentContent] = useState({});

  const handlePostSubmit = async () => {
    if (!postContent.trim()) return;
    try {
      await addPost({ variables: { content: postContent } });
      setPostContent('');
    } catch (err) {
      console.error("Error adding post:", err);
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!commentContent[postId]?.trim()) return;
    try {
      await addComment({ variables: { postId, content: commentContent[postId] } });
      setCommentContent({ ...commentContent, [postId]: '' });
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching posts!</p>;

  return (
    <div>
      <h2>Community Posts</h2>
      <TextArea
        placeholder='Share your progress or tips...'
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
      />
      <Button onClick={handlePostSubmit}>Post</Button>
      <List>
        {data.posts.map(post => (
          <ListItem key={post.id}>
            <p>{post.content}</p>
            <TextArea
              placeholder='Add a comment...'
              value={commentContent[post.id] || ''}
              onChange={(e) => setCommentContent({ ...commentContent, [post.id]: e.target.value })}
            />
            <Button onClick={() => handleCommentSubmit(post.id)}>Comment</Button>
            <List>
              {post.comments.map(comment => (
                <ListItem key={comment.id}>{comment.content}</ListItem>
              ))}
            </List>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default Community;