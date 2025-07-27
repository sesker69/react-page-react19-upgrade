import React, { useTransition, Suspense, useState } from 'react';

// React 19 hooks - using type assertion for compatibility
const useHook =
  (React as any).use ||
  ((promise: Promise<any>) => {
    throw promise; // This will trigger Suspense boundary
  });
const useOptimistic =
  (React as any).useOptimistic ||
  ((state: any, updater: any) => [state, (action: any) => {}]);
const useActionState =
  (React as any).useActionState ||
  ((action: any, initialState: any) => [initialState, action]);
import type { Value } from '@react-page/editor';
import Editor from '@react-page/editor';
import slate from '@react-page/plugins-slate';
import PageLayout from '../../components/PageLayout';

// Simulated API functions
const fetchUserData = async (
  userId: string
): Promise<{ id: string; name: string; email: string }> => {
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 2000 + 500)
  );
  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
  };
};

const submitComment = async (
  formData: FormData
): Promise<{ id: string; text: string; timestamp: Date }> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (Math.random() < 0.1) {
    throw new Error('Failed to submit comment');
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    text: formData.get('comment') as string,
    timestamp: new Date(),
  };
};

// Data cache for demonstration
const userCache = new Map<
  string,
  Promise<{ id: string; name: string; email: string }>
>();

const getUserData = (userId: string) => {
  if (!userCache.has(userId)) {
    userCache.set(userId, fetchUserData(userId));
  }
  return userCache.get(userId)!;
};

// React 19: Component using use() hook for async data
const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const userData = useHook(getUserData(userId));

  return (
    <div
      style={{
        padding: 16,
        border: '1px solid #ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        marginBottom: 16,
      }}
    >
      <h3>User Profile</h3>
      <p>
        <strong>ID:</strong> {userData.id}
      </p>
      <p>
        <strong>Name:</strong> {userData.name}
      </p>
      <p>
        <strong>Email:</strong> {userData.email}
      </p>
    </div>
  );
};

