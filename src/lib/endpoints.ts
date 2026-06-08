export type EndpointParam = {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  required: boolean;
  description: string;
};

export interface EndpointDefinition {
  slug: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  params?: EndpointParam[];
  example?: any;
}

export const ENDPOINTS: EndpointDefinition[] = [
  {
    slug: 'hello',
    name: 'Hello',
    method: 'GET',
    path: '/api/hello',
    description: 'Returns a friendly greeting.'
  },
  {
    slug: 'echo',
    name: 'Echo',
    method: 'POST',
    path: '/api/echo',
    description: 'Echoes back the provided message.',
    params: [
      {
        name: 'message',
        type: 'string',
        required: true,
        description: 'The message to echo back.'
      }
    ],
    example: { message: 'Hello world' }
  },
  {
    slug: 'agent-run',
    name: 'Agent Run',
    method: 'POST',
    path: '/api/agent/run',
    description: 'Simulates running an agent with a task.',
    params: [
      {
        name: 'task',
        type: 'string',
        required: true,
        description: 'Description of the task for the agent.'
      },
      {
        name: 'max_steps',
        type: 'number',
        required: false,
        description: 'Maximum number of steps for the agent.'
      }
    ],
    example: { task: 'Translate text', max_steps: 3 }
  }
];