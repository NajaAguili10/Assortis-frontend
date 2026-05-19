import { apiClient } from '../api/apiClient';
import { CreateTaskPayload, TaskDTO, TaskKPIsDTO } from '../types/project.dto';

export const taskService = {
  getTasks: async (projectId?: string): Promise<TaskDTO[]> => {
    const params = projectId ? { projectId } : undefined;
    return await apiClient.get<TaskDTO[]>('/projects/tasks', params);
  },

  getTaskKPIs: async (projectId?: string): Promise<TaskKPIsDTO> => {
    const params = projectId ? { projectId } : undefined;
    return await apiClient.get<TaskKPIsDTO>('/projects/tasks/kpis', params);
  },

  createTask: async (payload: CreateTaskPayload): Promise<TaskDTO> => {
    return await apiClient.post<TaskDTO>('/projects/tasks', payload);
  },
};
