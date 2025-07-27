import React, { useState, useTransition } from 'react';

export type Field = {
  name: string;
  label: string;
  required?: boolean;
  type: 'text' | 'number';
};

type FormSubmission = {
  id: string;
  recipientId: string;
  data: Record<string, string>;
  timestamp: Date;
  status: 'pending' | 'success' | 'error';
};

// Simulated async form submission function
const submitContactForm = async (
  formData: FormData,
  recipientId: string
): Promise<FormSubmission> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const data = Object.fromEntries(formData.entries()) as Record<string, string>;

  // Simulate occasional errors
  if (Math.random() < 0.1) {
    throw new Error('Network error: Failed to submit form');
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    recipientId,
    data,
    timestamp: new Date(),
    status: 'success',
  };
};

const ContactFormExample: React.FC<{
  recipientId: string;
  fields: Field[];
}> = ({ fields = [], recipientId }) => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(
    null
  );

  // Simulate React 19's useOptimistic behavior
  const [optimisticSubmissions, setOptimisticSubmissions] = useState<
    FormSubmission[]
  >([]);

  const addOptimisticSubmission = (submission: FormSubmission) => {
    setOptimisticSubmissions((prev) => [...prev, submission]);
  };

  const removeOptimisticSubmission = (id: string) => {
    setOptimisticSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  const allSubmissions = [...submissions, ...optimisticSubmissions];

  // Form submission handler (simulating React 19's useActionState)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setMessageType(null);

    const formData = new FormData(e.currentTarget);
    const submissionData = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;

    // Create optimistic submission
    const optimisticSubmission: FormSubmission = {
      id: Math.random().toString(36).substr(2, 9),
      recipientId,
      data: submissionData,
      timestamp: new Date(),
      status: 'pending',
    };

    // Add optimistic update
    startTransition(() => {
      addOptimisticSubmission(optimisticSubmission);
    });

    try {
      const result = await submitContactForm(formData, recipientId);

      // Update with actual result
      setSubmissions((prev) => [...prev, result]);
      removeOptimisticSubmission(optimisticSubmission.id);

      setMessage(`Form submitted successfully to ${recipientId}!`);
      setMessageType('success');

      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      // Remove optimistic submission on error
      removeOptimisticSubmission(optimisticSubmission.id);

      setMessage(
        error instanceof Error ? error.message : 'Failed to submit form'
      );
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ border: '1px solid black', padding: 10 }}>
      <form onSubmit={handleSubmit}>
        {fields.map((field, index) => (
          <label key={field.name ?? index}>
            {field.label} {field.required ? '*' : ''}
            <br />
            <input
              type={field.type}
              required={field.required}
              name={field.name}
              disabled={isSubmitting || isPending}
            />
            <br />
          </label>
        ))}
        <button type="submit" disabled={isSubmitting || isPending}>
          {isSubmitting || isPending ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {/* Status message */}
      {message && (
        <div
          style={{
            marginTop: 10,
            padding: 8,
            backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
            color: messageType === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: 4,
          }}
        >
          {message}
        </div>
      )}

      {/* Submission history with optimistic updates */}
      {allSubmissions.length > 0 && (
        <div style={{ marginTop: 15 }}>
          <h4>Recent Submissions ({allSubmissions.length}):</h4>
          {allSubmissions.slice(-3).map((submission) => (
            <div
              key={submission.id}
              style={{
                marginBottom: 8,
                padding: 8,
                backgroundColor:
                  submission.status === 'pending' ? '#fff3cd' : '#d4edda',
                border: `1px solid ${submission.status === 'pending' ? '#ffeaa7' : '#c3e6cb'}`,
                borderRadius: 4,
                opacity: submission.status === 'pending' ? 0.7 : 1,
              }}
            >
              <strong>Status:</strong>{' '}
              {submission.status === 'pending' ? 'Submitting...' : 'Submitted'}
              <br />
              <strong>To:</strong> {submission.recipientId}
              <br />
              <strong>Data:</strong>{' '}
              {Object.entries(submission.data)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactFormExample;