// React 19: Optimistic comment system
const CommentSystem: React.FC = () => {
  type Comment = {
    id: string;
    text: string;
    timestamp: Date;
    status: 'pending' | 'success' | 'error';
  };

  const [comments, setComments] = useState<Comment[]>([]);
  const [isPending, startTransition] = useTransition();

  // React 19: useOptimistic for optimistic updates
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (currentComments: Comment[], newComment: Comment) => [
      ...currentComments,
      newComment,
    ]
  );

  // React 19: useActionState for form handling
  const [state, formAction] = useActionState(
    async (prevState: any, formData: FormData) => {
      const commentText = formData.get('comment') as string;

      if (!commentText.trim()) {
        return { success: false, message: 'Comment cannot be empty' };
      }

      const optimisticComment: Comment = {
        id: Math.random().toString(36).substr(2, 9),
        text: commentText,
        timestamp: new Date(),
        status: 'pending',
      };

      // Add optimistic comment
      addOptimisticComment(optimisticComment);

      try {
        const result = await submitComment(formData);

        // Update with actual result
        setComments((prev) => [
          ...prev.filter((c) => c.id !== optimisticComment.id),
          { ...result, status: 'success' as const },
        ]);

        return { success: true, message: 'Comment submitted successfully!' };
      } catch (error) {
        // Remove optimistic comment on error
        setComments((prev) =>
          prev.filter((c) => c.id !== optimisticComment.id)
        );

        return {
          success: false,
          message:
            error instanceof Error ? error.message : 'Failed to submit comment',
        };
      }
    },
    { success: null, message: '' }
  );

  return (
    <div
      style={{
        padding: 16,
        border: '1px solid #ddd',
        borderRadius: 8,
        marginBottom: 16,
      }}
    >
      <h3>Comment System (React 19 Features)</h3>

      <form action={formAction} style={{ marginBottom: 16 }}>
        <textarea
          name="comment"
          placeholder="Write your comment..."
          rows={3}
          style={{ width: '100%', marginBottom: 8, padding: 8 }}
          disabled={isPending}
        />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Submitting...' : 'Submit Comment'}
        </button>
      </form>

      {state.message && (
        <div
          style={{
            padding: 8,
            backgroundColor: state.success ? '#d4edda' : '#f8d7da',
            color: state.success ? '#155724' : '#721c24',
            border: `1px solid ${state.success ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: 4,
            marginBottom: 16,
          }}
        >
          {state.message}
        </div>
      )}

      <div>
        <h4>Comments ({optimisticComments.length}):</h4>
        {optimisticComments.length === 0 ? (
          <p style={{ color: '#666' }}>No comments yet.</p>
        ) : (
          optimisticComments.map((comment: Comment) => (
            <div
              key={comment.id}
              style={{
                padding: 12,
                backgroundColor:
                  comment.status === 'pending' ? '#fff3cd' : '#ffffff',
                border: `1px solid ${comment.status === 'pending' ? '#ffeaa7' : '#ddd'}`,
                borderRadius: 4,
                marginBottom: 8,
                opacity: comment.status === 'pending' ? 0.7 : 1,
              }}
            >
              <p style={{ margin: 0, marginBottom: 8 }}>{comment.text}</p>
              <small style={{ color: '#666' }}>
                {comment.status === 'pending'
                  ? 'Submitting...'
                  : comment.timestamp.toLocaleString()}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// React 19: Enhanced Suspense boundaries
const AsyncDataSection: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState('1');

  return (
    <div
      style={{
        padding: 16,
        border: '1px solid #ddd',
        borderRadius: 8,
        marginBottom: 16,
      }}
    >
      <h3>Async Data with Suspense (React 19)</h3>

      <div style={{ marginBottom: 16 }}>
        <label>
          Select User:
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            style={{ marginLeft: 8, padding: 4 }}
          >
            <option value="1">User 1</option>
            <option value="2">User 2</option>
            <option value="3">User 3</option>
          </select>
        </label>
      </div>

      <Suspense
        fallback={
          <div
            style={{
              padding: 32,
              textAlign: 'center',
              backgroundColor: '#f8f9fa',
              border: '1px dashed #dee2e6',
              borderRadius: 4,
            }}
          >
            <p>Loading user data...</p>
            <div
              style={{
                width: 20,
                height: 20,
                border: '2px solid #007bff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }}
            />
          </div>
        }
      >
        <UserProfile userId={selectedUserId} />
      </Suspense>
    </div>
  );
};

const cellPlugins = [slate()];

const SAMPLE_VALUE: Value = {
  id: 'react19-demo',
  rows: [
    {
      id: 'intro-row',
      cells: [
        {
          id: 'intro-cell',
          size: 12,
          plugin: {
            id: 'ory/editor/core/content/slate',
            version: 1,
          },
          dataI18n: {
            default: {
              slate: [
                {
                  type: 'HEADINGS/HEADING-ONE',
                  children: [{ text: 'React 19 Features Demo' }],
                },
                {
                  type: 'PARAGRAPH/PARAGRAPH',
                  children: [
                    {
                      text: 'This example demonstrates key React 19 features including the use() hook for async data fetching, useOptimistic for optimistic updates, useActionState for form handling, and enhanced Suspense boundaries.',
                    },
                  ],
                },
              ],
            },
          },
          rows: [],
          inline: null,
        },
      ],
    },
  ],
  version: 1,
};

export default function React19FeaturesExample() {
  const [value, setValue] = useState<Value>(SAMPLE_VALUE);

  return (
    <PageLayout>
      <style>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <Editor cellPlugins={cellPlugins} value={value} onChange={setValue} />

      <div style={{ marginTop: 32 }}>
        <AsyncDataSection />
        <CommentSystem />

        <div
          style={{
            padding: 16,
            backgroundColor: '#e7f3ff',
            border: '1px solid #b3d7ff',
            borderRadius: 8,
          }}
        >
          <h3>React 19 Features Demonstrated:</h3>
          <ul>
            <li>
              <strong>use() hook:</strong> Replaces useEffect + useState for
              async data fetching
            </li>
            <li>
              <strong>useOptimistic:</strong> Provides optimistic updates for
              better UX
            </li>
            <li>
              <strong>useActionState:</strong> Handles form submissions with
              built-in state management
            </li>
            <li>
              <strong>Enhanced Suspense:</strong> Better async component
              boundaries
            </li>
            <li>
              <strong>useTransition:</strong> Non-blocking state updates for
              smooth interactions
            </li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}
